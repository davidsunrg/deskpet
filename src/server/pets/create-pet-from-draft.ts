import { getDb } from '@/db';
import { pet } from '@/db/pet.schema';
import { copyObject, deleteObject } from '@/lib/storage/r2-s3';
import type { CreatorRecognitionCache } from '@/types/creator-recognition';
import {
  buildPetMakerFinalKey,
  extensionFromKey,
  fileIdFromKey,
  isPetMakerStagingKeyForDraft,
} from '@/utils/pets/pet-maker-storage-keys';
import { PetCreationStatus } from '@/utils/pets/pet-creation-status';
import { eq } from 'drizzle-orm';

export type CreatePetFromDraftInput = {
  userId: string;
  draftId: string;
  petName: string;
  species: string;
  breed: string;
  sex: string | null;
  avatarKey: string | null;
  photoKeys: string[];
  creatorRecognition?: CreatorRecognitionCache | null;
};

export type CreatePetFromDraftResult = {
  petId: string;
  finalPhotoKeys: string[];
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
  const allStagingKeys = [
    ...input.photoKeys,
    ...(input.avatarKey ? [input.avatarKey] : []),
  ];
  assertStagingKeysForDraft(input.draftId, allStagingKeys);

  const petId = globalThis.crypto.randomUUID();
  const now = new Date();
  const finalPhotoKeys: string[] = [];

  for (const stagingKey of input.photoKeys) {
    const fileId = fileIdFromKey(stagingKey);
    const ext = extensionFromKey(stagingKey);
    const finalKey = buildPetMakerFinalKey({
      userId: input.userId,
      petId,
      fileId,
      extension: ext,
    });
    await copyObject({ sourceKey: stagingKey, destinationKey: finalKey });
    finalPhotoKeys.push(finalKey);
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
    photoKeys: finalPhotoKeys,
    creatorRecognition: input.creatorRecognition ?? null,
    status: PetCreationStatus.ProfileCreated,
    createdAt: now,
    updatedAt: now,
  });

  for (const stagingKey of allStagingKeys) {
    try {
      await deleteObject(stagingKey);
    } catch {
      // Best-effort staging cleanup.
    }
  }

  return { petId, finalPhotoKeys, finalAvatarKey };
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
    if (row.photoKeys.includes(key)) return true;
  }
  return false;
}
