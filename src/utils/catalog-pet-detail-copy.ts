/**
 * Rich, breed-specific copy for public catalog pet detail pages.
 * Short card/list blurbs live in `messages/en.json` (`PetsPage.breeds`).
 */

import type { PetBreed } from '@/utils/pet-catalog';

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

export const CATALOG_PET_DETAIL_COPY = {
  'blue-british-shorthair': {
    metaDescription:
      'Meet the Blue British Shorthair desktop pet—a plush, steady companion for quiet focus sessions in your browser or on your desktop.',
    traits: ['Plush', 'Steady', 'Quiet', 'Desktop-ready'],
    about: [
      'The Blue British Shorthair settles into a corner of your screen like a living paperweight—round cheeks, dense coat, and a calm gaze that rarely asks for drama. It is the catalog pick for people who want company without chatter.',
      'Idle loops stay soft and grounded: a slow blink, a tiny shift of weight, then back to stillness. Use it when you need a low-stimulation pet that still feels present beside docs, tickets, or late-night browsing.',
    ],
    stats: {
      temperament: 'Even & reserved',
      activity: 'Low',
      bestFor: 'Deep focus',
      desktopSize: 'Compact',
    },
    personality: [
      { name: 'Affection', score: 7 },
      { name: 'Curiosity', score: 5 },
      { name: 'Energy', score: 3 },
      { name: 'Sleepiness', score: 9 },
      { name: 'Mischief', score: 2 },
    ],
  },
  'golden-british-shorthair': {
    metaDescription:
      'Preview the Golden British Shorthair DeskPet—warm, soft-glow idle motion that keeps workdays feeling a little cozier.',
    traits: ['Warm', 'Soft', 'Cozy', 'Desktop-ready'],
    about: [
      'Golden British Shorthair brings a honey-colored calm to the desktop: fluffy outline, gentle posture, and idle clips that feel like afternoon sun on a windowsill. It is friendly without being pushy.',
      'Reach for this companion when your day needs a softer visual tone—standups, writing blocks, or long reading sessions where a warm silhouette beats a blank wallpaper.',
    ],
    stats: {
      temperament: 'Gentle & warm',
      activity: 'Low to medium',
      bestFor: 'Cozy workdays',
      desktopSize: 'Medium',
    },
    personality: [
      { name: 'Affection', score: 9 },
      { name: 'Curiosity', score: 6 },
      { name: 'Energy', score: 4 },
      { name: 'Sleepiness', score: 8 },
      { name: 'Mischief', score: 3 },
    ],
  },
  'silver-british-shorthair': {
    metaDescription:
      'Try the Silver British Shorthair desktop pet—cool-toned, polished idle loops for clean, modern desktop vibes.',
    traits: ['Cool', 'Polished', 'Alert', 'Desktop-ready'],
    about: [
      'Silver British Shorthair reads crisp on screen: light tipping, sharp edges, and a slightly more upright sit that feels tidy next to code editors and design tools. It is the “clean desk” cat of the preset pack.',
      'Motion stays measured—small head turns and composed sits—so it complements bright UIs without competing for attention. A good default when you want catalog polish more than cartoon energy.',
    ],
    stats: {
      temperament: 'Composed & alert',
      activity: 'Medium',
      bestFor: 'Design & code',
      desktopSize: 'Medium',
    },
    personality: [
      { name: 'Affection', score: 6 },
      { name: 'Curiosity', score: 8 },
      { name: 'Energy', score: 5 },
      { name: 'Sleepiness', score: 6 },
      { name: 'Mischief', score: 3 },
    ],
  },
  'blue-and-white-british-shorthair': {
    metaDescription:
      'Play with the Blue-and-White British Shorthair DeskPet—bicolor markings and balanced idle motion for everyday desktop company.',
    traits: ['Bicolor', 'Balanced', 'Friendly', 'Desktop-ready'],
    about: [
      'Blue-and-White British Shorthair splits the difference: cool blue patches against cream, with idle loops that feel a bit more expressive than solid-color siblings. Markings make it easy to spot on a busy wallpaper.',
      'It fits mixed days—some focus, some chat—because the animation reads lively enough to notice when you glance over, then settles again so you can keep typing.',
    ],
    stats: {
      temperament: 'Friendly & steady',
      activity: 'Medium',
      bestFor: 'Everyday desktop',
      desktopSize: 'Medium',
    },
    personality: [
      { name: 'Affection', score: 8 },
      { name: 'Curiosity', score: 7 },
      { name: 'Energy', score: 5 },
      { name: 'Sleepiness', score: 7 },
      { name: 'Mischief', score: 4 },
    ],
  },
  'tabby-cat': {
    metaDescription:
      'Meet the classic Tabby Cat desktop pet—striped, curious idle clips that feel playful beside your browser tabs.',
    traits: ['Striped', 'Curious', 'Playful', 'Desktop-ready'],
    about: [
      'Tabby Cat is the familiar striped face of the catalog: bold markings, brighter eyes, and idle motion that leans curious rather than sleepy. It feels like the pet that might follow your cursor—just a little.',
      'Choose it when you want a classic “cat on the desk” vibe without breed-specific fluff. Great for playful breaks between tasks and for showing friends a ready-made companion before they make their own.',
    ],
    stats: {
      temperament: 'Curious & social',
      activity: 'Medium to high',
      bestFor: 'Playful breaks',
      desktopSize: 'Medium',
    },
    personality: [
      { name: 'Affection', score: 8 },
      { name: 'Curiosity', score: 9 },
      { name: 'Energy', score: 7 },
      { name: 'Sleepiness', score: 5 },
      { name: 'Mischief', score: 6 },
    ],
  },
  'cheese-tabby': {
    metaDescription:
      'Preview Cheese Tabby on DeskPet—a warm orange-tabby companion with sunny idle motion for lighter moods at work.',
    traits: ['Sunny', 'Bold', 'Cheerful', 'Desktop-ready'],
    about: [
      'Cheese Tabby leans into warm orange stripes and a slightly bolder silhouette. Idle clips feel sunnier than the cooler British Shorthairs—more stretch, more glance, more “I am here” energy.',
      'It is a strong pick for morning planning or creative sprints when you want the desktop pet to feel upbeat without turning into a full game. Pair it with a light wallpaper and it almost glows.',
    ],
    stats: {
      temperament: 'Cheerful & bold',
      activity: 'Medium to high',
      bestFor: 'Creative sprints',
      desktopSize: 'Medium',
    },
    personality: [
      { name: 'Affection', score: 8 },
      { name: 'Curiosity', score: 8 },
      { name: 'Energy', score: 8 },
      { name: 'Sleepiness', score: 4 },
      { name: 'Mischief', score: 7 },
    ],
  },
  'scottish-fold': {
    metaDescription:
      'Try the Scottish Fold desktop pet—folded ears, soft posture, and gentle loops that feel uniquely calm on screen.',
    traits: ['Folded ears', 'Soft', 'Endearing', 'Desktop-ready'],
    about: [
      'Scottish Fold is instantly readable: those folded ears and rounded outline make the silhouette unique even at small desktop sizes. Idle motion stays soft—almost pillow-like—so it never feels sharp next to dense UI.',
      'Use it when you want a companion that feels different from standard shorthairs at a glance. Ideal for long reading, journaling, or evenings when the desk should feel quieter.',
    ],
    stats: {
      temperament: 'Soft & endearing',
      activity: 'Low',
      bestFor: 'Quiet evenings',
      desktopSize: 'Compact',
    },
    personality: [
      { name: 'Affection', score: 9 },
      { name: 'Curiosity', score: 6 },
      { name: 'Energy', score: 3 },
      { name: 'Sleepiness', score: 9 },
      { name: 'Mischief', score: 2 },
    ],
  },
  'tuxedo-cat': {
    metaDescription:
      'Meet the Tuxedo Cat DeskPet—sharp black-and-white markings and crisp idle loops with a touch of mischief.',
    traits: ['Formal', 'Crisp', 'Cheeky', 'Desktop-ready'],
    about: [
      'Tuxedo Cat wears the classic black-and-white suit: high contrast that pops on light or dark wallpapers. Idle loops feel a notch more mischievous—tiny lean-ins and glances that suggest it knows where your mouse is.',
      'It works well when you want the pet to feel like a character, not just a soft blob. Great for presentations on the side, late coding, or anyone who likes a formal look with a wink.',
    ],
    stats: {
      temperament: 'Cheeky & sharp',
      activity: 'Medium',
      bestFor: 'Night coding',
      desktopSize: 'Slim',
    },
    personality: [
      { name: 'Affection', score: 7 },
      { name: 'Curiosity', score: 8 },
      { name: 'Energy', score: 6 },
      { name: 'Sleepiness', score: 5 },
      { name: 'Mischief', score: 8 },
    ],
  },
} as const satisfies Record<string, CatalogPetDetailCopy>;

/**
 * Detail-page copy for a public preset breed; generic fallback otherwise.
 */
export function getCatalogPetDetailCopy(breed: string): CatalogPetDetailCopy {
  if (Object.hasOwn(CATALOG_PET_DETAIL_COPY, breed)) {
    return CATALOG_PET_DETAIL_COPY[breed as PetBreed];
  }
  return FALLBACK_DETAIL_COPY;
}
