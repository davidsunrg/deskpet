/**
 * Pure types and sizing helpers for showcase / marketing pet previews.
 * Public pet identity and media live in `src/pets`.
 * Species/breed labels are resolved from i18n.
 */

import type { PetActionInteraction } from '@/utils/preset-pets';
import { PetSpecies, type PetBreed } from '@/utils/pet-catalog';

/** Species stored on `pet.species`. */
export type ShowcasePetSpecies = PetSpecies;

/** Filter chips — `more` keeps the tab ready for future species. */
export type ShowcasePetSpeciesFilter = ShowcasePetSpecies | 'all' | 'more';

/** @deprecated Prefer ShowcasePetSpecies / ShowcasePetSpeciesFilter. */
export type ShowcasePetCategory = ShowcasePetSpecies | 'more';

/** Stable action ids with dedicated marketing copy. */
export const SHOWCASE_PET_ACTION_IDS = ['sit_idle'] as const;

export type ShowcasePetActionId = (typeof SHOWCASE_PET_ACTION_IDS)[number];

/**
 * Message keys under `PetsPage.actions` for each showcase action id.
 */
export const SHOWCASE_PET_ACTION_MESSAGE_KEYS = {
  sit_idle: 'sitIdle',
} as const satisfies Record<ShowcasePetActionId, string>;

export type ShowcasePetAction = {
  /** Preset ids or generated action keys when media is available. */
  key: string;
  mediaUrl: string;
  displayScale: number;
  interaction: PetActionInteraction;
};

export type ShowcasePet = {
  /** Preset / adopt key (breed key). Not the URL handle. */
  id: string;
  /** Public X-style handle derived from the registry display name. */
  handle: string;
  /** Stable breed key used for i18n and public URLs. */
  breed: PetBreed | string;
  /** Breed display label (from species config). */
  breedLabel: string;
  species: ShowcasePetSpecies;
  /** Public identity avatar URL. */
  avatar: string;
  /** Public playable preset actions resolved from the pet resource registry. */
  actions: ShowcasePetAction[];
  /** Detail route (`/pets/{species}/{breed}`). */
  href: string;
  description?: string | null;
  /** Homepage before/after maker example (original photo vs result). */
  makerExample?: {
    photoUrl: string;
    petName: string;
    uploadedBy: string;
    uploadedAt: string;
  };
};

/** Match zpet `basePetWindowSize` for showcase floating previews. */
export const SHOWCASE_PET_BASE_SIZE = 320;

/**
 * Extra multiplier applied on top of each action's `displayScale` so marketing
 * floats (home + playground) stay matched. Use 1 to honor action displayScale
 * as-is (no artificial upsizing).
 */
export const SHOWCASE_PET_DISPLAY_SCALE_MULTIPLIER = 1;

/** Default aspect before visual-frame measurement (zpet defaultPetAspectRatio). */
export const SHOWCASE_PET_DEFAULT_ASPECT = 128 / 165;

export const HERO_PET_PREVIEW_COUNT = 8;

export const PETS_PAGE_SIZE = 12;

/**
 * Resolve a showcase action by key (falls back to first action).
 */
export function getShowcasePetAction(
  pet: ShowcasePet,
  actionKey: ShowcasePetActionId | string
): ShowcasePetAction | null {
  return (
    pet.actions.find((action) => action.key === actionKey) ??
    pet.actions[0] ??
    null
  );
}

/**
 * Label message key for an action, or null when unknown (caller may fall back).
 */
export function showcasePetActionMessageKey(
  actionKey: string
): (typeof SHOWCASE_PET_ACTION_MESSAGE_KEYS)[ShowcasePetActionId] | null {
  if (actionKey in SHOWCASE_PET_ACTION_MESSAGE_KEYS) {
    return SHOWCASE_PET_ACTION_MESSAGE_KEYS[actionKey as ShowcasePetActionId];
  }
  return null;
}

/**
 * Effective display scale for the active action clip.
 */
export function showcasePetScale(
  pet: ShowcasePet,
  actionKey: ShowcasePetActionId | string
): number {
  return getShowcasePetAction(pet, actionKey)?.displayScale ?? 1;
}

/**
 * Pet window size from scale + aspect (same formula as zpet `petWindowSize`),
 * with {@link SHOWCASE_PET_DISPLAY_SCALE_MULTIPLIER} applied so home and
 * playground stay matched.
 */
export function showcasePetWindowSize(
  scale: number,
  aspectRatio: number = SHOWCASE_PET_DEFAULT_ASPECT
): { width: number; height: number } {
  const maxSide = Math.round(
    SHOWCASE_PET_BASE_SIZE *
      Math.max(0.55, scale * SHOWCASE_PET_DISPLAY_SCALE_MULTIPLIER)
  );
  const safeAspect =
    Number.isFinite(aspectRatio) && aspectRatio > 0
      ? aspectRatio
      : SHOWCASE_PET_DEFAULT_ASPECT;

  if (safeAspect >= 1) {
    return {
      width: maxSide,
      height: Math.max(80, Math.round(maxSide / safeAspect)),
    };
  }

  return {
    width: Math.max(80, Math.round(maxSide * safeAspect)),
    height: maxSide,
  };
}

/**
 * Filter showcase pets by species.
 * `more` returns the full list so the filter stays ready for future breeds.
 */
export function filterShowcasePets(
  pets: ShowcasePet[],
  species: ShowcasePetSpeciesFilter = 'all'
): ShowcasePet[] {
  if (species === 'all' || species === 'more') {
    return pets;
  }
  return pets.filter((pet) => pet.species === species);
}

export type { PetActionInteraction };

export { PetSpecies };
