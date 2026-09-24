import { describe, expect, test } from 'vitest';
import { publicPetProfileRoute } from '@/lib/routes';
import {
  getPublicPetProfile,
  normalizePublicPetHandle,
} from '@/pets/public-pet-profile';

describe('public pet profile handles', () => {
  test('resolves the Copper fixture after normalization', () => {
    expect(getPublicPetProfile('copper')?.name).toBe('Copper');
    expect(getPublicPetProfile(' COPPER ')?.handle).toBe('copper');
    expect(getPublicPetProfile('%63opper')?.handle).toBe('copper');
  });

  test('rejects unknown, malformed, and invalid handles', () => {
    expect(getPublicPetProfile('unknown')).toBeNull();
    expect(normalizePublicPetHandle('%E0%A4%A')).toBeNull();
    expect(normalizePublicPetHandle('.copper')).toBeNull();
    expect(normalizePublicPetHandle('co')).toBeNull();
    expect(normalizePublicPetHandle('copper!')).toBeNull();
  });

  test('builds an at-handle profile URL', () => {
    expect(publicPetProfileRoute('copper')).toBe('/@copper');
  });
});
