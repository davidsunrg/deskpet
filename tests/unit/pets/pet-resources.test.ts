import { describe, expect, test } from 'vitest';
import { petDetailRoute } from '@/lib/routes';
import { PetSpecies, isPetBreedForSpecies } from '@/utils/pet-catalog';
import { getPetBreedLabel } from '@/utils/pets/pet-species-config';
import {
  getPetResourceByIdOrBreed,
  petResourceRegistry,
} from '@/utils/pets/pet-resources';

describe('leopardus-tilcayo pet resource', () => {
  test('is registered and resolved by id and breed', () => {
    expect(petResourceRegistry['leopardus-tilcayo']).toBeDefined();
    expect(getPetResourceByIdOrBreed('leopardus-tilcayo')?.id).toBe(
      'leopardus-tilcayo'
    );
    expect(getPetResourceByIdOrBreed('leopardus-tilcayo')?.breed).toBe(
      'leopardus-tilcayo'
    );
  });

  test('uses orange-cat play preset and distinct public detail route', () => {
    const resource = getPetResourceByIdOrBreed('leopardus-tilcayo');
    expect(resource?.detail?.playPresetKey).toBe('orange-cat');
    expect(resource?.name).toBe('Leopardus tilcayo');
    expect(petDetailRoute(resource!.id)).toBe('/p/leopardus-tilcayo');
  });

  test('is a valid cat breed in species config', () => {
    expect(isPetBreedForSpecies(PetSpecies.Cat, 'leopardus-tilcayo')).toBe(
      true
    );
    expect(getPetBreedLabel('leopardus-tilcayo')).toBe('Leopardus tilcayo');
  });
});
