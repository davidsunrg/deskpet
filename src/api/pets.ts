import { createServerFn } from '@tanstack/react-start';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { sessionApiMiddleware } from '@/middlewares/session-api-middleware';
import { adoptPet } from '@/server/pets/adopt-pet';
import { createPet } from '@/server/pets/create-pet';
import { listUserPets } from '@/server/pets/list-user-pets';
import { setActiveUserPet } from '@/server/pets/set-active-user-pet';
import { updatePetProfile } from '@/server/pets/update-pet-profile';
import { userHasPets } from '@/server/pets/user-has-pets';
import {
  normalizePetBreedForSpecies,
  PET_BREED_VALUES,
  PET_SPECIES_VALUES,
  PetSex,
  type PetBreed,
  type PetSpecies,
} from '@/utils/pet-catalog';
import { PetCreationStatus } from '@/utils/pets/pet-creation-status';
import { z } from 'zod';

const speciesSchema = z.enum(
  PET_SPECIES_VALUES as [PetSpecies, ...PetSpecies[]]
);
const breedIdSchema = z.enum(PET_BREED_VALUES as [PetBreed, ...PetBreed[]]);

function resolvedBreedFromInput(input: {
  species: PetSpecies;
  breed?: PetBreed | '' | undefined;
}): PetBreed {
  const breed = normalizePetBreedForSpecies(
    input.species,
    input.breed?.trim() || ''
  );
  if (!breed) {
    throw new Error('Invalid breed for species.');
  }
  return breed;
}

export const listUserPetsForCurrentUser = createServerFn({ method: 'GET' })
  .middleware([authApiMiddleware])
  .handler(async ({ context }) => {
    return listUserPets(context.userId);
  });

export const userHasPetsForCurrentUser = createServerFn({ method: 'GET' })
  .middleware([authApiMiddleware])
  .handler(async ({ context }) => {
    return userHasPets(context.userId);
  });

const adoptPetSchema = z.object({
  presetKey: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  species: speciesSchema,
  breed: z.union([breedIdSchema, z.literal('')]).optional(),
  sex: z.enum([PetSex.Male, PetSex.Female]),
  avatar: z.string().url().max(2000).optional().nullable(),
});

export const adoptPetFn = createServerFn({ method: 'POST' })
  .validator(adoptPetSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    return adoptPet({
      userId: context.userId,
      presetKey: data.presetKey,
      name: data.name,
      species: data.species,
      breed: resolvedBreedFromInput(data),
      sex: data.sex,
      avatar: data.avatar,
    });
  });

const createPetSchema = z.object({
  name: z.string().trim().min(1).max(80),
  species: speciesSchema,
  breed: z.union([breedIdSchema, z.literal('')]).optional(),
  sex: z.enum([PetSex.Male, PetSex.Female]),
  avatar: z.string().url().max(2000).optional().nullable(),
  isPreset: z.boolean().optional(),
  creationStatus: z.enum(['photos_uploaded', 'profile_created']).optional(),
});

export const createPetFn = createServerFn({ method: 'POST' })
  .validator(createPetSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    return createPet({
      userId: context.userId,
      name: data.name,
      species: data.species,
      breed: resolvedBreedFromInput(data),
      sex: data.sex,
      avatar: data.avatar,
      isPreset: data.isPreset ?? false,
      creationStatus: data.creationStatus ?? PetCreationStatus.ProfileCreated,
    });
  });

const updatePetProfileSchema = z.object({
  petId: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  species: speciesSchema,
  breed: z.union([breedIdSchema, z.literal('')]).optional(),
  sex: z.enum([PetSex.Male, PetSex.Female]),
  avatar: z.string().url().max(2000).optional().nullable(),
});

export const updatePetProfileFn = createServerFn({ method: 'POST' })
  .validator(updatePetProfileSchema)
  .middleware([sessionApiMiddleware])
  .handler(async ({ data, context }) => {
    return updatePetProfile({
      userId: context.userId,
      petId: data.petId,
      name: data.name,
      species: data.species,
      breed: resolvedBreedFromInput(data),
      sex: data.sex,
      avatar: data.avatar,
    });
  });

const setActivePetSchema = z.object({
  userPetId: z.string().min(1),
});

export const setActivePetFn = createServerFn({ method: 'POST' })
  .validator(setActivePetSchema)
  .middleware([sessionApiMiddleware])
  .handler(async ({ data, context }) => {
    return setActiveUserPet({
      userId: context.userId,
      userPetId: data.userPetId,
    });
  });
