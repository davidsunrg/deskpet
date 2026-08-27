import { getDb } from '@/db';
import { pet, userPet } from '@/db/schema';
import {
  createUniquePetHandle,
  isPetHandleUniqueViolation,
} from '@/server/pets/create-unique-pet-handle';
import { getUserInProgressCreatorPet } from '@/server/pets/get-user-in-progress-creator-pet';
import { PetBreed, PetSpecies } from '@/utils/pet-catalog';
import {
  PetCreationStatus,
  PROVISIONAL_CREATOR_PET_NAME,
} from '@/utils/pets/pet-creation-status';
import { eq } from 'drizzle-orm';

export type ProvisionalCreatorPet = {
  petId: string;
  userPetId: string;
  created: boolean;
};

const MAX_HANDLE_INSERT_ATTEMPTS = 8;

/** Create or return the user's provisional creator draft. */
export async function ensureProvisionalCreatorPet(input: {
  userId: string;
}): Promise<ProvisionalCreatorPet> {
  const existing = await getUserInProgressCreatorPet({ userId: input.userId });
  if (existing) {
    return {
      petId: existing.petId,
      userPetId: existing.userPetId,
      created: false,
    };
  }

  const db = getDb();
  const now = new Date();

  return db.transaction(async (tx) => {
    let createdPet: { id: string } | undefined;
    for (let attempt = 0; attempt < MAX_HANDLE_INSERT_ATTEMPTS; attempt += 1) {
      const handle = await createUniquePetHandle({
        tx,
        name: PROVISIONAL_CREATOR_PET_NAME,
      });
      try {
        const [row] = await tx
          .insert(pet)
          .values({
            handle,
            name: PROVISIONAL_CREATOR_PET_NAME,
            breed: PetBreed.Any,
            species: PetSpecies.Cat,
            sex: null,
            avatar: null,
            isPreset: false,
            creationStatus: PetCreationStatus.PhotosUploaded,
            templateId: null,
            createdAt: now,
            updatedAt: now,
          })
          .returning({ id: pet.id });
        createdPet = row;
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
      throw new Error('Failed to create draft pet');
    }

    await tx
      .update(userPet)
      .set({ enabled: false, updatedAt: now })
      .where(eq(userPet.userId, input.userId));

    const [createdLink] = await tx
      .insert(userPet)
      .values({
        userId: input.userId,
        petId: createdPet.id,
        enabled: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: userPet.id });

    if (!createdLink) {
      throw new Error('Failed to link draft pet');
    }

    return {
      petId: createdPet.id,
      userPetId: createdLink.id,
      created: true,
    };
  });
}
