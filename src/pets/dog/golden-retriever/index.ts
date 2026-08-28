import { PetActionClip } from '@/enums/pet-action-clip';
import { PetBreed, PetSpecies } from '@/utils/pet-catalog';
import type { PetResourceManifest } from '@/utils/pets/pet-resource-types';

const displayScale = 1.4;

export const goldenRetrieverResources = {
  id: PetBreed.GoldenRetriever,
  species: PetSpecies.Dog,
  breed: PetBreed.GoldenRetriever,
  name: 'Golden Retriever',
  avatarR2Key: 'avatars/aeb2a91e-493b-4202-80ec-f70387a6da96.jpg',
  thumbnailR2Key: 'avatars/aeb2a91e-493b-4202-80ec-f70387a6da96.jpg',
  makerExample: {
    photoR2Key: 'pets/dog/golden-retriever/photo.webp',
    petName: 'Cooper',
    uploadedBy: 'Alex Rivera',
    uploadedAt: 'Aug 22, 2026',
  },
  actions: [
    {
      key: PetActionClip.SitIdle,
      r2Key: 'actions/9176cd43-a81e-416c-a3fe-a6d54a4a122d.webm',
      displayScale,
      interaction: 'look-scrub',
    },
    {
      key: PetActionClip.SitToWalkLeft,
      r2Key: 'actions/76daaeb1-b400-41ee-b330-1d33cdcdb1fb.webm',
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
      r2Key: 'actions/4d2f7047-461f-4841-846b-3ae7def02f64.webm',
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
      r2Key: 'actions/fa2b5466-3a0c-40b3-86d4-bc8ec1ef1486.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.WalkRightLoop,
      r2Key: 'actions/91c284a6-3ea0-4626-9d01-e976529bb546.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.TurnLeftToRight,
      r2Key: 'actions/7e0d9515-b8be-429e-9dcb-de8c8fa50358.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.TurnRightToLeft,
      r2Key: 'actions/9fec309c-40f0-4567-a7fa-fb33e6ca10b3.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.WalkLeftToSit,
      r2Key: 'actions/0ecbc45f-9223-4324-95f6-eb1f23c88871.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.WalkRightToSit,
      r2Key: 'actions/5d5c14da-17af-4211-a25a-3d9b9101f574.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.BreakStretchToSit,
      r2Key: 'actions/e41dc4dd-ebe3-4eab-ab1f-0606105f5225.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.Lick,
      r2Key: 'actions/8776cbb8-5018-4766-9d31-4d0075690746.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.Scratch,
      r2Key: 'actions/471d3b60-e15b-4f8a-963e-3de4163e6af5.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.Tease,
      r2Key: 'actions/817f1b0e-7866-4b2e-88e5-554b5acfd3cc.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.LieDown,
      r2Key: 'actions/2ff6b822-2293-4467-82fa-e8f4779e8fde.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.SleepLoop,
      r2Key: 'actions/d38b5af2-e45d-4178-9ddc-1a04483a56a5.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.CoverEyes,
      r2Key: 'actions/1c956948-925b-4483-ad8d-5e25a92e31af.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.SleepTurn,
      r2Key: 'actions/32d8f87a-7245-4526-b2f2-71dca4b48957.webm',
      displayScale,
      interaction: 'loop',
    },
    {
      key: PetActionClip.WakeUp,
      r2Key: 'actions/95c037db-7061-402a-8dd5-d5a88676b6ee.webm',
      displayScale,
      interaction: 'loop',
    },
  ],
  detail: {
    faqs: [
      {
        question: 'What is a Golden Retriever like as a companion?',
        answer:
          'Golden Retrievers are known for being friendly, people-oriented, and eager to please. As a DeskPet companion, that translates into warm idle presence, social-feeling animations, and a breed personality that fits shared workspaces and family desks.',
      },
      {
        question: 'Is this Golden Retriever desktop pet good for families?',
        answer:
          'Yes. The Golden Retriever preset is designed as a welcoming, approachable companion. It works well for shared computers, family browsing, and anyone who wants a soft, social dog presence without needing a high-drama pet.',
      },
      {
        question: 'Do Golden Retrievers shed a lot in real life?',
        answer:
          'Real Golden Retrievers typically shed heavily and need regular brushing, especially seasonally. DeskPet does not change that real-world care reality; this page is about a digital companion inspired by the breed’s friendly look and temperament.',
      },
      {
        question: 'How do I create a Golden Retriever desktop pet?',
        answer:
          'You can preview this Golden Retriever in the browser Playground right away, or start from your own pet photos in DeskPet’s pet maker flow to build a custom companion with similar golden-coated character.',
      },
      {
        question: 'What can this Golden Retriever do in the Playground?',
        answer:
          'In Playground, the Golden Retriever can sit, walk, turn, stretch, lick, scratch, tease, lie down, sleep, and wake up. Idle looking follows your cursor so the pet feels present while you work.',
      },
    ],
  },
  notes: 'Web resource manifest; Electron packaging remains separate.',
} as const satisfies PetResourceManifest;
