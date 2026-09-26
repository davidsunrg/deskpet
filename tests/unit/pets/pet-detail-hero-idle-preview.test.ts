import { describe, expect, test } from 'vitest';
import { PetActionClip } from '@/enums/pet-action-clip';
import { getShowcasePetAction } from '@/utils/showcase-pets';
import type { ShowcasePet } from '@/utils/showcase-pets';

const samplePet: ShowcasePet = {
  id: 'orange-cat',
  handle: 'orange-cat',
  breed: 'orange-cat',
  breedLabel: 'Orange Cat',
  species: 'cat',
  avatar: 'https://example.com/a.jpg',
  href: '/p/orange-cat',
  actions: [
    {
      key: PetActionClip.SitIdle,
      mediaUrl: 'https://example.com/sit.webm',
      displayScale: 1.4,
      interaction: 'look-scrub',
    },
    {
      key: 'walk_left',
      mediaUrl: 'https://example.com/walk.webm',
      displayScale: 1.4,
      interaction: 'loop',
    },
  ],
};

describe('pet detail hero idle preview helpers', () => {
  test('resolves sit_idle for single-clip hero display', () => {
    const action = getShowcasePetAction(samplePet, PetActionClip.SitIdle);
    expect(action?.key).toBe(PetActionClip.SitIdle);
    expect(action?.mediaUrl).toBe('https://example.com/sit.webm');
  });
});
