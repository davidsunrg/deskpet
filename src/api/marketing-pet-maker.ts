import { listHeroPets } from '@/pets/catalog';
import { createPetFromDraft } from '@/server/pets/create-pet-from-draft';
import { recognizePetMakerPhotos } from '@/server/pets/recognize-pet-maker-photos';
import { deleteObject, getPresignedUploadUrl } from '@/lib/storage/r2-s3';
import { getBaseUrl } from '@/lib/urls';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import type { CreatorRecognitionCache } from '@/types/creator-recognition';
import {
  PET_MEDIA_MAX_FILE_SIZE,
  PET_MEDIA_THUMBNAIL_MIME_TYPE,
} from '@/utils/constants';
import {
  buildPetMakerStagingKey,
  buildPetMakerStagingThumbnailKey,
  isPetMakerStagingKeyForDraft,
  isUuid,
} from '@/utils/pets/pet-maker-storage-keys';
import { HERO_PET_PREVIEW_COUNT } from '@/utils/showcase-pets';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

const MAX_CREATOR_PHOTOS = 8;

function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'bin';
  }
}

const stagingUploadSchema = z
  .object({
    draftId: z.string().refine(isUuid, 'Invalid draft id'),
    fileId: z.string().refine(isUuid, 'Invalid file id'),
    contentType: z.enum(ALLOWED_CONTENT_TYPES),
    byteSize: z.number().int().positive().max(PET_MEDIA_MAX_FILE_SIZE),
    kind: z.enum(['photo', 'thumbnail']).default('photo'),
  })
  .superRefine((data, ctx) => {
    if (
      data.kind === 'thumbnail' &&
      data.contentType !== PET_MEDIA_THUMBNAIL_MIME_TYPE
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Thumbnail uploads must be image/webp',
        path: ['contentType'],
      });
    }
  });

export const getPetMakerStagingUploadUrlFn = createServerFn({ method: 'POST' })
  .validator(stagingUploadSchema)
  .handler(async ({ data }) => {
    const r2Key =
      data.kind === 'thumbnail'
        ? buildPetMakerStagingThumbnailKey({
            draftId: data.draftId,
            fileId: data.fileId,
          })
        : buildPetMakerStagingKey({
            draftId: data.draftId,
            fileId: data.fileId,
            extension: extensionForContentType(data.contentType),
          });
    const requestOrigin = getBaseUrl();
    const uploadUrl = await getPresignedUploadUrl({
      key: r2Key,
      contentType: data.contentType,
      proxyOrigin: requestOrigin,
    });
    const previewUrl = `${requestOrigin}/api/storage/file?key=${encodeURIComponent(r2Key)}`;
    return {
      uploadUrl,
      r2Key,
      previewUrl,
      contentType: data.contentType,
      kind: data.kind,
    };
  });

const stagingDeleteSchema = z.object({
  draftId: z.string().refine(isUuid, 'Invalid draft id'),
  r2Key: z.string().min(1),
});

export const deletePetMakerStagingObjectFn = createServerFn({ method: 'POST' })
  .validator(stagingDeleteSchema)
  .handler(async ({ data }) => {
    if (!isPetMakerStagingKeyForDraft(data.r2Key, data.draftId)) {
      throw new Error('Invalid staging key');
    }
    await deleteObject(data.r2Key);
  });

const creatorRecognitionCacheSchema = z.object({
  mediaIds: z.array(z.string()).min(1).max(MAX_CREATOR_PHOTOS),
  result: z.object({
    species: z.enum(['cat', 'dog', 'character', 'unknown']),
    breed: z.string().min(1).max(120),
    confidence: z.number(),
    colors: z.array(z.string()),
    markings: z.array(z.string()),
    visiblePose: z.string(),
    notes: z.string(),
    likelyBreed: z.string().optional(),
  }),
  model: z.string().min(1),
  modelLabel: z.string().min(1),
  llmLogId: z.string().nullable(),
  recognizedAt: z.string().min(1),
});

const recognizePhotosSchema = z.object({
  draftId: z.string().refine(isUuid, 'Invalid draft id'),
  photoKeys: z.array(z.string().min(1)).min(1).max(MAX_CREATOR_PHOTOS),
  model: z.string().min(1).optional(),
});

export const recognizePetMakerPhotosFn = createServerFn({ method: 'POST' })
  .validator(recognizePhotosSchema)
  .handler(async ({ data }) => {
    return recognizePetMakerPhotos({
      draftId: data.draftId,
      photoKeys: data.photoKeys,
      model: data.model,
    });
  });

const petPhotoDraftSchema = z.object({
  key: z.string().min(1),
  thumbnailKey: z.string().min(1).nullable(),
});

const createPetSchema = z.object({
  draftId: z.string().refine(isUuid, 'Invalid draft id'),
  petName: z.string().trim().min(1).max(120),
  species: z.string().trim().min(1).max(64),
  breed: z.string().trim().min(1).max(120),
  sex: z.string().trim().max(32).nullable(),
  avatarKey: z.string().nullable(),
  photos: z.array(petPhotoDraftSchema).min(1).max(MAX_CREATOR_PHOTOS),
  creatorRecognition: creatorRecognitionCacheSchema.nullable().optional(),
});

export const createPetFn = createServerFn({ method: 'POST' })
  .validator(createPetSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const result = await createPetFromDraft({
      userId: context.userId,
      draftId: data.draftId,
      petName: data.petName,
      species: data.species,
      breed: data.breed,
      sex: data.sex,
      avatarKey: data.avatarKey,
      photos: data.photos,
      creatorRecognition:
        (data.creatorRecognition as
          | CreatorRecognitionCache
          | null
          | undefined) ?? null,
    });
    return { petId: result.petId };
  });

export const loadDesktopPetMakerPageDataFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const heroPets = await listHeroPets(HERO_PET_PREVIEW_COUNT);
  return { heroPets };
});
