import type { PlaygroundPetAction } from '@/utils/playground-pet';
import type { LogicalActionMenuItem } from '@/utils/pets/pet-action-sequence';

const ACTION_LABEL_FALLBACKS: Record<string, string> = {
  sit_idle: 'Sit',
  lick: 'Lick',
  sit_to_walk_left: 'Sit To Walk Left',
  stretch: 'Stretch',
  wash_face: 'Wash Face',
  yawn: 'Yawn',
  ear_blink: 'Ear Blink',
  tail_sway: 'Tail Sway',
  side_groom: 'Side Groom',
  wag_tail: 'Wag Tail',
  play_bow: 'Play Bow',
  paw_raise: 'Paw Raise',
  shake: 'Shake',
  ear_perk: 'Ear Perk',
  head_turn: 'Head Turn',
  wing_ruffle: 'Wing Ruffle',
  preen: 'Preen',
  hoot: 'Hoot',
  hop: 'Hop',
};

/** Display label for a playground action, falling back to a known key title. */
export function actionLabel(action: PlaygroundPetAction): string {
  if (action.label) return action.label;
  return ACTION_LABEL_FALLBACKS[action.key] ?? action.key;
}

/** Display label for a logical menu intent. */
export function logicalActionLabel(item: LogicalActionMenuItem): string {
  return item.label;
}
