import { PetActionClip } from '@/enums/pet-action-clip';
import { PetBreed, PetSpecies } from '@/utils/pet-catalog';
import type { PetResourceManifest } from '@/utils/pets/pet-resource-types';

const displayScale = 1.4;

export const orangeCatResources = {
  id: PetBreed.OrangeCat,
  species: PetSpecies.Cat,
  breed: PetBreed.OrangeCat,
  name: 'Orange Cat',
  avatarR2Key: 'avatars/0a2feec5-95b7-4464-946e-019b2c6f38a9.jpg',
  thumbnailR2Key: 'avatars/0a2feec5-95b7-4464-946e-019b2c6f38a9.jpg',
  makerExample: {
    photoR2Key: 'pets/cat/orange-cat/photo.webp',
    petName: 'Darcy',
    uploadedBy: 'Jordan Lee',
    uploadedAt: 'Aug 16, 2026',
  },
  actions: [
    {
      key: PetActionClip.SitIdle,
      r2Key: 'actions/ff8d9382-0aee-4057-ad32-e1380b602c40.webm',
      displayScale,
      interaction: 'look-scrub',
    },
    {
      key: PetActionClip.SitToWalkLeft,
      r2Key: 'actions/fb4973b7-cafc-46c2-8aa4-79d872b45707.webm',
      displayScale,
      interaction: 'loop',
      motionConfig: {
        boxMotion: {
          enabled: true,
          direction: 'left',
          startAtSec: 1.5,
        },
      },
    },
    {
      key: PetActionClip.SitToWalkRight,
      r2Key: 'actions/ccfbe472-a357-4829-8c34-6fa2d956fc0e.webm',
      displayScale,
      interaction: 'loop',
      motionConfig: {
        boxMotion: {
          enabled: true,
          direction: 'right',
          startAtSec: 1.5,
        },
      },
    },
    {
      key: PetActionClip.WalkLeftLoop,
      r2Key: 'actions/01c49e1f-b91b-46ea-9f50-c93b1d0c0252.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.WalkRightLoop,
      r2Key: 'actions/3397811b-f64c-4804-8f32-a72ee10a5479.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.TurnLeftToRight,
      r2Key: 'actions/1a9c1719-d221-4023-af3b-bb5ecbea7096.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.TurnRightToLeft,
      r2Key: 'actions/f72f74bb-7bc2-4245-b70e-cb451eb3a693.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.WalkLeftToSit,
      r2Key: 'actions/70b4cad4-5ebb-4e17-85ba-4fbe363e0189.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.WalkRightToSit,
      r2Key: 'actions/039f1206-58c5-40fb-994c-97e6dc27d11f.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.BreakStretchToSit,
      r2Key: 'actions/99ba8330-da75-469c-ad25-aafc9158b96e.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.Lick,
      r2Key: 'actions/650bd927-7b57-4a1c-98bd-965b358dd86e.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.Scratch,
      r2Key: 'actions/4813a470-5eb8-4c8a-9da0-9fb51c93c939.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.Tease,
      r2Key: 'actions/20531ada-76d2-45fc-97a2-d633a869589d.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.LieDown,
      r2Key: 'actions/b675d445-b542-4bc8-b125-641d19e76bdf.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.SleepLoop,
      r2Key: 'actions/459f4ccb-fdf6-4d9d-b228-f576ccbacc67.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.CoverEyes,
      r2Key: 'actions/f93b1a88-2dc8-45ce-8c6e-c461bcbd7e43.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.SleepTurn,
      r2Key: 'actions/6f7d7064-2a8b-4d6a-947c-2b7ae034fe66.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.WakeUp,
      r2Key: 'actions/0326ecbe-0826-46d8-b115-8706bd1f57f5.webm',
      displayScale,
      interaction: 'loop',
    },
  ],
  detail: {
    faqs: [
      {
        question: 'What kind of cat is the Orange Cat?',
        answer:
          'Orange Cat is DeskPet’s orange tabby-style companion: warm coat color, classic striped energy, and a playful desktop presence. It is a catalog personality rather than a claim about a specific registered breed.',
      },
      {
        question: 'What personality should I expect from this Orange Cat?',
        answer:
          'Expect a curious, expressive, and slightly mischievous vibe. The animations lean playful—stretches, teases, walks, and attentive idle looks—so the pet feels lively without turning into a full game.',
      },
      {
        question: 'Can I make an Orange Cat desktop pet from my own photos?',
        answer:
          'Yes. Use DeskPet’s photo-based pet maker to turn your own orange tabby or similar cat into a custom desktop companion. This catalog Orange Cat is a ready-made starting point you can preview first.',
      },
      {
        question: 'What can the Orange Cat do on my desktop?',
        answer:
          'In the browser Playground, Orange Cat can sit, walk, turn, stretch, lick, scratch, tease, lie down, sleep, and wake up. Idle looking tracks your cursor so the companion stays engaged while you work.',
      },
      {
        question: 'Is this Orange Cat better for playful or quiet desks?',
        answer:
          'It fits both, but it shines when you want a brighter, more playful presence. If you prefer a calmer companion, try a softer catalog pet; if you want sunny tabby energy, Orange Cat is a strong pick.',
      },
    ],
  },
  notes: 'Web resource manifest; Electron packaging remains separate.',
} as const satisfies PetResourceManifest;
