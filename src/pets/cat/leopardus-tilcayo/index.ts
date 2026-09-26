import { orangeCatResources } from '@/pets/cat/orange-cat';
import { PetSpecies } from '@/utils/pet-catalog';
import type { PetResourceManifest } from '@/utils/pets/pet-resource-types';

export const leopardusTilcayoResources = {
  id: 'leopardus-tilcayo',
  species: PetSpecies.Cat,
  breed: 'leopardus-tilcayo',
  name: 'Leopardus tilcayo',
  avatarR2Key: orangeCatResources.avatarR2Key,
  thumbnailR2Key: orangeCatResources.thumbnailR2Key,
  actions: orangeCatResources.actions,
  detail: {
    playPresetKey: 'orange-cat',
    title: 'Leopardus tilcayo Desktop Pet | DeskPet',
    description:
      'A rare Andean wild-cat lineage as a watchful desktop companion. This catalog page uses DeskPet’s playable cat preset for preview while keeping Leopardus tilcayo’s own identity and story.',
    catalogSource: 'Andean wild cat',
    heroBadgeLabel: 'Andean lineage',
    availabilityText: 'Playable cat preset',
    copy: {
      metaDescription:
        'Meet Leopardus tilcayo as a desktop pet inspired by small wild cats of the high Andes. Preview animations in your browser and learn about this rare lineage without confusing it with a domestic tabby.',
      traits: ['Watchful', 'Agile', 'High-altitude', 'Rare'],
      about: [
        'Leopardus tilcayo refers to a proposed lineage within the small spotted cats of the Andes—related to the better-known Andean mountain cat and other Leopardus species. It is not a domestic breed you would find in a typical home cat registry; it names a wild, high-elevation cat identity.',
        'This DeskPet catalog entry gives that lineage its own page, SEO, and FAQs while reusing the existing playable cat animation preset for the interactive preview. Think of it as a storytelling companion inspired by Andean wild cats, not a claim that the Orange Cat avatar is a field identification of Leopardus tilcayo.',
      ],
      stats: {
        temperament: 'Alert; wild lineage',
        activity: 'Medium–high',
        bestFor: 'Wildlife-curious desks',
        desktopSize: 'Compact cat preset',
      },
      personality: [
        { name: 'Curiosity', score: 9 },
        { name: 'Alertness', score: 9 },
        { name: 'Agility', score: 8 },
        { name: 'Independence', score: 8 },
        { name: 'Playfulness', score: 6 },
      ],
    },
    faqs: [
      {
        question: 'What is Leopardus tilcayo?',
        answer:
          'Leopardus tilcayo is used here for a rare Andean wild-cat lineage within the Leopardus genus—small, spotted cats adapted to harsh high-elevation habitats. This DeskPet page is a digital companion inspired by that identity, not a substitute for formal taxonomy or field guides.',
      },
      {
        question: 'Is this the same as the Orange Cat catalog pet?',
        answer:
          'No. Orange Cat is DeskPet’s sunny tabby-style companion with its own catalog id and copy. Leopardus tilcayo has a separate URL, labels, and detail story. Only the interactive preview preset is shared so you can try animations immediately.',
      },
      {
        question: 'Can I keep a real Leopardus tilcayo as a pet?',
        answer:
          'Wild Leopardus cats are protected wildlife in their native range and are not appropriate—or legal—as casual pets. DeskPet offers a digital way to appreciate the lineage on your desktop without impacting wild populations.',
      },
      {
        question: 'What can Leopardus tilcayo do in the Playground?',
        answer:
          'The preview uses the playable cat preset: sit, walk, turn, stretch, groom, tease, lie down, sleep, wake up, and cursor-following idle looks—similar motion to other cat catalog companions while this page keeps its own wild-cat framing.',
      },
      {
        question: 'How do I make my own Andean-inspired desktop pet?',
        answer:
          'Start from your own cat photos in DeskPet’s pet maker, or browse other catalog cats for presets. Use this page when you want copy and SEO centered on Leopardus tilcayo rather than a generic domestic breed.',
      },
    ],
  },
  notes: 'Web resource manifest; Electron packaging remains separate.',
} as const satisfies PetResourceManifest;
