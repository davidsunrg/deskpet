import {
  getPetBreedDescription,
  getPetBreedLabel,
} from '@/utils/pets/pet-species-config';
import { getTranslations } from '@/lib/deskpet-i18n';

export type CatalogPetCopy = {
  /** Display breed label (i18n preferred). */
  breedLabel: string;
  /** Short card / list description (i18n preferred). */
  description: string;
};

/**
 * Resolve breed label + short description for a catalog breed key.
 * Prefers `PetsPage.breeds` messages; falls back to species config.
 */
export async function resolveCatalogPetCopy(
  breed: string
): Promise<CatalogPetCopy> {
  const t = await getTranslations({ namespace: 'PetsPage.breeds' });
  const labelKey = `${breed}.breed`;
  const descriptionKey = `${breed}.description`;

  return {
    breedLabel: t.has(labelKey) ? t(labelKey) : getPetBreedLabel(breed),
    description: t.has(descriptionKey)
      ? t(descriptionKey)
      : getPetBreedDescription(breed),
  };
}

/**
 * Resolve catalog copy for many breeds.
 */
export async function resolveCatalogPetCopyMap(
  breeds: string[]
): Promise<Map<string, CatalogPetCopy>> {
  const map = new Map<string, CatalogPetCopy>();
  await Promise.all(
    breeds.map(async (breed) => {
      map.set(breed, await resolveCatalogPetCopy(breed));
    })
  );
  return map;
}
