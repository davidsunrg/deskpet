import { PetSpecies } from '@/utils/pet-catalog';
import type { PetResourceManifest } from '@/utils/pets/pet-resource-types';

export const miniGoldenRetrieverResources = {
  id: 'mini-golden-retriever',
  species: PetSpecies.Dog,
  breed: 'mini-golden-retriever',
  name: 'Mini Golden Retriever',
  avatarR2Key: 'avatars/aeb2a91e-493b-4202-80ec-f70387a6da96.jpg',
  thumbnailR2Key: 'avatars/aeb2a91e-493b-4202-80ec-f70387a6da96.jpg',
  actions: [],
  visibility: {
    home: false,
    catalog: false,
    playground: false,
    detail: true,
  },
  detail: {
    playPresetKey: 'golden-retriever',
    title: 'Mini Golden Retriever Desktop Pet | DeskPet',
    description:
      'A compact, friendly Golden-like desktop companion backed by the playable Golden Retriever preset. Real-world traits vary because “mini golden retriever” is a descriptive term, not an official breed size.',
    catalogSource: 'Golden Retriever-inspired',
    heroBadgeLabel: 'Golden-like companion',
    availabilityText: 'Playable Golden preset',
    copy: {
      metaDescription:
        'Meet a Mini Golden Retriever desktop pet made for friendly, photo-ready companionship. The term commonly describes smaller Golden-like dogs, not an official Golden Retriever size.',
      traits: ['Compact', 'Friendly', 'Family-oriented', 'Photo-ready'],
      about: [
        '“Mini golden retriever” is commonly used for smaller Golden-like companions, including mixed or designer dogs with Golden Retriever ancestry. It is not an official standard size variant of the recognized Golden Retriever breed, and an individual dog’s size, coat, and temperament can vary.',
        'This keyword companion uses DeskPet’s existing Golden Retriever preset for its playable preview. It offers the warm, social desktop presence people often have in mind while keeping the real-world description honest and avoiding guarantees about breed recognition, adult size, or shedding.',
      ],
      stats: {
        temperament: 'Friendly; traits vary',
        activity: 'Medium',
        bestFor: 'Families & photo lovers',
        desktopSize: 'Compact',
      },
      personality: [
        { name: 'Affection', score: 9 },
        { name: 'Friendliness', score: 9 },
        { name: 'Playfulness', score: 8 },
        { name: 'Photo-ready', score: 9 },
        { name: 'Adaptability', score: 7 },
      ],
    },
    faqs: [
      {
        question:
          'Is a Mini Golden Retriever an official Golden Retriever size?',
        answer:
          'No. “Mini golden retriever” is a descriptive marketing term, not an official AKC or breed-standard size variety of the Golden Retriever. Real dogs sold under that label vary widely in ancestry and adult size.',
      },
      {
        question: 'What does “mini golden retriever” usually mean?',
        answer:
          'It commonly refers to smaller Golden-like companions, including mixed or designer dogs with Golden Retriever ancestry. Coat, temperament, and adult size can differ from dog to dog, so treat the label as descriptive rather than a guarantee.',
      },
      {
        question: 'Will a mini golden retriever stay small and shed less?',
        answer:
          'Not necessarily. Because the term is informal, adult size and shedding vary. Many Golden-like mixes still shed and need grooming. DeskPet does not claim a specific adult weight, coat type, or low-shed outcome.',
      },
      {
        question: 'How do I create a Mini Golden Retriever desktop pet?',
        answer:
          'Start from your own pet photos in DeskPet’s pet maker, or preview this keyword companion first. The page uses DeskPet’s existing Golden Retriever playable preset for interactive preview rather than duplicating separate media.',
      },
      {
        question: 'Why does the preview use the Golden Retriever preset?',
        answer:
          'This keyword page is about the “mini golden retriever” search intent and honest real-world copy. The playable animations come from DeskPet’s Golden Retriever catalog preset so you can try the friendly golden companion experience without inventing a separate unofficial breed media set.',
      },
    ],
  },
  notes:
    'Detail-page identity only; playable media comes from Golden Retriever.',
} as const satisfies PetResourceManifest;
