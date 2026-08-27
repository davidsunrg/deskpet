/**
 * Canonical pet posture keys used by action planning.
 */
export enum PetActionPosture {
  Sitting = 'sitting',
  WalkingLeft = 'walkingLeft',
  WalkingRight = 'walkingRight',
  Sleeping = 'sleeping',
}

export const PET_ACTION_POSTURE_VALUES = Object.values(
  PetActionPosture
) as readonly PetActionPosture[];

export function isPetActionPosture(value: string): value is PetActionPosture {
  return (PET_ACTION_POSTURE_VALUES as readonly string[]).includes(value);
}
