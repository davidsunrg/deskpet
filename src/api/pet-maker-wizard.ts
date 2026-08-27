import { getDb } from '@/db';
import { userFiles } from '@/db/app.schema';
import { getBaseUrl } from '@/lib/urls';
import { sessionApiMiddleware } from '@/middlewares/session-api-middleware';
import { uploadFile } from '@/storage';
import { StorageError, UploadError } from '@/storage/types';
import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq, like } from 'drizzle-orm';
import { z } from 'zod';
import { listHeroPets } from '@/pets/catalog';
import {
  isPetMakerPhotoDescription,
  parsePetMakerPhotoDescription,
} from '@/utils/pets/pet-maker-file-meta';
import type { CreatorWizardInitialDraft } from '@/utils/pets/creator-wizard-initial-draft';
import { HERO_PET_PREVIEW_COUNT } from '@/utils/showcase-pets';
import { auth } from '@/auth/auth';
import { getRequestHeaders } from '@tanstack/react-start/server';

const uploadSchema = z
  .custom<FormData>((v): v is FormData => v instanceof FormData)
  .transform((fd) => {
    const file = fd.get('file');
    if (!file || !(file instanceof File)) {
      throw new Error('File not provided');
    }
    const descriptionRaw = fd.get('description');
    const description =
      typeof descriptionRaw === 'string' && descriptionRaw !== ''
        ? descriptionRaw
        : undefined;
    return { file, description };
  });

export const uploadPetMakerPhotoFn = createServerFn({ method: 'POST' })
  .validator(uploadSchema)
  .middleware([sessionApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    try {
      const buffer = Buffer.from(await data.file.arrayBuffer());
      const requestOrigin = getBaseUrl();

      const result = await uploadFile(buffer, data.file.name, data.file.type, {
        folder: 'pet-maker',
        userId,
        requestOrigin,
      });

      if (!result.metadata) {
        throw new Error('Upload metadata missing');
      }

      const db = getDb();
      const now = result.metadata.uploadedAt;
      await db.insert(userFiles).values({
        id: result.metadata.id,
        userId,
        filename: result.metadata.filename,
        originalName: result.metadata.originalName,
        contentType: result.metadata.contentType,
        size: result.metadata.size,
        r2Key: result.metadata.r2Key,
        createdAt: now,
        updatedAt: now,
        isPublic: false,
        description: data.description ?? null,
      });

      return {
        userFileId: result.metadata.id,
        url: result.url,
        r2Key: result.metadata.r2Key,
      };
    } catch (error) {
      if (error instanceof UploadError || error instanceof StorageError) {
        throw new Error(error.message);
      }
      throw new Error('Something went wrong while uploading the file');
    }
  });

const deleteSchema = z.object({ id: z.string() });

export const deletePetMakerPhotoFn = createServerFn({ method: 'POST' })
  .validator(deleteSchema)
  .middleware([sessionApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [row] = await db
      .select()
      .from(userFiles)
      .where(and(eq(userFiles.id, data.id), eq(userFiles.userId, userId)))
      .limit(1);

    if (!row || !isPetMakerPhotoDescription(row.description)) {
      throw new Error('File not found');
    }

    const { deleteFile } = await import('@/storage');
    await deleteFile(row.r2Key);
    await db.delete(userFiles).where(eq(userFiles.id, data.id));
  });

export const loadDesktopPetMakerPageDataFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  const sessionUserId = session?.user?.id ?? null;

  const heroPets = await listHeroPets(HERO_PET_PREVIEW_COUNT);
  let initialDraft: CreatorWizardInitialDraft | null = null;

  if (sessionUserId) {
    const db = getDb();
    const requestOrigin = getBaseUrl();
    const rows = await db
      .select()
      .from(userFiles)
      .where(
        and(
          eq(userFiles.userId, sessionUserId),
          like(userFiles.description, '%pet_maker_photo%')
        )
      )
      .orderBy(desc(userFiles.createdAt))
      .limit(8);

    if (rows.length > 0) {
      initialDraft = {
        petName: '',
        species: '',
        breed: '',
        sex: '',
        avatarUrl: null,
        photos: rows
          .map((row) => {
            const meta = parsePetMakerPhotoDescription(row.description);
            if (!meta) return null;
            return {
              id: meta.localId,
              name: row.originalName,
              url: `${requestOrigin}/api/storage/file?key=${encodeURIComponent(row.r2Key)}`,
              userFileId: row.id,
            };
          })
          .filter((photo): photo is NonNullable<typeof photo> => photo !== null)
          .reverse(),
        recognitionData: null,
        recognitionMediaFingerprint: null,
      };
    }
  }

  return { heroPets, initialDraft };
});
