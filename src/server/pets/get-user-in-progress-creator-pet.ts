import { getDb } from '@/db';
import { pet, userPet } from '@/db/schema';
import type { CreatorRecognitionCache } from '@/types/creator-recognition';
import { asCreatorRecognitionCache } from '@/utils/pets/creator-recognition';
import {
  isCreatorInProgress,
  PET_CREATOR_IN_PROGRESS_STATUSES,
} from '@/utils/pets/pet-creation-status';
import { and, eq, inArray } from 'drizzle-orm';

export type UserInProgressCreatorPet = {
  petId: string;
  userPetId: string;
  name: string;
  species: string;
  breed: string;
  sex: string | null;
  avatar: string | null;
  creationStatus: (typeof PET_CREATOR_IN_PROGRESS_STATUSES)[number];
  creatorRecognition: CreatorRecognitionCache | null;
  createdAt: Date;
  updatedAt: Date;
};

function parseCreatorRecognition(
  value: string | null
): CreatorRecognitionCache | null {
  if (!value) return null;
  try {
    return asCreatorRecognitionCache(JSON.parse(value));
  } catch {
    return null;
  }
}

/** Return the user's single in-progress creator pet, if any. */
export async function getUserInProgressCreatorPet(input: {
  userId: string;
}): Promise<UserInProgressCreatorPet | null> {
  const db = getDb();
  const [row] = await db
    .select({
      petId: pet.id,
      userPetId: userPet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      sex: pet.sex,
      avatar: pet.avatar,
      creationStatus: pet.creationStatus,
      creatorRecognition: pet.creatorRecognition,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
    })
    .from(userPet)
    .innerJoin(pet, eq(userPet.petId, pet.id))
    .where(
      and(
        eq(userPet.userId, input.userId),
        inArray(pet.creationStatus, [...PET_CREATOR_IN_PROGRESS_STATUSES])
      )
    )
    .limit(1);

  if (!row || !isCreatorInProgress(row.creationStatus)) return null;

  return {
    petId: row.petId,
    userPetId: row.userPetId,
    name: row.name,
    species: row.species,
    breed: row.breed,
    sex: row.sex ?? null,
    avatar: row.avatar ?? null,
    creationStatus: row.creationStatus,
    creatorRecognition: parseCreatorRecognition(row.creatorRecognition),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
