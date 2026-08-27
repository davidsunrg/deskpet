import { getPublicPetMediaBase } from '@/lib/pet-media';
import type { PetSpecies } from '@/utils/pet-catalog';
import type { PetBreed } from '@/utils/pet-catalog';
import {
  listPetResources,
  type PetResourceManifest,
} from '@/utils/pets/pet-resources';
import type { PetResourceInteraction } from '@/utils/pets/pet-resource-types';

export type PetActionInteraction = PetResourceInteraction;

export type PresetPet = {
  key: string;
  breed: PetBreed;
  species: PetSpecies;
  avatar: string;
};

function toPresetPet(
  resource: PetResourceManifest,
  publicStorageBase: string
): PresetPet {
  const avatarKey = resource.avatarR2Key ?? resource.thumbnailR2Key;
  const avatar = avatarKey
    ? `${publicStorageBase}/${avatarKey.replace(/^\/+/, '')}`
    : '';

  return {
    key: resource.id,
    breed: resource.breed,
    species: resource.species,
    avatar,
  };
}

const publicStorageBase = getPublicPetMediaBase();

export const PRESET_PETS: readonly PresetPet[] = listPetResources({
  visibleIn: 'catalog',
}).map((resource) => toPresetPet(resource, publicStorageBase));

const PRESETS_BY_KEY = new Map(
  PRESET_PETS.map((preset) => [preset.key, preset])
);

export function listPresetPets(): readonly PresetPet[] {
  return PRESET_PETS;
}

export function listPresetPetSpecies(): PetSpecies[] {
  return [...new Set(PRESET_PETS.map((preset) => preset.species))];
}

export function listPresetPetBreedsForSpecies(species: PetSpecies): PetBreed[] {
  return PRESET_PETS.filter((preset) => preset.species === species).map(
    (preset) => preset.breed
  );
}

export function getPresetPet(presetKey: string): PresetPet | null {
  return PRESETS_BY_KEY.get(presetKey) ?? null;
}

export function isPresetPetKey(value: string): boolean {
  return PRESETS_BY_KEY.has(value);
}
