import { createServerFn } from '@tanstack/react-start';
import { sessionApiMiddleware } from '@/middlewares/session-api-middleware';
import { deleteInProgressCreatorPet } from '@/server/pets/delete-in-progress-creator-pet';
import { ensureProvisionalCreatorPet } from '@/server/pets/ensure-provisional-creator-pet';
import { finalizeCreatorPetProfile } from '@/server/pets/finalize-creator-pet-profile';
import { loadCreatorWizardDraft } from '@/server/pets/load-creator-wizard-draft';
import {
  normalizePetBreedForSpecies,
  PET_BREED_VALUES,
  PET_SPECIES_VALUES,
  PetSex,
  type PetBreed,
  type PetSpecies,
} from '@/utils/pet-catalog';
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

export const ensureProvisionalCreatorPetFn = createServerFn({ method: 'POST' })
  .middleware([sessionApiMiddleware])
  .handler(async ({ context }) => {
    return ensureProvisionalCreatorPet({ userId: context.userId });
  });

const finalizeCreatorPetProfileSchema = z.object({
  petId: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  species: speciesSchema,
  breed: z.union([breedIdSchema, z.literal('')]).optional(),
  sex: z.enum([PetSex.Male, PetSex.Female]),
  avatar: z.string().url().max(2000).optional().nullable(),
});

export const finalizeCreatorPetProfileFn = createServerFn({ method: 'POST' })
  .validator(finalizeCreatorPetProfileSchema)
  .middleware([sessionApiMiddleware])
  .handler(async ({ data, context }) => {
    return finalizeCreatorPetProfile({
      userId: context.userId,
      petId: data.petId,
      name: data.name,
      species: data.species,
      breed: resolvedBreedFromInput(data),
      sex: data.sex,
      avatar: data.avatar,
    });
  });

const deleteInProgressCreatorPetSchema = z.object({
  petId: z.string().min(1),
});

export const deleteInProgressCreatorPetFn = createServerFn({ method: 'POST' })
  .validator(deleteInProgressCreatorPetSchema)
  .middleware([sessionApiMiddleware])
  .handler(async ({ data, context }) => {
    return deleteInProgressCreatorPet({
      userId: context.userId,
      petId: data.petId,
    });
  });

export const loadCreatorWizardDraftFn = createServerFn({ method: 'GET' })
  .middleware([sessionApiMiddleware])
  .handler(async ({ context }) => {
    return loadCreatorWizardDraft(context.userId);
  });
