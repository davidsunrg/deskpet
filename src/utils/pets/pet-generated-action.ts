/**
 * Stable keys for privately generated dashboard pet actions.
 */

import type { ActionPoseType } from '@/utils/pets/action-pose';
import {
  getPetSpeciesActionProfile,
  parsePetSpecies,
  PetSpecies,
  type PetActionProfile,
} from '@/utils/pet-catalog';

export const CAT_GENERATED_ACTION_KEYS = [
  'sit_idle',
  'lick',
  'sit_to_walk_left',
  'stretch',
  'wash_face',
  'yawn',
  'ear_blink',
  'tail_sway',
  'side_groom',
] as const;

export const DOG_GENERATED_ACTION_KEYS = [
  'sit_idle',
  'sit_to_walk_left',
  'wag_tail',
  'play_bow',
  'paw_raise',
  'shake',
  'yawn',
  'ear_perk',
] as const;

export type CatGeneratedActionKey = (typeof CAT_GENERATED_ACTION_KEYS)[number];
export type DogGeneratedActionKey = (typeof DOG_GENERATED_ACTION_KEYS)[number];

/** Union of every generated action key across species. */
export type PetGeneratedActionKey =
  | CatGeneratedActionKey
  | DogGeneratedActionKey;

/**
 * All known generated-action keys (union of species catalogs).
 * Prefer {@link getPetGeneratedActionKeysForSpecies} for UI/catalog lists.
 */
export const PET_GENERATED_ACTION_KEYS = [
  ...CAT_GENERATED_ACTION_KEYS,
  'wag_tail',
  'play_bow',
  'paw_raise',
  'shake',
  'ear_perk',
] as const satisfies readonly PetGeneratedActionKey[];

const ALL_KEY_SET = new Set<string>(PET_GENERATED_ACTION_KEYS);
const CAT_KEY_SET = new Set<string>(CAT_GENERATED_ACTION_KEYS);
const DOG_KEY_SET = new Set<string>(DOG_GENERATED_ACTION_KEYS);

export function isPetGeneratedActionKey(
  value: string
): value is PetGeneratedActionKey {
  return ALL_KEY_SET.has(value);
}

function actionKeysForProfile(
  profile: PetActionProfile
): readonly PetGeneratedActionKey[] {
  if (profile === 'dog') return DOG_GENERATED_ACTION_KEYS;
  return CAT_GENERATED_ACTION_KEYS;
}

function actionKeySetForProfile(profile: PetActionProfile): Set<string> {
  if (profile === 'dog') return DOG_KEY_SET;
  return CAT_KEY_SET;
}

export function isPetGeneratedActionKeyForSpecies(
  value: string,
  species: PetSpecies | string
): value is PetGeneratedActionKey {
  const profile = getPetSpeciesActionProfile(parsePetSpecies(String(species)));
  return actionKeySetForProfile(profile).has(value);
}

export function getPetGeneratedActionKeysForSpecies(
  species: PetSpecies | string
): readonly PetGeneratedActionKey[] {
  const profile = getPetSpeciesActionProfile(parsePetSpecies(String(species)));
  return actionKeysForProfile(profile);
}

/** Default companion scale for a newly generated action clip. */
export const DEFAULT_GENERATED_ACTION_DISPLAY_SCALE = 1;

/** @deprecated Prefer {@link DEFAULT_GENERATED_ACTION_DISPLAY_SCALE}. */
export const DEFAULT_GENERATED_IDLE_DISPLAY_SCALE =
  DEFAULT_GENERATED_ACTION_DISPLAY_SCALE;

/** Default I2V clip length (seconds) for generated actions. */
export const DEFAULT_GENERATED_ACTION_DURATION_SEC = 8;

/**
 * Final processed companion media layout after generation.
 * Raw I2V stays 16:9; `portrait` center-crops to square before keying.
 */
export type PetGeneratedActionOutputLayout = 'landscape' | 'portrait';

export const DEFAULT_GENERATED_ACTION_OUTPUT_LAYOUT: PetGeneratedActionOutputLayout =
  'landscape';

export type PetGeneratedActionDefinition = {
  key: PetGeneratedActionKey;
  /** Human-readable label for captions / fallback UI. */
  label: string;
  /** Stored WebM basename without extension. */
  filenameStem: string;
  displayScale: number;
  /** Pose type used as the I2V first-frame image (transient; not stored on pet_action). */
  firstFramePoseType: ActionPoseType;
  /**
   * Pose type used as the I2V last-frame image. Defaults to
   * {@link firstFramePoseType} when omitted.
   */
  lastFramePoseType?: ActionPoseType;
  /** Image-to-video clip length in seconds. */
  durationSec: number;
  /**
   * Final keyed WebM layout. `portrait` = center square crop of the
   * generated 16:9 raw before background removal.
   */
  outputLayout: PetGeneratedActionOutputLayout;
};

/** Resolved first/last pose types for generation (last defaults to first). */
export function resolveActionFramePoseTypes(
  definition: Pick<
    PetGeneratedActionDefinition,
    'firstFramePoseType' | 'lastFramePoseType'
  >
): {
  firstFramePoseType: ActionPoseType;
  lastFramePoseType: ActionPoseType;
} {
  return {
    firstFramePoseType: definition.firstFramePoseType,
    lastFramePoseType:
      definition.lastFramePoseType ?? definition.firstFramePoseType,
  };
}

function actionDefinition(input: {
  key: PetGeneratedActionKey;
  label: string;
  filenameStem: string;
  firstFramePoseType: ActionPoseType;
  lastFramePoseType?: ActionPoseType;
  displayScale?: number;
  durationSec?: number;
  outputLayout?: PetGeneratedActionOutputLayout;
}): PetGeneratedActionDefinition {
  return {
    key: input.key,
    label: input.label,
    filenameStem: input.filenameStem,
    firstFramePoseType: input.firstFramePoseType,
    ...(input.lastFramePoseType != null
      ? { lastFramePoseType: input.lastFramePoseType }
      : {}),
    displayScale: input.displayScale ?? DEFAULT_GENERATED_ACTION_DISPLAY_SCALE,
    durationSec: input.durationSec ?? DEFAULT_GENERATED_ACTION_DURATION_SEC,
    outputLayout: input.outputLayout ?? DEFAULT_GENERATED_ACTION_OUTPUT_LAYOUT,
  };
}

const CAT_GENERATED_ACTION_DEFINITIONS = {
  lick: actionDefinition({
    key: 'lick',
    label: 'Lick',
    filenameStem: 'lick',
    firstFramePoseType: 'front',
  }),
  sit_idle: actionDefinition({
    key: 'sit_idle',
    label: 'Look Around',
    filenameStem: 'sit-idle',
    firstFramePoseType: 'front',
  }),
  sit_to_walk_left: actionDefinition({
    key: 'sit_to_walk_left',
    label: 'Sit To Walk Left',
    filenameStem: 'sit-to-walk-left',
    firstFramePoseType: 'front',
    lastFramePoseType: 'walk_left',
    durationSec: 4,
  }),
  stretch: actionDefinition({
    key: 'stretch',
    label: 'Stretch',
    filenameStem: 'stretch',
    firstFramePoseType: 'walk_right',
  }),
  wash_face: actionDefinition({
    key: 'wash_face',
    label: 'Wash Face',
    filenameStem: 'wash-face',
    firstFramePoseType: 'front',
  }),
  yawn: actionDefinition({
    key: 'yawn',
    label: 'Yawn',
    filenameStem: 'yawn',
    firstFramePoseType: 'front',
  }),
  ear_blink: actionDefinition({
    key: 'ear_blink',
    label: 'Ear Blink',
    filenameStem: 'ear-blink',
    firstFramePoseType: 'front',
  }),
  tail_sway: actionDefinition({
    key: 'tail_sway',
    label: 'Tail Sway',
    filenameStem: 'tail-sway',
    firstFramePoseType: 'walk_left',
  }),
  side_groom: actionDefinition({
    key: 'side_groom',
    label: 'Side Groom',
    filenameStem: 'side-groom',
    firstFramePoseType: 'walk_left',
  }),
} as const satisfies Record<
  CatGeneratedActionKey,
  PetGeneratedActionDefinition
>;

const DOG_GENERATED_ACTION_DEFINITIONS = {
  sit_idle: actionDefinition({
    key: 'sit_idle',
    label: 'Look Around',
    filenameStem: 'dog-sit-idle',
    firstFramePoseType: 'front',
  }),
  sit_to_walk_left: actionDefinition({
    key: 'sit_to_walk_left',
    label: 'Sit To Walk Left',
    filenameStem: 'dog-sit-to-walk-left',
    firstFramePoseType: 'front',
    lastFramePoseType: 'walk_left',
    durationSec: 4,
  }),
  wag_tail: actionDefinition({
    key: 'wag_tail',
    label: 'Wag Tail',
    filenameStem: 'dog-wag-tail',
    firstFramePoseType: 'walk_left',
  }),
  play_bow: actionDefinition({
    key: 'play_bow',
    label: 'Play Bow',
    filenameStem: 'dog-play-bow',
    firstFramePoseType: 'walk_left',
  }),
  paw_raise: actionDefinition({
    key: 'paw_raise',
    label: 'Paw Raise',
    filenameStem: 'dog-paw-raise',
    firstFramePoseType: 'front',
  }),
  shake: actionDefinition({
    key: 'shake',
    label: 'Shake',
    filenameStem: 'dog-shake',
    firstFramePoseType: 'front',
  }),
  yawn: actionDefinition({
    key: 'yawn',
    label: 'Yawn',
    filenameStem: 'dog-yawn',
    firstFramePoseType: 'front',
  }),
  ear_perk: actionDefinition({
    key: 'ear_perk',
    label: 'Ear Perk',
    filenameStem: 'dog-ear-perk',
    firstFramePoseType: 'front',
  }),
} as const satisfies Record<
  DogGeneratedActionKey,
  PetGeneratedActionDefinition
>;

/** @deprecated Prefer species-aware definitions via getPetGeneratedActionDefinition. */
export const PET_GENERATED_ACTION_DEFINITIONS =
  CAT_GENERATED_ACTION_DEFINITIONS;

export function getPetGeneratedActionDefinition(
  actionKey: PetGeneratedActionKey,
  species: PetSpecies | string = PetSpecies.Cat
): PetGeneratedActionDefinition {
  const resolved = parsePetSpecies(String(species));
  const profile = getPetSpeciesActionProfile(resolved);
  if (!isPetGeneratedActionKeyForSpecies(actionKey, resolved)) {
    throw new Error(
      `Unsupported ${resolved} generated action key: ${String(actionKey)}`
    );
  }
  if (profile === 'dog') {
    return DOG_GENERATED_ACTION_DEFINITIONS[actionKey as DogGeneratedActionKey];
  }
  return CAT_GENERATED_ACTION_DEFINITIONS[actionKey as CatGeneratedActionKey];
}

/** I2V clip length for a generated action. */
export function getPetGeneratedActionDurationSec(
  actionKey: PetGeneratedActionKey,
  species: PetSpecies | string = PetSpecies.Cat
): number {
  return getPetGeneratedActionDefinition(actionKey, species).durationSec;
}

/**
 * Preferred playable-action order in the dashboard Actions player.
 * When species is provided, prefer that species catalog order.
 */
export function orderGeneratedActionKeys(
  keys: Iterable<string>,
  species?: PetSpecies | string
): string[] {
  const preferred = species
    ? getPetGeneratedActionKeysForSpecies(species)
    : PET_GENERATED_ACTION_KEYS;
  const preferredSet = new Set<string>(preferred);
  const keyList = [...keys];
  const ordered = preferred.filter((key) => keyList.includes(key));
  const rest = keyList.filter((key) => !preferredSet.has(key));
  return [...ordered, ...rest];
}
