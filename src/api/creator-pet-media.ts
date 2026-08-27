import { getDb } from '@/db';
import { petActionUploadedSource, petFile, petMedia } from '@/db/schema';
import { DEFAULT_BUCKET_STORAGE_PROVIDER } from '@/lib/storage/bucket-file';
import {
  deleteObject,
  getObject,
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
  headObject,
} from '@/lib/storage/r2-s3';
import { sessionApiMiddleware } from '@/middlewares/session-api-middleware';
import { assertUserManagesPet } from '@/server/pets/assert-user-manages-pet';
import { listPetMedia } from '@/server/pets/list-pet-media';
import {
  PET_MEDIA_MAX_FILE_SIZE,
  PET_MEDIA_THUMBNAIL_MIME_TYPE,
} from '@/utils/constants';
import {
  buildPetFileKey,
  buildPetFileThumbnailKey,
  extensionForMime,
  isPetFileKey,
  isPetFileThumbnailKey,
  petFileKindFromMime,
} from '@/utils/pets/pet-file-storage';
import { ConfigurationError, StorageError } from '@/storage/types';
import { createServerFn } from '@tanstack/react-start';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const CREATOR_MEDIA_UPLOAD_TTL_SECONDS = 15 * 60;
const DOWNLOAD_URL_TTL_SECONDS = 60 * 60;

const creatorImageMimeSchema = z.enum([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function storageErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ConfigurationError) {
    return 'Storage is not configured. Check R2_* environment variables.';
  }
  if (error instanceof StorageError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

async function verifyUploadedObject(input: {
  key: string;
  byteSize: number;
  label: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const head = await headObject(input.key);
    if (head.contentLength != null) {
      if (head.contentLength <= 0) {
        return { success: false, error: `${input.label} is empty.` };
      }
      if (head.contentLength > PET_MEDIA_MAX_FILE_SIZE) {
        return {
          success: false,
          error: `${input.label} exceeds the server limit.`,
        };
      }
      if (head.contentLength !== input.byteSize) {
        return { success: false, error: `${input.label} size mismatch.` };
      }
    }

    const object = await getObject(input.key);
    if (object.body.byteLength !== input.byteSize) {
      return { success: false, error: `${input.label} size mismatch.` };
    }

    return { success: true };
  } catch (error) {
    console.error(`verify ${input.label} error:`, error);
    return {
      success: false,
      error: storageErrorMessage(error, `Failed to verify ${input.label}.`),
    };
  }
}

const createCreatorPetMediaUploadSchema = z.object({
  petId: z.string().uuid(),
  contentType: creatorImageMimeSchema,
  byteSize: z.number().int().positive().max(PET_MEDIA_MAX_FILE_SIZE),
  thumbnailByteSize: z.number().int().positive().max(PET_MEDIA_MAX_FILE_SIZE),
  filename: z.string().min(1).max(255).optional(),
  width: z.number().int().positive().max(20_000).optional(),
  height: z.number().int().positive().max(20_000).optional(),
});

export const createCreatorPetMediaUploadFn = createServerFn({ method: 'POST' })
  .validator(createCreatorPetMediaUploadSchema)
  .middleware([sessionApiMiddleware])
  .handler(async ({ data, context }) => {
    try {
      await assertUserManagesPet(context.userId, data.petId);
    } catch {
      return { success: false as const, error: 'Pet not found.' };
    }

    if (petFileKindFromMime(data.contentType) !== 'image') {
      return { success: false as const, error: 'Unsupported media type.' };
    }

    const fileId = crypto.randomUUID();
    const mediaId = crypto.randomUUID();
    const objectKey = buildPetFileKey({
      petId: data.petId,
      fileId,
      extension: extensionForMime(data.contentType),
    });
    const thumbnailKey = buildPetFileThumbnailKey({
      petId: data.petId,
      fileId,
    });

    try {
      const [originalUploadUrl, thumbnailUploadUrl] = await Promise.all([
        getPresignedUploadUrl({
          key: objectKey,
          contentType: data.contentType,
          expiresIn: CREATOR_MEDIA_UPLOAD_TTL_SECONDS,
        }),
        getPresignedUploadUrl({
          key: thumbnailKey,
          contentType: PET_MEDIA_THUMBNAIL_MIME_TYPE,
          expiresIn: CREATOR_MEDIA_UPLOAD_TTL_SECONDS,
        }),
      ]);

      return {
        success: true as const,
        data: {
          mediaId,
          fileId,
          original: {
            key: objectKey,
            uploadUrl: originalUploadUrl,
            contentType: data.contentType,
          },
          thumbnail: {
            key: thumbnailKey,
            uploadUrl: thumbnailUploadUrl,
            contentType: PET_MEDIA_THUMBNAIL_MIME_TYPE,
          },
        },
      };
    } catch (error) {
      console.error('createCreatorPetMediaUploadFn error:', error);
      return {
        success: false as const,
        error: storageErrorMessage(error, 'Failed to create media upload.'),
      };
    }
  });

const completeCreatorPetMediaUploadSchema = z.object({
  petId: z.string().uuid(),
  mediaId: z.string().uuid(),
  fileId: z.string().uuid(),
  objectKey: z.string().min(1).max(500),
  thumbnailKey: z.string().min(1).max(500),
  contentType: creatorImageMimeSchema,
  byteSize: z.number().int().positive().max(PET_MEDIA_MAX_FILE_SIZE),
  thumbnailByteSize: z.number().int().positive().max(PET_MEDIA_MAX_FILE_SIZE),
  filename: z.string().min(1).max(255).optional().nullable(),
  width: z.number().int().positive().max(20_000).optional().nullable(),
  height: z.number().int().positive().max(20_000).optional().nullable(),
  capturedAt: z.string().datetime().optional().nullable(),
});

export const completeCreatorPetMediaUploadFn = createServerFn({
  method: 'POST',
})
  .validator(completeCreatorPetMediaUploadSchema)
  .middleware([sessionApiMiddleware])
  .handler(async ({ data, context }) => {
    try {
      await assertUserManagesPet(context.userId, data.petId);
    } catch {
      return { success: false as const, error: 'Pet not found.' };
    }

    if (
      !isPetFileKey(data.objectKey, {
        petId: data.petId,
        fileId: data.fileId,
      }) ||
      !isPetFileThumbnailKey(data.thumbnailKey, {
        petId: data.petId,
        fileId: data.fileId,
      })
    ) {
      return { success: false as const, error: 'Invalid media keys.' };
    }

    const originalCheck = await verifyUploadedObject({
      key: data.objectKey,
      byteSize: data.byteSize,
      label: 'Original',
    });
    if (!originalCheck.success) {
      return originalCheck;
    }

    const thumbnailCheck = await verifyUploadedObject({
      key: data.thumbnailKey,
      byteSize: data.thumbnailByteSize,
      label: 'Thumbnail',
    });
    if (!thumbnailCheck.success) {
      try {
        await deleteObject(data.objectKey);
      } catch (error) {
        console.error(
          'Failed to clean up original after thumbnail fail:',
          error
        );
      }
      return thumbnailCheck;
    }

    try {
      const db = getDb();
      const now = new Date();

      await db.insert(petFile).values({
        id: data.fileId,
        petId: data.petId,
        createdBy: context.userId,
        kind: 'image',
        purpose: 'gallery',
        file: {
          key: data.objectKey,
          mimeType: data.contentType,
          size: data.byteSize,
          provider: DEFAULT_BUCKET_STORAGE_PROVIDER,
        },
        thumbnailFile: {
          key: data.thumbnailKey,
          mimeType: PET_MEDIA_THUMBNAIL_MIME_TYPE,
          size: data.thumbnailByteSize,
          provider: DEFAULT_BUCKET_STORAGE_PROVIDER,
        },
        filename: data.filename ?? null,
        width: data.width ?? null,
        height: data.height ?? null,
        createdAt: now,
        updatedAt: now,
      });

      const [mediaRow] = await db
        .insert(petMedia)
        .values({
          id: data.mediaId,
          petId: data.petId,
          createdBy: context.userId,
          fileId: data.fileId,
          source: 'upload',
          caption: null,
          capturedAt: data.capturedAt ? new Date(data.capturedAt) : null,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: petMedia.id });

      if (!mediaRow) {
        throw new Error('Failed to create media row.');
      }

      const sourceId = crypto.randomUUID();
      const [sourceRow] = await db
        .insert(petActionUploadedSource)
        .values({
          id: sourceId,
          petId: data.petId,
          createdBy: context.userId,
          fileId: data.fileId,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: petActionUploadedSource.id });

      if (!sourceRow) {
        throw new Error('Failed to create action source row.');
      }

      const [originalUrl, thumbnailUrl] = await Promise.all([
        getPresignedDownloadUrl({
          key: data.objectKey,
          expiresIn: DOWNLOAD_URL_TTL_SECONDS,
        }),
        getPresignedDownloadUrl({
          key: data.thumbnailKey,
          expiresIn: DOWNLOAD_URL_TTL_SECONDS,
        }),
      ]);

      return {
        success: true as const,
        data: {
          mediaId: mediaRow.id,
          uploadedSourceId: sourceRow.id,
          fileId: data.fileId,
          url: originalUrl,
          thumbnailUrl,
          filename: data.filename ?? null,
        },
      };
    } catch (error) {
      console.error('completeCreatorPetMediaUploadFn insert error:', error);
      try {
        await Promise.all([
          deleteObject(data.objectKey),
          deleteObject(data.thumbnailKey),
        ]);
      } catch (cleanupError) {
        console.error('Failed to clean up media objects:', cleanupError);
      }
      return {
        success: false as const,
        error: storageErrorMessage(error, 'Failed to save media.'),
      };
    }
  });

const listCreatorPetMediaSchema = z.object({
  petId: z.string().uuid(),
});

export const listCreatorPetMediaFn = createServerFn({ method: 'GET' })
  .validator(listCreatorPetMediaSchema)
  .middleware([sessionApiMiddleware])
  .handler(async ({ data, context }) => {
    try {
      const items = await listPetMedia({
        userId: context.userId,
        petId: data.petId,
        kind: 'photo',
      });
      return {
        success: true as const,
        data: {
          items: items.map((item) => ({
            id: item.id,
            fileId: item.fileId,
            filename: item.filename,
            url: item.originalUrl,
            thumbnailUrl: item.thumbnailUrl,
            width: item.width,
            height: item.height,
            createdAt: item.createdAt.toISOString(),
          })),
        },
      };
    } catch (error) {
      console.error('listCreatorPetMediaFn error:', error);
      return {
        success: false as const,
        error:
          error instanceof Error && error.message === 'Pet not found'
            ? 'Pet not found.'
            : 'Failed to load media.',
      };
    }
  });

const deleteCreatorPetMediaSchema = z.object({
  mediaId: z.string().uuid(),
});

export const deleteCreatorPetMediaFn = createServerFn({ method: 'POST' })
  .validator(deleteCreatorPetMediaSchema)
  .middleware([sessionApiMiddleware])
  .handler(async ({ data, context }) => {
    const db = getDb();
    const [row] = await db
      .select({
        id: petMedia.id,
        petId: petMedia.petId,
        fileId: petMedia.fileId,
        file: petFile.file,
        thumbnailFile: petFile.thumbnailFile,
      })
      .from(petMedia)
      .innerJoin(petFile, eq(petMedia.fileId, petFile.id))
      .where(eq(petMedia.id, data.mediaId))
      .limit(1);

    if (!row) {
      return { success: false as const, error: 'Media not found.' };
    }

    try {
      await assertUserManagesPet(context.userId, row.petId);
    } catch {
      return { success: false as const, error: 'Pet not found.' };
    }

    await db
      .delete(petActionUploadedSource)
      .where(
        and(
          eq(petActionUploadedSource.petId, row.petId),
          eq(petActionUploadedSource.fileId, row.fileId)
        )
      );
    await db.delete(petMedia).where(eq(petMedia.id, row.id));
    await db.delete(petFile).where(eq(petFile.id, row.fileId));

    try {
      const deletes = [deleteObject(row.file.key)];
      if (row.thumbnailFile) {
        deletes.push(deleteObject(row.thumbnailFile.key));
      }
      await Promise.all(deletes);
    } catch (error) {
      console.error('Failed to delete creator media objects:', error);
    }

    return { success: true as const, data: { mediaId: row.id } };
  });
