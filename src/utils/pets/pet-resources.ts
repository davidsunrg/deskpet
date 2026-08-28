import { petDetailRoute } from '@/lib/routes';
import type {
  PlaygroundPet,
  PlaygroundPetAction,
} from '@/utils/playground-pet';
import { normalizePetHandleBase } from '@/utils/pets/handle';
import type {
  PetResourceManifest,
  PetResourceVisibilityTarget,
} from '@/utils/pets/pet-resource-types';
import type { ShowcasePet, ShowcasePetAction } from '@/utils/showcase-pets';
import { orangeCatResources } from '@/pets/cat/orange-cat';
import { goldenRetrieverResources } from '@/pets/dog/golden-retriever';
import { miniGoldenRetrieverResources } from '@/pets/dog/mini-golden-retriever';

export type {
  PetResourceAction,
  PetResourceDetail,
  PetResourceDetailCopy,
  PetResourceFaq,
  PetResourceInteraction,
  PetResourceMakerExample,
  PetResourceManifest,
  PetResourcePose,
  PetResourceVisibility,
  PetResourceVisibilityTarget,
} from '@/utils/pets/pet-resource-types';

export const petResourceRegistry = {
  [goldenRetrieverResources.id]: goldenRetrieverResources,
  [orangeCatResources.id]: orangeCatResources,
  [miniGoldenRetrieverResources.id]: miniGoldenRetrieverResources,
} as const satisfies Readonly<Record<string, PetResourceManifest>>;

export type PetResourceId = keyof typeof petResourceRegistry;

/** Stable resource display order, filtered by each consuming surface. */
export const PET_RESOURCE_DISPLAY_ORDER = [
  goldenRetrieverResources.id,
  orangeCatResources.id,
  miniGoldenRetrieverResources.id,
] as const satisfies readonly PetResourceId[];

function normalizePublicStorageBase(value: string | undefined): string {
  const base = value?.trim().replace(/\/+$/, '');
  if (!base) {
    throw new Error(
      'STORAGE_PUBLIC_URL is not configured for public pet media.'
    );
  }
  return base;
}

export function buildPetResourceUrl(
  publicStorageBase: string | undefined,
  r2Key: string
): string {
  const base = normalizePublicStorageBase(publicStorageBase);
  const key = r2Key.trim().replace(/^\/+/, '');
  if (!key) {
    throw new Error('Pet resource object key is required.');
  }
  return `${base}/${key}`;
}

function petResourceActionsToPlaygroundActions(
  resource: PetResourceManifest,
  publicStorageBase: string | undefined
): PlaygroundPetAction[] {
  return resource.actions.map((action) => ({
    key: action.key,
    mediaType: 'video',
    mediaUrl: buildPetResourceUrl(publicStorageBase, action.r2Key),
    displayScale: action.displayScale,
    interaction: action.interaction,
    ...(action.motionConfig !== undefined
      ? { motionConfig: action.motionConfig }
      : {}),
  }));
}

/** Visibility defaults to enabled when a manifest omits the target flag. */
export function isPetResourceVisible(
  resource: PetResourceManifest,
  target: PetResourceVisibilityTarget
): boolean {
  return resource.visibility?.[target] !== false;
}

/** List resources in stable order, optionally filtered for one surface. */
export function listPetResources(options?: {
  visibleIn?: PetResourceVisibilityTarget;
}): PetResourceManifest[] {
  const resources = PET_RESOURCE_DISPLAY_ORDER.map(
    (id) => petResourceRegistry[id]
  );
  const visibleIn = options?.visibleIn;
  return visibleIn
    ? resources.filter((resource) => isPetResourceVisible(resource, visibleIn))
    : resources;
}

/** Find one resource by registry id or breed key. */
export function getPetResourceByIdOrBreed(
  idOrBreed: string
): PetResourceManifest | undefined {
  const key = idOrBreed.trim();
  if (!key) return undefined;
  return listPetResources().find(
    (resource) => resource.id === key || resource.breed === key
  );
}

/** Backward-compatible registry lookup used by the action resolver. */
export function getPetResource(
  idOrBreed: string
): PetResourceManifest | undefined {
  return getPetResourceByIdOrBreed(idOrBreed);
}

/** Paginate resources without consulting external storage. */
export function paginatePetResources(
  page: number,
  pageSize: number,
  options?: { visibleIn?: PetResourceVisibilityTarget }
): {
  resources: PetResourceManifest[];
  page: number;
  totalPages: number;
} {
  const resources = listPetResources(options);
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 1;
  const totalPages = Math.max(1, Math.ceil(resources.length / safePageSize));
  const safePage =
    Number.isFinite(page) && page >= 1 && page <= totalPages
      ? Math.floor(page)
      : 1;
  const offset = (safePage - 1) * safePageSize;

  return {
    resources: resources.slice(offset, offset + safePageSize),
    page: safePage,
    totalPages,
  };
}

/** Convert a resource manifest into a marketing showcase pet. */
export function petResourceToShowcasePet(
  resource: PetResourceManifest,
  input: {
    publicStorageBase: string | undefined;
    breedLabel?: string;
    description?: string | null;
  }
): ShowcasePet {
  const actions: ShowcasePetAction[] = petResourceActionsToPlaygroundActions(
    resource,
    input.publicStorageBase
  ).map((action) => ({
    key: action.key,
    mediaUrl: action.mediaUrl,
    displayScale: action.displayScale,
    interaction: action.interaction,
  }));

  return {
    id: resource.id,
    handle: normalizePetHandleBase(resource.name),
    breed: resource.breed,
    breedLabel: input.breedLabel ?? resource.name,
    species: resource.species,
    avatar: buildPetResourceUrl(
      input.publicStorageBase,
      resource.thumbnailR2Key ?? resource.avatarR2Key
    ),
    actions,
    href: petDetailRoute(resource.id),
    description: input.description,
    ...(resource.makerExample
      ? {
          makerExample: {
            photoUrl: buildPetResourceUrl(
              input.publicStorageBase,
              resource.makerExample.photoR2Key
            ),
            petName: resource.makerExample.petName,
            uploadedBy: resource.makerExample.uploadedBy,
          },
        }
      : {}),
  };
}

/** Convert a resource manifest into a playground picker pet. */
export function petResourceToPlaygroundPet(
  resource: PetResourceManifest,
  input: { publicStorageBase: string | undefined }
): PlaygroundPet {
  return {
    key: resource.id,
    name: resource.name,
    species: resource.species,
    avatar: buildPetResourceUrl(input.publicStorageBase, resource.avatarR2Key),
    actions: petResourceActionsToPlaygroundActions(
      resource,
      input.publicStorageBase
    ),
    isOwned: false,
  };
}

export {
  goldenRetrieverResources,
  miniGoldenRetrieverResources,
  orangeCatResources,
};
