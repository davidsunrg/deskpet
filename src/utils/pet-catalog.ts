/**
 * Stable catalog keys for `pet.species` / `pet.breed`.
 * Source of truth: `utils/pets/pet-species-config.ts`.
 */

import {
  DEFAULT_PET_SPECIES,
  getPetBreedLabel,
  getPetSpeciesActionProfile,
  getPetSpeciesIconEmoji,
  getPetSpeciesLabel,
  isPetSpeciesId,
  listPetBreedIdsForSpecies,
  normalizeBreedForSpeciesConfig,
  PET_BREED_VALUES as CONFIG_PET_BREED_VALUES,
  PET_SPECIES_VALUES as CONFIG_PET_SPECIES_VALUES,
  speciesUsesBreedsFromConfig,
  type PetActionProfile,
  type PetBreed as ConfigPetBreed,
  type PetSpecies as ConfigPetSpecies,
} from '@/utils/pets/pet-species-config';

export type PetSpecies = ConfigPetSpecies;
export type PetBreed = ConfigPetBreed;
export type { PetActionProfile };

/**
 * Named species ids for call sites that prefer `PetSpecies.Cat` style access.
 * Derived from config keys — adding a species to config is enough for dropdowns
 * and validation; named members here are optional convenience.
 */
export const PetSpecies = {
  Cat: 'cat',
  Dog: 'dog',
} as const satisfies Record<string, PetSpecies>;

export enum PetSex {
  Male = 'male',
  Female = 'female',
}

/**
 * Named breed ids used by preset / catalog asset wiring.
 * Species/breed pickers do not require new members here — config is enough.
 */
export const PetBreed = {
  Any: 'any',
  AmericanShorthair: 'american-shorthair',
  BritishShorthair: 'british-shorthair',
  MaineCoon: 'maine-coon',
  Ragdoll: 'ragdoll',
  Persian: 'persian',
  Siamese: 'siamese',
  Bengal: 'bengal',
  Sphynx: 'sphynx',
  ScottishFold: 'scottish-fold',
  Abyssinian: 'abyssinian',
  RussianBlue: 'russian-blue',
  NorwegianForestCat: 'norwegian-forest-cat',
  Birman: 'birman',
  ExoticShorthair: 'exotic-shorthair',
  BritishLonghair: 'british-longhair',
  DevonRex: 'devon-rex',
  AmericanCurl: 'american-curl',
  Bombay: 'bombay',
  Burmese: 'burmese',
  Tonkinese: 'tonkinese',
  OrientalShorthair: 'oriental-shorthair',
  Balinese: 'balinese',
  Manx: 'manx',
  TurkishAngora: 'turkish-angora',
  TurkishVan: 'turkish-van',
  Himalayan: 'himalayan',
  Savannah: 'savannah',
  CornishRex: 'cornish-rex',
  SelkirkRex: 'selkirk-rex',
  Chartreux: 'chartreux',
  EgyptianMau: 'egyptian-mau',
  Ocicat: 'ocicat',
  Somali: 'somali',
  JapaneseBobtail: 'japanese-bobtail',
  AmericanBobtail: 'american-bobtail',
  Singapura: 'singapura',
  Snowshoe: 'snowshoe',
  Ragamuffin: 'ragamuffin',
  Siberian: 'siberian',
  Munchkin: 'munchkin',
  Peterbald: 'peterbald',
  LaPerm: 'la-perm',
  Nebelung: 'nebelung',
  HavanaBrown: 'havana-brown',
  Korat: 'korat',
  ChineseLiHua: 'chinese-li-hua',
  ChineseLionCat: 'chinese-lion-cat',
  DomesticShorthair: 'domestic-shorthair',
  DomesticLonghair: 'domestic-longhair',
  GoldenRetriever: 'golden-retriever',
  LabradorRetriever: 'labrador-retriever',
  GermanShepherd: 'german-shepherd',
  FrenchBulldog: 'french-bulldog',
  Bulldog: 'bulldog',
  Poodle: 'poodle',
  Beagle: 'beagle',
  Rottweiler: 'rottweiler',
  GermanShorthairedPointer: 'german-shorthaired-pointer',
  Dachshund: 'dachshund',
  Corgi: 'corgi',
  AustralianShepherd: 'australian-shepherd',
  YorkshireTerrier: 'yorkshire-terrier',
  Boxer: 'boxer',
  CavalierKingCharlesSpaniel: 'cavalier-king-charles-spaniel',
  DobermanPinscher: 'doberman-pinscher',
  MiniatureSchnauzer: 'miniature-schnauzer',
  CaneCorso: 'cane-corso',
  GreatDane: 'great-dane',
  ShihTzu: 'shih-tzu',
  BostonTerrier: 'boston-terrier',
  Pomeranian: 'pomeranian',
  Havanese: 'havanese',
  ShetlandSheepdog: 'shetland-sheepdog',
  Brittany: 'brittany',
  EnglishSpringerSpaniel: 'english-springer-spaniel',
  CockerSpaniel: 'cocker-spaniel',
  Pug: 'pug',
  BorderCollie: 'border-collie',
  Mastiff: 'mastiff',
  Chihuahua: 'chihuahua',
  Maltese: 'maltese',
  ShibaInu: 'shiba-inu',
  Husky: 'husky',
  AlaskanMalamute: 'alaskan-malamute',
  Samoyed: 'samoyed',
  Akita: 'akita',
  ChowChow: 'chow-chow',
  SharPei: 'shar-pei',
  Basenji: 'basenji',
  Whippet: 'whippet',
  Greyhound: 'greyhound',
  Weimaraner: 'weimaraner',
  Vizsla: 'vizsla',
  BassetHound: 'basset-hound',
  Bloodhound: 'bloodhound',
  Dalmatian: 'dalmatian',
  BerneseMountainDog: 'bernese-mountain-dog',
  SaintBernard: 'saint-bernard',
  Newfoundland: 'newfoundland',
  GreatPyrenees: 'great-pyrenees',
  BelgianMalinois: 'belgian-malinois',
  Collie: 'collie',
  OldEnglishSheepdog: 'old-english-sheepdog',
  IrishSetter: 'irish-setter',
  BichonFrise: 'bichon-frise',
  WestHighlandWhiteTerrier: 'west-highland-white-terrier',
  ScottishTerrier: 'scottish-terrier',
  JackRussellTerrier: 'jack-russell-terrier',
  StaffordshireBullTerrier: 'staffordshire-bull-terrier',
  AmericanStaffordshireTerrier: 'american-staffordshire-terrier',
  AfghanHound: 'afghan-hound',
  Papillon: 'papillon',
  Pekingese: 'pekingese',
  JapaneseChin: 'japanese-chin',
  JapaneseSpitz: 'japanese-spitz',
  MiniaturePinscher: 'miniature-pinscher',
  ItalianGreyhound: 'italian-greyhound',
  BullTerrier: 'bull-terrier',
  AiredaleTerrier: 'airedale-terrier',
  SoftCoatedWheatenTerrier: 'soft-coated-wheaten-terrier',
  RhodesianRidgeback: 'rhodesian-ridgeback',
  PortugueseWaterDog: 'portuguese-water-dog',
} as const satisfies Record<string, PetBreed>;

export const PET_SPECIES_VALUES = CONFIG_PET_SPECIES_VALUES;
export const PET_BREED_VALUES = CONFIG_PET_BREED_VALUES;

export const CAT_BREED_VALUES = listPetBreedIdsForSpecies('cat');
export const DOG_BREED_VALUES = listPetBreedIdsForSpecies('dog');

const PET_BREED_SET = new Set<string>(PET_BREED_VALUES);

export function isPetSpecies(value: string): value is PetSpecies {
  return isPetSpeciesId(value);
}

export function isPetBreed(value: string): value is PetBreed {
  return PET_BREED_SET.has(value);
}

export function parsePetSpecies(value: string): PetSpecies {
  return isPetSpecies(value) ? value : DEFAULT_PET_SPECIES;
}

export function parsePetBreed(value: string): PetBreed | null {
  return isPetBreed(value) ? value : null;
}

/** Whether the profile UI should show a breed picker for this species. */
export function speciesUsesBreeds(species: PetSpecies): boolean {
  return speciesUsesBreedsFromConfig(species);
}

/**
 * Breeds available for a species dropdown.
 * Breed-less species return an empty list.
 */
export function listPetBreedsForSpecies(species: PetSpecies): PetBreed[] {
  return listPetBreedIdsForSpecies(species);
}

/**
 * Normalize / validate breed for persistence from species config.
 */
export function normalizePetBreedForSpecies(
  species: PetSpecies,
  breed: string
): PetBreed | null {
  return normalizeBreedForSpeciesConfig(species, breed);
}

export function isPetBreedForSpecies(
  species: PetSpecies,
  breed: string
): breed is PetBreed {
  return normalizePetBreedForSpecies(species, breed) != null;
}

export {
  getPetBreedLabel,
  getPetSpeciesActionProfile,
  getPetSpeciesIconEmoji,
  getPetSpeciesLabel,
};
