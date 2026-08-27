import { getDb } from '@/db';
import { pet, userPet } from '@/db/schema';
import { getPetBreedLabel } from '@/utils/pets/pet-species-config';
import { PetCreationStatus } from '@/utils/pets/pet-creation-status';
import { and, asc, eq } from 'drizzle-orm';

export type ListedUserPet = {
  id: string;
  petId: string;
  handle: string | null;
  name: string;
  breed: string;
  breedLabel: string;
  displayName: string;
  sex: string | null;
  avatar: string | null;
  species: string;
  templateId: string | null;
  creationStatus: string;
  isPreset: boolean;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function listUserPets(userId: string): Promise<ListedUserPet[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: userPet.id,
      petId: userPet.petId,
      enabled: userPet.enabled,
      createdAt: userPet.createdAt,
      updatedAt: userPet.updatedAt,
      handle: pet.handle,
      name: pet.name,
      breed: pet.breed,
      sex: pet.sex,
      avatar: pet.avatar,
      species: pet.species,
      templateId: pet.templateId,
      creationStatus: pet.creationStatus,
      isPreset: pet.isPreset,
    })
    .from(userPet)
    .innerJoin(pet, eq(userPet.petId, pet.id))
    .where(
      and(
        eq(userPet.userId, userId),
        eq(pet.creationStatus, PetCreationStatus.ProfileCreated)
      )
    )
    .orderBy(asc(userPet.createdAt), asc(userPet.id));

  return rows.map((row) => {
    const breedLabel = getPetBreedLabel(row.breed);
    const displayName = row.name.trim() || breedLabel;
    return {
      id: row.id,
      petId: row.petId,
      handle: row.handle ?? null,
      name: row.name,
      breed: row.breed,
      breedLabel,
      displayName,
      sex: row.sex ?? null,
      avatar: row.avatar ?? null,
      species: row.species,
      templateId: row.templateId ?? null,
      creationStatus: row.creationStatus,
      isPreset: row.isPreset,
      enabled: row.enabled,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  });
}
