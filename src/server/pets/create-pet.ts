import { getDb } from '@/db';
import { pet, userPet } from '@/db/schema';
import {
  createUniquePetHandle,
  isPetHandleUniqueViolation,
} from '@/server/pets/create-unique-pet-handle';
import {
  isPetBreedForSpecies,
  isPetSpecies,
  PetSex,
  type PetBreed,
  type PetSpecies,
} from '@/utils/pet-catalog';
import {
  isPetCreationStatus,
  PetCreationStatus,
  type PetCreationStatus as PetCreationStatusValue,
} from '@/utils/pets/pet-creation-status';
import { and, eq } from 'drizzle-orm';

export type CreatePetInput = {
  userId: string;
  name: string;
  species: PetSpecies;
  breed: PetBreed;
  sex: PetSex;
  avatar?: string | null;
  isPreset?: boolean;
  creationStatus?: PetCreationStatusValue;
};

export type CreatePetResult = {
  petId: string;
  userPetId: string;
};

const MAX_HANDLE_INSERT_ATTEMPTS = 8;

export async function createPet({
  userId,
  name,
  species,
  breed,
  sex,
  avatar,
  isPreset = false,
  creationStatus = PetCreationStatus.ProfileCreated,
}: CreatePetInput): Promise<CreatePetResult> {
  const nickname = name.trim();
  if (!nickname) {
    throw new Error('Pet name is required');
  }
  if (!isPetSpecies(species)) {
    throw new Error('Pet species is required');
  }
  if (!isPetBreedForSpecies(species, breed)) {
    throw new Error('Pet breed is required');
  }
  if (sex !== PetSex.Male && sex !== PetSex.Female) {
    throw new Error('Pet sex is required');
  }
  if (!isPetCreationStatus(creationStatus)) {
    throw new Error('Invalid pet creation status');
  }

  const avatarUrl = avatar?.trim() || null;
  const db = getDb();

  return db.transaction(async (tx) => {
    const now = new Date();

    if (isPreset) {
      const [presetBreedConflict] = await tx
        .select({ id: pet.id })
        .from(pet)
        .where(and(eq(pet.isPreset, true), eq(pet.breed, breed)))
        .limit(1);

      if (presetBreedConflict) {
        throw new Error(
          'Another preset pet already uses this breed. Only one preset per breed is allowed.'
        );
      }
    }

    let createdPet: { id: string } | undefined;
    for (let attempt = 0; attempt < MAX_HANDLE_INSERT_ATTEMPTS; attempt += 1) {
      const handle = await createUniquePetHandle({ tx, name: nickname });
      try {
        const petId = crypto.randomUUID();
        await tx.insert(pet).values({
          id: petId,
          handle,
          name: nickname,
          breed,
          species,
          sex,
          avatar: avatarUrl,
          isPreset,
          creationStatus,
          templateId: null,
          createdAt: now,
          updatedAt: now,
        });
        createdPet = { id: petId };
        break;
      } catch (error) {
        if (
          isPetHandleUniqueViolation(error) &&
          attempt < MAX_HANDLE_INSERT_ATTEMPTS - 1
        ) {
          continue;
        }
        throw error;
      }
    }

    if (!createdPet) {
      throw new Error('Failed to create pet');
    }

    await tx
      .update(userPet)
      .set({ enabled: false, updatedAt: now })
      .where(eq(userPet.userId, userId));

    const userPetId = crypto.randomUUID();
    await tx.insert(userPet).values({
      id: userPetId,
      userId,
      petId: createdPet.id,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      petId: createdPet.id,
      userPetId,
    };
  });
}
