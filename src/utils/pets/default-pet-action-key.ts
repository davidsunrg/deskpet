import type { PetActionInteraction } from '@/utils/preset-pets';

type ActionWithKeyAndInteraction = {
  key: string;
  interaction?: PetActionInteraction;
};

/**
 * Prefer canonical sit_idle, then any look-scrub clip, then the first action.
 */
export function defaultPetActionKey(
  actions: readonly ActionWithKeyAndInteraction[]
): string {
  const sitIdle = actions.find((action) => action.key === 'sit_idle');
  if (sitIdle) return sitIdle.key;

  const lookScrub = actions.find(
    (action) => action.interaction === 'look-scrub'
  );
  if (lookScrub) return lookScrub.key;

  return actions[0]?.key ?? 'sit_idle';
}
