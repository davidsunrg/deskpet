/**
 * Canonical logical / menu action keys.
 * Values are the planner and UI intent ids.
 */
export enum PetActionMenuItem {
  Sleep = 'sleep',
  WakeUp = 'wake_up',
  Lick = 'lick',
  Scratch = 'scratch',
  Tease = 'tease',
  WalkRight = 'walk_right',
  WalkLeft = 'walk_left',
  SitDown = 'sit_down',
  Stretch = 'stretch',
}

export const PET_ACTION_MENU_ITEM_VALUES = Object.values(
  PetActionMenuItem
) as readonly PetActionMenuItem[];

export function isPetActionMenuItem(value: string): value is PetActionMenuItem {
  return (PET_ACTION_MENU_ITEM_VALUES as readonly string[]).includes(value);
}
