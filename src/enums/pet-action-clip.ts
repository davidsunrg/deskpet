/**
 * Canonical raw animation clip keys.
 * Values are the persisted / media action keys used by pets.
 */
export enum PetActionClip {
  SitIdle = 'sit_idle',
  SitToWalkLeft = 'sit_to_walk_left',
  SitToWalkRight = 'sit_to_walk_right',
  WalkLeftLoop = 'walk_left_loop',
  WalkRightLoop = 'walk_right_loop',
  TurnLeftToRight = 'turn_left_to_right',
  TurnRightToLeft = 'turn_right_to_left',
  WalkLeftToSit = 'walk_left_to_sit',
  WalkRightToSit = 'walk_right_to_sit',
  BreakStretchToSit = 'break_stretch_to_sit',
  Lick = 'lick',
  Scratch = 'scratch',
  Tease = 'tease',
  LieDown = 'lie_down',
  SleepLoop = 'sleep_loop',
  CoverEyes = 'cover_eyes',
  SleepTurn = 'sleep_turn',
  WakeUp = 'wake_up',
}

export const PET_ACTION_CLIP_VALUES = Object.values(
  PetActionClip
) as readonly PetActionClip[];

export function isPetActionClip(value: string): value is PetActionClip {
  return (PET_ACTION_CLIP_VALUES as readonly string[]).includes(value);
}
