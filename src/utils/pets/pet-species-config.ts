/**
 * Authoritative pet species / breed catalog.
 * Add a new species here — UI, validation, labels, and action routing read this.
 *
 * Every species gets an `Other` breed option (injected), including those with no
 * specific breeds listed.
 */

export type PetActionProfile = 'cat' | 'dog';

export type PetBreedConfig = {
  id: string;
  label: string;
  description: string;
};

export type PetSpeciesConfig = {
  label: string;
  /** Fallback avatar glyph when no photo is set. */
  iconEmoji: string;
  /** Which generated-action + prompt catalog to use. */
  actionProfile: PetActionProfile;
  /** Specific breeds for this species (excluding the shared `any` option). */
  breeds: readonly PetBreedConfig[];
};

/** Shared catch-all breed option available on every species (stored as `any`). */
export const ANY_PET_BREED_ID = 'any';

export const ANY_PET_BREED: PetBreedConfig = {
  id: ANY_PET_BREED_ID,
  label: 'Other',
  description:
    'Other is a friendly desktop companion you can preview, customize, and use as a starting point for your own pet.',
};

function breed(id: string, label: string): PetBreedConfig {
  return {
    id,
    label,
    description: `${label} is a friendly desktop companion you can preview, customize, and use as a starting point for your own pet.`,
  };
}

export const PET_SPECIES_CONFIG = {
  cat: {
    label: 'Cat',
    iconEmoji: '🐈',
    actionProfile: 'cat',
    breeds: [
      breed('blue-british-shorthair', 'Blue British Shorthair'),
      breed('golden-british-shorthair', 'Golden British Shorthair'),
      breed('silver-british-shorthair', 'Silver British Shorthair'),
      breed(
        'blue-and-white-british-shorthair',
        'Blue-and-White British Shorthair'
      ),
      breed('tabby-cat', 'Tabby Cat'),
      breed('cheese-tabby', 'Cheese Tabby'),
      breed('scottish-fold', 'Scottish Fold'),
      breed('tuxedo-cat', 'Tuxedo Cat'),
      breed('chinese-li-hua', 'Chinese Li Hua'),
      breed('birman', 'Birman'),
      breed('calico-cat', 'Calico Cat'),
      breed('chinese-lion-cat', 'Chinese Lion Cat'),
      breed('orange-cat', 'Orange Cat'),
      breed('persian-cat', 'Persian Cat'),
      breed('chinchilla-persian', 'Chinchilla Persian'),
      breed('sphynx', 'Sphynx'),
      breed('garfield-cat', 'Garfield Cat'),
      breed('bengal-cat', 'Bengal Cat'),
      breed('maine-coon', 'Maine Coon'),
      breed('ragdoll', 'Ragdoll'),
      breed('devon-rex', 'Devon Rex'),
      breed('american-curl', 'American Curl'),
      breed('siamese-cat', 'Siamese Cat'),
      breed('norwegian-forest-cat', 'Norwegian Forest Cat'),
      breed('bombay-cat', 'Bombay Cat'),
    ],
  },
  dog: {
    label: 'Dog',
    iconEmoji: '🐕',
    actionProfile: 'dog',
    breeds: [
      breed('golden-retriever', 'Golden Retriever'),
      breed('labrador-retriever', 'Labrador Retriever'),
      breed('german-shepherd', 'German Shepherd'),
      breed('french-bulldog', 'French Bulldog'),
      breed('bulldog', 'Bulldog'),
      breed('poodle', 'Poodle'),
      breed('beagle', 'Beagle'),
      breed('rottweiler', 'Rottweiler'),
      breed('german-shorthaired-pointer', 'German Shorthaired Pointer'),
      breed('dachshund', 'Dachshund'),
      breed('corgi', 'Corgi'),
      breed('australian-shepherd', 'Australian Shepherd'),
      breed('yorkshire-terrier', 'Yorkshire Terrier'),
      breed('boxer', 'Boxer'),
      breed('cavalier-king-charles-spaniel', 'Cavalier King Charles Spaniel'),
      breed('doberman-pinscher', 'Doberman Pinscher'),
      breed('miniature-schnauzer', 'Miniature Schnauzer'),
      breed('cane-corso', 'Cane Corso'),
      breed('great-dane', 'Great Dane'),
      breed('shih-tzu', 'Shih Tzu'),
      breed('boston-terrier', 'Boston Terrier'),
      breed('pomeranian', 'Pomeranian'),
      breed('havanese', 'Havanese'),
      breed('shetland-sheepdog', 'Shetland Sheepdog'),
      breed('brittany', 'Brittany'),
      breed('english-springer-spaniel', 'English Springer Spaniel'),
      breed('cocker-spaniel', 'Cocker Spaniel'),
      breed('pug', 'Pug'),
      breed('border-collie', 'Border Collie'),
      breed('mastiff', 'Mastiff'),
      breed('chihuahua', 'Chihuahua'),
      breed('maltese', 'Maltese'),
      breed('shiba-inu', 'Shiba Inu'),
      breed('husky', 'Siberian Husky'),
      breed('alaskan-malamute', 'Alaskan Malamute'),
      breed('samoyed', 'Samoyed'),
      breed('akita', 'Akita'),
      breed('chow-chow', 'Chow Chow'),
      breed('shar-pei', 'Shar Pei'),
      breed('basenji', 'Basenji'),
      breed('whippet', 'Whippet'),
      breed('greyhound', 'Greyhound'),
      breed('weimaraner', 'Weimaraner'),
      breed('vizsla', 'Vizsla'),
      breed('basset-hound', 'Basset Hound'),
      breed('bloodhound', 'Bloodhound'),
      breed('dalmatian', 'Dalmatian'),
      breed('bernese-mountain-dog', 'Bernese Mountain Dog'),
      breed('saint-bernard', 'Saint Bernard'),
      breed('newfoundland', 'Newfoundland'),
      breed('great-pyrenees', 'Great Pyrenees'),
      breed('belgian-malinois', 'Belgian Malinois'),
      breed('collie', 'Collie'),
      breed('old-english-sheepdog', 'Old English Sheepdog'),
      breed('irish-setter', 'Irish Setter'),
      breed('bichon-frise', 'Bichon Frise'),
      breed('west-highland-white-terrier', 'West Highland White Terrier'),
      breed('scottish-terrier', 'Scottish Terrier'),
      breed('jack-russell-terrier', 'Jack Russell Terrier'),
      breed('staffordshire-bull-terrier', 'Staffordshire Bull Terrier'),
      breed('american-staffordshire-terrier', 'American Staffordshire Terrier'),
      breed('afghan-hound', 'Afghan Hound'),
      breed('papillon', 'Papillon'),
      breed('pekingese', 'Pekingese'),
      breed('japanese-chin', 'Japanese Chin'),
      breed('japanese-spitz', 'Japanese Spitz'),
      breed('miniature-pinscher', 'Miniature Pinscher'),
      breed('italian-greyhound', 'Italian Greyhound'),
      breed('bull-terrier', 'Bull Terrier'),
      breed('airedale-terrier', 'Airedale Terrier'),
      breed('soft-coated-wheaten-terrier', 'Soft Coated Wheaten Terrier'),
      breed('rhodesian-ridgeback', 'Rhodesian Ridgeback'),
      breed('portuguese-water-dog', 'Portuguese Water Dog'),
    ],
  },
} as const satisfies Record<string, PetSpeciesConfig>;

export type PetSpecies = keyof typeof PET_SPECIES_CONFIG;

export const DEFAULT_PET_SPECIES: PetSpecies = 'cat';

export const PET_SPECIES_VALUES = Object.keys(
  PET_SPECIES_CONFIG
) as PetSpecies[];

type SpecificBreedId = {
  [S in PetSpecies]: (typeof PET_SPECIES_CONFIG)[S]['breeds'][number]['id'];
}[PetSpecies];

export type PetBreed = typeof ANY_PET_BREED_ID | (SpecificBreedId & string);

const BREED_ENTRIES: PetBreedConfig[] = [ANY_PET_BREED];
for (const species of PET_SPECIES_VALUES) {
  for (const item of PET_SPECIES_CONFIG[species].breeds) {
    BREED_ENTRIES.push(item);
  }
}

const BREED_BY_ID = new Map(
  BREED_ENTRIES.map((item) => [item.id, item] as const)
);

export const PET_BREED_VALUES = BREED_ENTRIES.map(
  (item) => item.id
) as PetBreed[];

export function getPetSpeciesConfig(species: PetSpecies) {
  return PET_SPECIES_CONFIG[species];
}

export function getPetSpeciesLabel(species: string): string {
  if (isPetSpeciesId(species)) {
    return PET_SPECIES_CONFIG[species].label;
  }
  return species;
}

export function getPetSpeciesIconEmoji(species: string): string {
  if (isPetSpeciesId(species)) {
    return PET_SPECIES_CONFIG[species].iconEmoji;
  }
  return '🐾';
}

export function getPetSpeciesActionProfile(species: string): PetActionProfile {
  if (isPetSpeciesId(species)) {
    return PET_SPECIES_CONFIG[species].actionProfile;
  }
  return PET_SPECIES_CONFIG[DEFAULT_PET_SPECIES].actionProfile;
}

export function getPetBreedConfig(breed: string): PetBreedConfig | null {
  return BREED_BY_ID.get(breed) ?? null;
}

export function getPetBreedLabel(breed: string): string {
  return getPetBreedConfig(breed)?.label ?? breed;
}

export function getPetBreedDescription(breed: string): string {
  return (
    getPetBreedConfig(breed)?.description ??
    `${breed} is a friendly desktop companion.`
  );
}

export function isPetSpeciesId(value: string): value is PetSpecies {
  return Object.hasOwn(PET_SPECIES_CONFIG, value);
}

/**
 * Whether the profile UI should show a breed picker.
 * Species with no specific breeds (only shared `other`/`any`) hide the picker.
 */
export function speciesUsesBreedsFromConfig(species: PetSpecies): boolean {
  return PET_SPECIES_CONFIG[species].breeds.length > 0;
}

export function listPetBreedIdsForSpecies(species: PetSpecies): PetBreed[] {
  const specific = PET_SPECIES_CONFIG[species].breeds.map(
    (item) => item.id as PetBreed
  );
  return [...specific, ANY_PET_BREED_ID];
}

export function normalizeBreedForSpeciesConfig(
  species: PetSpecies,
  breed: string
): PetBreed | null {
  const trimmed = breed.trim();
  // Empty or explicit Any → store shared sentinel.
  if (!trimmed || trimmed === ANY_PET_BREED_ID) {
    return ANY_PET_BREED_ID;
  }
  // Legacy breedless sentinel matched the species id (e.g. species → species).
  if (trimmed === species) {
    return ANY_PET_BREED_ID;
  }
  const match = PET_SPECIES_CONFIG[species].breeds.find(
    (item) => item.id === trimmed
  );
  return match ? (match.id as PetBreed) : null;
}
