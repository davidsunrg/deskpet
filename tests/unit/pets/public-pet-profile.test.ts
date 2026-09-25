import {
  getPublicPetProfile,
  normalizePublicPetHandle,
} from '@/pets/public-pet-profile';
import { describe, expect, test } from 'vitest';

describe('public pet profile handles', () => {
  test('resolves Copper after normalization', () => {
    expect(getPublicPetProfile('copper')?.name).toBe('Copper');
    expect(getPublicPetProfile(' COPPER ')?.handle).toBe('copper');
    expect(getPublicPetProfile('%63opper')?.bannerSrc).toBe(
      'https://cdn.deskpet.ai/pets/copper/banner.webp'
    );
  });

  test('resolves Laika after normalization', () => {
    expect(getPublicPetProfile('laika')?.name).toBe('Laika');
    expect(getPublicPetProfile(' LAIKA ')?.handle).toBe('laika');
    expect(getPublicPetProfile('laika')?.bannerSrc).toBe(
      'https://cdn.deskpet.ai/pets/laika/banner.webp'
    );
  });

  test('rejects unknown and malformed handles', () => {
    expect(getPublicPetProfile('unknown')).toBeNull();
    expect(normalizePublicPetHandle('%E0%A4%A')).toBeNull();
    expect(normalizePublicPetHandle('.copper')).toBeNull();
    expect(normalizePublicPetHandle('co')).toBeNull();
    expect(normalizePublicPetHandle('copper!')).toBeNull();
  });
});
