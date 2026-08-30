/**
 * Rich, breed-specific copy for public catalog pet detail pages.
 * Short card/list blurbs live in `messages/en.json` (`PetsPage.breeds`).
 */

export type CatalogPetPersonalityTrait = {
  name: string;
  /** 0–10 display score. */
  score: number;
};

export type CatalogPetDetailCopy = {
  /** SEO / Open Graph description. */
  metaDescription: string;
  /** Trait chips under the hero title. */
  traits: readonly string[];
  /** About-section paragraphs (distinct per breed). */
  about: readonly string[];
  stats: {
    temperament: string;
    activity: string;
    bestFor: string;
    desktopSize: string;
  };
  personality: readonly CatalogPetPersonalityTrait[];
};

const FALLBACK_DETAIL_COPY: CatalogPetDetailCopy = {
  metaDescription:
    'Preview a free DeskPet catalog companion in your browser or on desktop.',
  traits: ['Calm', 'Curious', 'Friendly', 'Desktop-ready'],
  about: [
    'This companion is designed for people who want a pet nearby while working, studying, or browsing. It can be previewed in the browser today and extended with generated media over time.',
  ],
  stats: {
    temperament: 'Calm & affectionate',
    activity: 'Low to medium',
    bestFor: 'Work & study',
    desktopSize: 'Small',
  },
  personality: [
    { name: 'Affection', score: 8 },
    { name: 'Curiosity', score: 7 },
    { name: 'Energy', score: 5 },
    { name: 'Sleepiness', score: 7 },
    { name: 'Mischief', score: 4 },
  ],
};

/**
 * Optional rich copy keyed by catalog resource id / breed.
 * Preset pets may also supply `detail.copy` on their resource manifest.
 */
export const CATALOG_PET_DETAIL_COPY = {} as const satisfies Record<
  string,
  CatalogPetDetailCopy
>;

/**
 * Detail-page copy for a public preset breed; generic fallback otherwise.
 */
export function getCatalogPetDetailCopy(breed: string): CatalogPetDetailCopy {
  const copy = (
    CATALOG_PET_DETAIL_COPY as Record<string, CatalogPetDetailCopy>
  )[breed];
  return copy ?? FALLBACK_DETAIL_COPY;
}
