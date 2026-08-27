import { getBaseUrl } from '@/lib/urls';
import {
  deleteObject,
  getPresignedUploadUrl,
} from '@/lib/storage/r2-s3';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { createPetFromDraft } from '@/server/pets/create-pet-from-draft';
import { listHeroPets } from '@/pets/catalog';
import { HERO_PET_PREVIEW_COUNT } from '@/utils/showcase-pets';
import {
  buildPetMakerStagingKey,
  isPetMakerStagingKeyForDraft,
  isUuid,
} from '@/utils/pets/pet-maker-storage-keys';
import { PET_MEDIA_MAX_FILE_SIZE } from '@/utils/constants';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

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

const stagingUploadSchema = z.object({
  draftId: z.string().refine(isUuid, 'Invalid draft id'),
  fileId: z.string().refine(isUuid, 'Invalid file id'),
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  byteSize: z.number().int().positive().max(PET_MEDIA_MAX_FILE_SIZE),
});

export const getPetMakerStagingUploadUrlFn = createServerFn({ method: 'POST' })
  .validator(stagingUploadSchema)
  .handler(async ({ data }) => {
    const extension = extensionForContentType(data.contentType);
    const r2Key = buildPetMakerStagingKey({
      draftId: data.draftId,
      fileId: data.fileId,
      extension,
    });
    const uploadUrl = await getPresignedUploadUrl({
      key: r2Key,
      contentType: data.contentType,
    });
    const requestOrigin = getBaseUrl();
    const previewUrl = `${requestOrigin}/api/storage/file?key=${encodeURIComponent(r2Key)}`;
    return { uploadUrl, r2Key, previewUrl, contentType: data.contentType };
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

const createPetSchema = z.object({
  draftId: z.string().refine(isUuid, 'Invalid draft id'),
  petName: z.string().trim().min(1).max(120),
  species: z.string().trim().min(1).max(64),
  breed: z.string().trim().min(1).max(120),
  sex: z.string().trim().max(32).nullable(),
  avatarKey: z.string().nullable(),
  photoKeys: z.array(z.string()).min(1).max(8),
});

export const createPetFn = createServerFn({ method: 'POST' })
  .validator(createPetSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const result = await createPetFromDraft({
      userId,
      draftId: data.draftId,
      petName: data.petName,
      species: data.species,
      breed: data.breed,
      sex: data.sex,
      avatarKey: data.avatarKey,
      photoKeys: data.photoKeys,
    });
    return { petId: result.petId };
  });

export const loadDesktopPetMakerPageDataFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const heroPets = await listHeroPets(HERO_PET_PREVIEW_COUNT);
  return { heroPets };
});

export const listUserPetsFn = createServerFn({ method: 'GET' })
  .middleware([authApiMiddleware])
  .handler(async ({ context }) => {
    const { getDb } = await import('@/db');
    const { pet } = await import('@/db/app.schema');
    const { desc, eq } = await import('drizzle-orm');
    const db = getDb();
    const rows = await db
      .select({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        createdAt: pet.createdAt,
      })
      .from(pet)
      .where(eq(pet.userId, context.userId))
      .orderBy(desc(pet.createdAt))
      .limit(20);
    return { pets: rows };
  });
