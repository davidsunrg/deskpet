import { getPublicPetMediaBase } from '@/lib/pet-media';
import {
  listPetResources,
  paginatePetResources,
  petResourceToPlaygroundPet,
  petResourceToShowcasePet,
  type PetResourceManifest,
  type PetResourceVisibilityTarget,
} from '@/utils/pets/pet-resources';
import type { PlaygroundPet } from '@/utils/playground-pet';
import { PETS_PAGE_SIZE, type ShowcasePet } from '@/utils/showcase-pets';
import { resolveCatalogPetCopyMap } from '@/pets/resolve-catalog-pet-copy';

async function toShowcasePets(
  resources: PetResourceManifest[]
): Promise<ShowcasePet[]> {
  if (resources.length === 0) return [];

  const copyByBreed = await resolveCatalogPetCopyMap(
    resources.map((resource) => resource.breed)
  );
  const publicStorageBase = getPublicPetMediaBase();

  return resources.map((resource) => {
    const copy = copyByBreed.get(resource.breed);
    return petResourceToShowcasePet(resource, {
      publicStorageBase,
      breedLabel: copy?.breedLabel,
      description: copy?.description,
    });
  });
}

/**
 * Load fully registry-backed public pets for `/playground`.
 * Pets with no configured playable actions are omitted from the picker.
 */
export async function listPlaygroundPresetPets(options?: {
  /** Defaults to playground; homepage floating pets should pass `home`. */
  visibleIn?: PetResourceVisibilityTarget;
}): Promise<PlaygroundPet[]> {
  const publicStorageBase = getPublicPetMediaBase();
  const visibleIn = options?.visibleIn ?? 'playground';

  return listPetResources({ visibleIn })
    .filter((resource) => resource.actions.length > 0)
    .map((resource) =>
      petResourceToPlaygroundPet(resource, { publicStorageBase })
    );
}

/**
 * List registry-backed public pets for homepage and catalog display.
 */
export async function listCatalogPets(options?: {
  limit?: number;
}): Promise<ShowcasePet[]> {
  const resources = listPetResources({ visibleIn: 'catalog' });
  const slice =
    options?.limit != null ? resources.slice(0, options.limit) : resources;
  return toShowcasePets(slice);
}

/**
 * Hero homepage pets — public catalog presets (optionally limited further).
 */
export async function listHeroPets(limit = 8): Promise<ShowcasePet[]> {
  const resources = listPetResources({ visibleIn: 'home' });
  return toShowcasePets(resources.slice(0, limit));
}

/**
 * Paginate registry-backed public pets.
 */
export async function paginateCatalogPets(
  page: number,
  pageSize: number = PETS_PAGE_SIZE
): Promise<{
  pets: ShowcasePet[];
  page: number;
  totalPages: number;
}> {
  const result = paginatePetResources(page, pageSize, {
    visibleIn: 'catalog',
  });

  return {
    pets: await toShowcasePets(result.resources),
    page: result.page,
    totalPages: result.totalPages,
  };
}
