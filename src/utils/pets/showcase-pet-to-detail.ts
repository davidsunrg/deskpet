import type { ShowcasePet } from '@/utils/showcase-pets';

export type PetDetail = {
  id: string;
  name: string;
  avatarUrl: string | null;
  description: string | null;
  spritesheetUrl: string | null;
  zipFilePath: string | null;
  category: string | null;
  subcategory: string | null;
  catalogSource: string | null;
  sourceUrl: string | null;
  isDefault: boolean;
  isBuiltin: boolean;
  featured: boolean;
  original: boolean;
  owned: boolean;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Convert a registry-backed showcase pet into the shared detail-page shape. */
export function showcasePetToDetail(pet: ShowcasePet): PetDetail {
  const now = new Date(0);
  return {
    id: pet.id,
    name: pet.breedLabel,
    avatarUrl: pet.avatar || null,
    description:
      pet.description ??
      `${pet.breedLabel} is a friendly desktop companion you can preview, customize, and use as a starting point for your own pet.`,
    spritesheetUrl: null,
    zipFilePath: null,
    category: pet.species,
    subcategory: null,
    catalogSource: 'DeskPet.ai Pets',
    sourceUrl: null,
    isDefault: false,
    isBuiltin: true,
    featured: true,
    original: true,
    owned: false,
    enabled: false,
    createdAt: now,
    updatedAt: now,
  };
}
