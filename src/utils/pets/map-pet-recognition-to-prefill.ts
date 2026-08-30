import {
  getPetBreedLabel,
  listPetBreedsForSpecies,
  normalizePetBreedForSpecies,
  PetBreed,
  PetSpecies,
  speciesUsesBreeds,
  type PetBreed as PetBreedId,
  type PetSpecies as PetSpeciesId,
} from '@/utils/pet-catalog';

export type PetRecognitionPrefill = {
  species: PetSpeciesId | '';
  breed: PetBreedId | '';
};

function normalizeMatchKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

function matchBreedFromFreeText(
  species: PetSpeciesId,
  freeText: string
): PetBreedId | '' {
  const options = listPetBreedsForSpecies(species);
  const likelyKey = normalizeMatchKey(freeText);
  const likelyCompact = likelyKey.replace(/\s+/g, '');

  for (const option of options) {
    const idKey = normalizeMatchKey(option);
    const labelKey = normalizeMatchKey(getPetBreedLabel(option));
    if (
      likelyKey === idKey ||
      likelyKey === labelKey ||
      likelyCompact === idKey.replace(/\s+/g, '') ||
      likelyCompact === labelKey.replace(/\s+/g, '')
    ) {
      return option;
    }
  }

  return '';
}

/**
 * Map recognition JSON into catalog species/breed for Details prefill.
 * Prefers catalog breed IDs; falls back to legacy free-text `likelyBreed`.
 * Unknown / unsupported species (e.g. character) leave both empty so the user
 * chooses manually — Character is detection-only, not a product species.
 */
export function mapPetRecognitionToPrefill(input: {
  species?: string;
  breed?: string;
  likelyBreed?: string;
}): PetRecognitionPrefill {
  const rawSpecies = input.species?.trim().toLowerCase() ?? '';
  if (
    rawSpecies === 'unknown' ||
    rawSpecies === 'other' ||
    rawSpecies === 'character'
  ) {
    return { species: '', breed: '' };
  }

  const species =
    rawSpecies === PetSpecies.Cat || rawSpecies === PetSpecies.Dog
      ? rawSpecies
      : '';

  if (!species) {
    return { species: '', breed: '' };
  }

  // Breed-less species store shared `any` (none in catalog today).
  if (!speciesUsesBreeds(species)) {
    return { species, breed: PetBreed.Any };
  }

  const breedId = input.breed?.trim().toLowerCase() ?? '';
  if (breedId && breedId !== PetBreed.Any) {
    const normalized = normalizePetBreedForSpecies(species, breedId);
    if (normalized && normalized !== PetBreed.Any) {
      return { species, breed: normalized };
    }
  }

  const legacyBreed = input.likelyBreed?.trim() ?? '';
  if (legacyBreed) {
    const matched = matchBreedFromFreeText(species, legacyBreed);
    if (matched && matched !== PetBreed.Any) {
      return { species, breed: matched };
    }
  }

  // Known species but no specific breed — leave breed empty so the user picks.
  return { species, breed: '' };
}

/** Creator photo recognition currently supports only catalog cats and dogs. */
export function isSupportedCreatorRecognitionSpecies(
  species: string | null | undefined
): boolean {
  const normalized = species?.trim().toLowerCase();
  return normalized === PetSpecies.Cat || normalized === PetSpecies.Dog;
}

/**
 * True when a successful recognition response does not identify a supported
 * creator species. Missing and unknown values are unsupported in that context.
 */
export function isUnsupportedCreatorRecognitionSpecies(
  species: string | null | undefined
): boolean {
  return !isSupportedCreatorRecognitionSpecies(species);
}
