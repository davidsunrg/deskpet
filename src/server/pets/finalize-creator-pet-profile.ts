import { getDb } from '@/db';
import { pet, userPet } from '@/db/schema';
import { assertUserManagesPet } from '@/server/pets/assert-user-manages-pet';
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
  isCreatorInProgress,
  PetCreationStatus,
} from '@/utils/pets/pet-creation-status';
import { and, eq } from 'drizzle-orm';

export type FinalizeCreatorPetProfileInput = {
  userId: string;
  petId: string;
  name: string;
  species: PetSpecies;
  breed: PetBreed;
  sex: PetSex;
  avatar?: string | null;
};

const MAX_HANDLE_UPDATE_ATTEMPTS = 8;

export async function finalizeCreatorPetProfile({
  userId,
  petId,
  name,
  species,
  breed,
  sex,
  avatar,
}: FinalizeCreatorPetProfileInput): Promise<{
  petId: string;
  userPetId: string;
}> {
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

  await assertUserManagesPet(userId, petId);

  const db = getDb();
  const [row] = await db
    .select({
      creationStatus: pet.creationStatus,
      userPetId: userPet.id,
    })
    .from(userPet)
    .innerJoin(pet, eq(userPet.petId, pet.id))
    .where(and(eq(userPet.userId, userId), eq(userPet.petId, petId)))
    .limit(1);

  if (!row) {
    throw new Error('Pet not found');
  }
  if (!isCreatorInProgress(row.creationStatus)) {
    throw new Error('Pet is not an in-progress creator draft');
  }

  const now = new Date();
  const avatarUrl = avatar?.trim() || null;
  const nextStatus =
    row.creationStatus === PetCreationStatus.PhotosUploaded
      ? PetCreationStatus.ProfileCreated
      : row.creationStatus;

  await db.transaction(async (tx) => {
    let updated = false;
    for (let attempt = 0; attempt < MAX_HANDLE_UPDATE_ATTEMPTS; attempt += 1) {
      const handle = await createUniquePetHandle({
        tx,
        name: nickname,
        excludePetId: petId,
      });
      try {
        await tx
          .update(pet)
          .set({
            handle,
            name: nickname,
            species,
            breed,
            sex,
            ...(avatarUrl ? { avatar: avatarUrl } : {}),
            creationStatus: nextStatus,
            updatedAt: now,
          })
          .where(eq(pet.id, petId));
        updated = true;
        break;
      } catch (error) {
        if (
          isPetHandleUniqueViolation(error) &&
          attempt < MAX_HANDLE_UPDATE_ATTEMPTS - 1
        ) {
          continue;
        }
        throw error;
      }
    }

    if (!updated) {
      throw new Error('Failed to finalize pet profile');
    }

    await tx
      .update(userPet)
      .set({ enabled: false, updatedAt: now })
      .where(eq(userPet.userId, userId));

    await tx
      .update(userPet)
      .set({ enabled: true, updatedAt: now })
      .where(and(eq(userPet.userId, userId), eq(userPet.petId, petId)));
  });

  return { petId, userPetId: row.userPetId };
}
