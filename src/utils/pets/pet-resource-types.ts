import type { PetActionClip } from '@/enums/pet-action-clip';
import type { PetSpecies } from '@/utils/pet-catalog';
import type { PetActionMotionConfig } from '@/utils/pets/pet-action-motion-config';

export type PetResourceInteraction = 'loop' | 'look-scrub';

export type PetResourceAction = {
  key: PetActionClip;
  /** Public object key relative to STORAGE_PUBLIC_URL. */
  r2Key: string;
  displayScale: number;
  interaction: PetResourceInteraction;
  motionConfig?: PetActionMotionConfig;
};

export type PetResourcePose = {
  key: string;
  /** Public object key relative to STORAGE_PUBLIC_URL. */
  r2Key: string;
  notes?: string;
};

export type PetResourceVisibility = {
  home?: boolean;
  catalog?: boolean;
  playground?: boolean;
  detail?: boolean;
};

export type PetResourceVisibilityTarget = keyof PetResourceVisibility;

export type PetResourceDetailCopy = {
  metaDescription: string;
  traits: readonly string[];
  about: readonly string[];
  stats: {
    temperament: string;
    activity: string;
    bestFor: string;
    desktopSize: string;
  };
  personality: readonly {
    name: string;
    score: number;
  }[];
};

export type PetResourceFaq = {
  question: string;
  answer: string;
};

/** Homepage before/after maker example: original photo → generated DeskPet. */
export type PetResourceMakerExample = {
  /** Input photo object key relative to STORAGE_PUBLIC_URL. */
  photoR2Key: string;
  /** Display name for the example pet. */
  petName: string;
  /** Display name of who uploaded the photo. */
  uploadedBy: string;
};

export type PetResourceDetail = {
  /** Catalog preset used for interactive preview media. Defaults to this resource. */
  playPresetKey?: string;
  /** Optional SEO title override. */
  title?: string;
  /** Detail-page description override. */
  description?: string;
  /** Source label shown in the detail stats. */
  catalogSource?: string;
  heroBadgeLabel?: string;
  availabilityText?: string;
  copy?: PetResourceDetailCopy;
  /** Pet-specific FAQ items shown on `/p/[slug]`. */
  faqs?: readonly PetResourceFaq[];
};

export type PetResourceManifest = {
  /** Stable public resource identifier. */
  id: string;
  species: PetSpecies;
  /** Catalog breed key or detail-page slug. */
  breed: string;
  /** Public display name used outside localized catalog copy. */
  name: string;
  /** Required public identity image relative to STORAGE_PUBLIC_URL. */
  avatarR2Key: string;
  /** Optional card-optimized image relative to STORAGE_PUBLIC_URL. */
  thumbnailR2Key?: string;
  /** Optional photo→DeskPet comparison used on the homepage hero. */
  makerExample?: PetResourceMakerExample;
  actions: readonly PetResourceAction[];
  poses?: readonly PetResourcePose[];
  visibility?: PetResourceVisibility;
  detail?: PetResourceDetail;
  notes?: string;
};
