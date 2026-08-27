/**
 * Shared playground pet / action DTOs used by both preset and owned-pet modes.
 */

import type { PetSpecies } from '@/utils/pet-catalog';
import type { PetActionMotionConfig } from '@/utils/pets/pet-action-motion-config';
import type { PetActionInteraction } from '@/utils/preset-pets';

export type PlaygroundPetAction = {
  key: string;
  mediaType: 'video';
  mediaUrl: string;
  displayScale: number;
  interaction: PetActionInteraction;
  /** Optional display label (owned pets); presets resolve via i18n/fallbacks. */
  label?: string;
  /** Optional box/window motion timing and direction for this clip. */
  motionConfig?: PetActionMotionConfig | null;
};

export type PlaygroundPet = {
  /**
   * Selection key used in query sync / picker.
   * Preset: breed key. Owned: pet UUID.
   */
  key: string;
  /** Display name for picker / a11y. */
  name: string;
  species: PetSpecies | string;
  avatar: string;
  actions: readonly PlaygroundPetAction[];
  /** True when this is a managed user pet (not a public preset). */
  isOwned: boolean;
};
