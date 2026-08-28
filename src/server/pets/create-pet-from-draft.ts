import { getDb } from '@/db';
import { pet } from '@/db/pet.schema';
import { copyObject, deleteObject } from '@/lib/storage/r2-s3';
import type { CreatorRecognitionCache } from '@/types/creator-recognition';
import {
  buildPetMakerFinalKey,
  buildPetMakerFinalThumbnailKey,
  extensionFromKey,
  fileIdFromKey,
  isPetMakerStagingKeyForDraft,
} from '@/utils/pets/pet-maker-storage-keys';
import { PetCreationStatus } from '@/utils/pets/pet-creation-status';
import {
  normalizePetPhotoEntries,
  petPhotoOwnedKeys,
  type PetPhotoEntry,
} from '@/utils/pets/pet-photo-entries';
import { eq } from 'drizzle-orm';

export type CreatePetFromDraftPhoto = {
  key: string;
  thumbnailKey: string | null;
};

export type CreatePetFromDraftInput = {
  userId: string;
  draftId: string;
  petName: string;
  species: string;
  breed: string;
  sex: string | null;
  avatarKey: string | null;
  photos: CreatePetFromDraftPhoto[];
  creatorRecognition?: CreatorRecognitionCache | null;
};

export type CreatePetFromDraftResult = {
  petId: string;
  finalPhotos: PetPhotoEntry[];
  finalAvatarKey: string | null;
};

function assertStagingKeysForDraft(draftId: string, keys: string[]): void {
  for (const key of keys) {
    if (!isPetMakerStagingKeyForDraft(key, draftId)) {
      throw new Error(`Invalid staging key for draft: ${key}`);
    }
  }
}

export async function createPetFromDraft(
  input: CreatePetFromDraftInput
): Promise<CreatePetFromDraftResult> {
  if (input.photos.length === 0) {
    throw new Error('At least one photo is required.');
  }

  const stagingKeys = [
    ...input.photos.flatMap((photo) =>
      photo.thumbnailKey ? [photo.key, photo.thumbnailKey] : [photo.key]
    ),
    ...(input.avatarKey ? [input.avatarKey] : []),
  ];
  assertStagingKeysForDraft(input.draftId, stagingKeys);

  const petId = globalThis.crypto.randomUUID();
  const now = new Date();
  const finalPhotos: PetPhotoEntry[] = [];

  for (const photo of input.photos) {
    const fileId = fileIdFromKey(photo.key);
    const ext = extensionFromKey(photo.key);
    const finalKey = buildPetMakerFinalKey({
      userId: input.userId,
      petId,
      fileId,
      extension: ext,
    });
    await copyObject({ sourceKey: photo.key, destinationKey: finalKey });

    let finalThumbnailKey: string | null = null;
    if (photo.thumbnailKey) {
      finalThumbnailKey = buildPetMakerFinalThumbnailKey({
        userId: input.userId,
        petId,
        fileId,
      });
      await copyObject({
        sourceKey: photo.thumbnailKey,
        destinationKey: finalThumbnailKey,
      });
    }

    finalPhotos.push({
      key: finalKey,
      thumbnailKey: finalThumbnailKey,
    });
  }

  let finalAvatarKey: string | null = null;
  if (input.avatarKey) {
    const fileId = fileIdFromKey(input.avatarKey);
    const ext = extensionFromKey(input.avatarKey);
    finalAvatarKey = buildPetMakerFinalKey({
      userId: input.userId,
      petId,
      fileId,
      extension: ext,
    });
    await copyObject({
      sourceKey: input.avatarKey,
      destinationKey: finalAvatarKey,
    });
  }

  const db = getDb();
  await db.insert(pet).values({
    id: petId,
    userId: input.userId,
    name: input.petName,
    species: input.species,
    breed: input.breed,
    sex: input.sex,
    avatar: finalAvatarKey,
    photoKeys: finalPhotos,
    creatorRecognition: input.creatorRecognition ?? null,
    status: PetCreationStatus.ProfileCreated,
    createdAt: now,
    updatedAt: now,
  });

  for (const stagingKey of stagingKeys) {
    try {
      await deleteObject(stagingKey);
    } catch {
      // Best-effort staging cleanup.
    }
  }

  return { petId, finalPhotos, finalAvatarKey };
}

export async function userOwnsStorageKey(
  userId: string,
  key: string
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: pet.id, avatar: pet.avatar, photoKeys: pet.photoKeys })
    .from(pet)
    .where(eq(pet.userId, userId));

  for (const row of rows) {
    if (row.avatar === key) return true;
    const owned = petPhotoOwnedKeys(normalizePetPhotoEntries(row.photoKeys));
    if (owned.includes(key)) return true;
  }
  return false;
}
