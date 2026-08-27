import { getDb } from '@/db';
import { pet, userPet } from '@/db/schema';
import {
  isPetBreedForSpecies,
  isPetSpecies,
  PetSex,
  type PetBreed,
  type PetSpecies,
} from '@/utils/pet-catalog';
import { and, eq } from 'drizzle-orm';

export type UpdatePetProfileInput = {
  userId: string;
  petId: string;
  name: string;
  species: PetSpecies;
  breed: PetBreed;
  sex: PetSex;
  avatar?: string | null;
};

export async function updatePetProfile({
  userId,
  petId,
  name,
  species,
  breed,
  sex,
  avatar,
}: UpdatePetProfileInput): Promise<{ petId: string }> {
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

  const db = getDb();

  const [link] = await db
    .select({ id: userPet.id })
    .from(userPet)
    .where(and(eq(userPet.userId, userId), eq(userPet.petId, petId)))
    .limit(1);

  if (!link) {
    throw new Error('Pet not found');
  }

  const now = new Date();
  const avatarUrl = avatar?.trim();
  await db
    .update(pet)
    .set({
      name: nickname,
      species,
      breed,
      sex,
      ...(avatarUrl ? { avatar: avatarUrl } : {}),
      updatedAt: now,
    })
    .where(eq(pet.id, petId));

  return { petId };
}
