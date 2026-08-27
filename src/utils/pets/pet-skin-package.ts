/**
 * Portable pet-skin package format (zip + manifest).
 * Downloaded / imported as `{pet-name}.zip`.
 */

import { unzipSync, zipSync, strFromU8, strToU8 } from 'fflate';
import {
  isPetBreedForSpecies,
  isPetSpecies,
  PetSex,
  type PetBreed,
  type PetSpecies,
} from '@/utils/pet-catalog';
import {
  parsePetActionMotionConfig,
  type PetActionMotionConfig,
} from '@/utils/pets/pet-action-motion-config';

export const PET_SKIN_SCHEMA_VERSION = 1 as const;
export const PET_SKIN_EXTENSION = '.zip';
/** Legacy download extension; still accepted on import. */
export const PET_SKIN_LEGACY_EXTENSION = '.petnet-skin';
export const PET_SKIN_MANIFEST_PATH = 'manifest.json';
export const PET_SKIN_AVATAR_DIR = 'avatar';
export const PET_SKIN_ACTIONS_DIR = 'actions';

/** Soft caps so a skin stays shareable without becoming a full project dump. */
export const PET_SKIN_MAX_PACKAGE_BYTES = 120 * 1024 * 1024;
export const PET_SKIN_MAX_AVATAR_BYTES = 8 * 1024 * 1024;
export const PET_SKIN_MAX_ACTION_BYTES = 40 * 1024 * 1024;
export const PET_SKIN_MAX_ACTIONS = 40;

const AVATAR_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
] as const);
const ACTION_MIME_TYPES = new Set(['video/webm'] as const);

const ACTION_KEY_RE = /^[a-z][a-z0-9_]{0,63}$/;
const SAFE_RELATIVE_PATH_RE = /^(avatar|actions)\/[a-zA-Z0-9._-]+$/;

export type PetSkinAvatarManifest = {
  path: string;
  mimeType: string;
  size?: number;
};

export type PetSkinActionManifest = {
  key: string;
  path: string;
  mimeType: string;
  displayScale: number;
  isActive: boolean;
  /** Optional box/window motion metadata for this clip. */
  motionConfig?: PetActionMotionConfig;
};

export type PetSkinPetManifest = {
  name: string;
  species: PetSpecies;
  breed: PetBreed;
  sex: PetSex;
};

export type PetSkinManifest = {
  schemaVersion: typeof PET_SKIN_SCHEMA_VERSION;
  pet: PetSkinPetManifest;
  avatar: PetSkinAvatarManifest;
  actions: PetSkinActionManifest[];
};

export type PetSkinPackageFile = {
  path: string;
  bytes: Uint8Array;
};

export type BuiltPetSkinPackage = {
  manifest: PetSkinManifest;
  files: PetSkinPackageFile[];
};

export type ParsedPetSkinPackage = {
  manifest: PetSkinManifest;
  files: Map<string, Uint8Array>;
  zipBytes: Uint8Array;
};

export class PetSkinPackageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PetSkinPackageError';
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new PetSkinPackageError(message);
  }
}

export function isPetSkinAvatarMimeType(value: string): boolean {
  return AVATAR_MIME_TYPES.has(value as 'image/jpeg');
}

export function isPetSkinActionMimeType(value: string): boolean {
  return ACTION_MIME_TYPES.has(value as 'video/webm');
}

export function extensionForPetSkinAvatarMime(mimeType: string): string {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return 'jpg';
}

export function sanitizePetSkinDownloadBasename(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[^\w.\-()+ ]+/g, '_')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, 80);
  return cleaned || 'pet';
}

export function petSkinDownloadFilename(petName: string): string {
  return `${sanitizePetSkinDownloadBasename(petName)}${PET_SKIN_EXTENSION}`;
}

/**
 * Build conflict-safe action filenames from keys
 * (`sit_idle.webm`, `sit_idle-2.webm`, …).
 */
export function allocatePetSkinActionFilenames(
  actionKeys: readonly string[]
): string[] {
  const counts = new Map<string, number>();
  return actionKeys.map((key) => {
    const safeKey = ACTION_KEY_RE.test(key) ? key : 'action';
    const seen = (counts.get(safeKey) ?? 0) + 1;
    counts.set(safeKey, seen);
    const stem = seen === 1 ? safeKey : `${safeKey}-${seen}`;
    return `${stem}.webm`;
  });
}

export function isSafePetSkinRelativePath(path: string): boolean {
  if (!path || path.includes('\\') || path.includes('\0')) return false;
  if (path.startsWith('/') || path.includes('..')) return false;
  if (path === PET_SKIN_MANIFEST_PATH) return true;
  return SAFE_RELATIVE_PATH_RE.test(path);
}

function normalizeZipPath(path: string): string {
  return path.replace(/^\/+/, '').replace(/\\/g, '/');
}

function assertNoForbiddenManifestFields(raw: unknown): void {
  assert(raw && typeof raw === 'object', 'manifest.json must be an object');
  const obj = raw as Record<string, unknown>;
  for (const key of [
    'petId',
    'id',
    'handle',
    'createdBy',
    'userId',
    'user_pet',
    'ratings',
    'rawFile',
    'thumbnailFile',
    'poseId',
    'poses',
    'sources',
    'gallery',
  ]) {
    assert(!(key in obj), `manifest must not include ${key}`);
  }
  if (obj.pet && typeof obj.pet === 'object') {
    const pet = obj.pet as Record<string, unknown>;
    for (const key of ['id', 'petId', 'handle', 'createdBy', 'userId']) {
      assert(!(key in pet), `manifest.pet must not include ${key}`);
    }
  }
  if (Array.isArray(obj.actions)) {
    for (const action of obj.actions) {
      if (!action || typeof action !== 'object') continue;
      const row = action as Record<string, unknown>;
      for (const key of [
        'id',
        'petId',
        'createdBy',
        'rating',
        'ratingComment',
        'rawFile',
        'thumbnailFile',
        'poseId',
        'thumbnail',
        'raw',
      ]) {
        assert(!(key in row), `manifest.actions[] must not include ${key}`);
      }
    }
  }
}

export function parsePetSkinManifest(raw: unknown): PetSkinManifest {
  assertNoForbiddenManifestFields(raw);
  const obj = raw as Record<string, unknown>;
  assert(
    obj.schemaVersion === PET_SKIN_SCHEMA_VERSION,
    `Unsupported schema version (expected ${PET_SKIN_SCHEMA_VERSION})`
  );

  assert(obj.pet && typeof obj.pet === 'object', 'manifest.pet is required');
  const petRaw = obj.pet as Record<string, unknown>;
  const name = typeof petRaw.name === 'string' ? petRaw.name.trim() : '';
  assert(name.length > 0 && name.length <= 80, 'manifest.pet.name is invalid');
  assert(
    typeof petRaw.species === 'string' && isPetSpecies(petRaw.species),
    'manifest.pet.species is unsupported'
  );
  const species = petRaw.species;
  assert(
    typeof petRaw.breed === 'string' &&
      isPetBreedForSpecies(species, petRaw.breed),
    'manifest.pet.breed is unsupported'
  );
  assert(
    petRaw.sex === PetSex.Male || petRaw.sex === PetSex.Female,
    'manifest.pet.sex is unsupported'
  );

  assert(
    obj.avatar && typeof obj.avatar === 'object',
    'manifest.avatar is required'
  );
  const avatarRaw = obj.avatar as Record<string, unknown>;
  assert(
    typeof avatarRaw.path === 'string' &&
      isSafePetSkinRelativePath(avatarRaw.path) &&
      avatarRaw.path.startsWith(`${PET_SKIN_AVATAR_DIR}/`),
    'manifest.avatar.path is invalid'
  );
  assert(
    typeof avatarRaw.mimeType === 'string' &&
      isPetSkinAvatarMimeType(avatarRaw.mimeType),
    'manifest.avatar.mimeType is invalid'
  );
  if (avatarRaw.size != null) {
    assert(
      typeof avatarRaw.size === 'number' &&
        Number.isFinite(avatarRaw.size) &&
        avatarRaw.size > 0 &&
        avatarRaw.size <= PET_SKIN_MAX_AVATAR_BYTES,
      'manifest.avatar.size is invalid'
    );
  }

  assert(Array.isArray(obj.actions), 'manifest.actions must be an array');
  assert(
    obj.actions.length <= PET_SKIN_MAX_ACTIONS,
    `Too many actions (max ${PET_SKIN_MAX_ACTIONS})`
  );

  const actions: PetSkinActionManifest[] = obj.actions.map((item, index) => {
    assert(item && typeof item === 'object', `actions[${index}] is invalid`);
    const row = item as Record<string, unknown>;
    assert(
      typeof row.key === 'string' && ACTION_KEY_RE.test(row.key),
      `actions[${index}].key is invalid`
    );
    assert(
      typeof row.path === 'string' &&
        isSafePetSkinRelativePath(row.path) &&
        row.path.startsWith(`${PET_SKIN_ACTIONS_DIR}/`) &&
        row.path.endsWith('.webm'),
      `actions[${index}].path is invalid`
    );
    assert(
      typeof row.mimeType === 'string' && isPetSkinActionMimeType(row.mimeType),
      `actions[${index}].mimeType is invalid`
    );
    assert(
      typeof row.displayScale === 'number' &&
        Number.isFinite(row.displayScale) &&
        row.displayScale > 0 &&
        row.displayScale <= 10,
      `actions[${index}].displayScale is invalid`
    );
    assert(
      typeof row.isActive === 'boolean',
      `actions[${index}].isActive is invalid`
    );
    let motionConfig: PetActionMotionConfig | undefined;
    if (row.motionConfig != null) {
      const parsed = parsePetActionMotionConfig(row.motionConfig);
      assert(parsed != null, `actions[${index}].motionConfig is invalid`);
      motionConfig = parsed;
    }
    return {
      key: row.key,
      path: row.path,
      mimeType: row.mimeType,
      displayScale: row.displayScale,
      isActive: row.isActive,
      ...(motionConfig?.boxMotion ? { motionConfig } : {}),
    };
  });

  const paths = new Set<string>();
  for (const action of actions) {
    assert(!paths.has(action.path), `Duplicate action path: ${action.path}`);
    paths.add(action.path);
  }

  return {
    schemaVersion: PET_SKIN_SCHEMA_VERSION,
    pet: {
      name,
      species,
      breed: petRaw.breed,
      sex: petRaw.sex,
    },
    avatar: {
      path: avatarRaw.path,
      mimeType: avatarRaw.mimeType,
      ...(typeof avatarRaw.size === 'number' ? { size: avatarRaw.size } : {}),
    },
    actions,
  };
}

export function buildPetSkinManifest(input: {
  pet: PetSkinPetManifest;
  avatar: {
    bytes: Uint8Array;
    mimeType: string;
  };
  actions: Array<{
    key: string;
    bytes: Uint8Array;
    mimeType: string;
    displayScale: number;
    isActive: boolean;
    motionConfig?: PetActionMotionConfig | null;
  }>;
}): BuiltPetSkinPackage {
  assert(input.pet.name.trim(), 'Pet name is required');
  assert(isPetSpecies(input.pet.species), 'Unsupported species');
  assert(
    isPetBreedForSpecies(input.pet.species, input.pet.breed),
    'Unsupported breed'
  );
  assert(
    input.pet.sex === PetSex.Male || input.pet.sex === PetSex.Female,
    'Unsupported sex'
  );
  assert(
    isPetSkinAvatarMimeType(input.avatar.mimeType),
    'Unsupported avatar MIME type'
  );
  assert(
    input.avatar.bytes.byteLength > 0 &&
      input.avatar.bytes.byteLength <= PET_SKIN_MAX_AVATAR_BYTES,
    'Avatar file size is invalid'
  );
  assert(
    input.actions.length <= PET_SKIN_MAX_ACTIONS,
    `Too many actions (max ${PET_SKIN_MAX_ACTIONS})`
  );

  const avatarPath = `${PET_SKIN_AVATAR_DIR}/avatar.${extensionForPetSkinAvatarMime(input.avatar.mimeType)}`;
  const filenames = allocatePetSkinActionFilenames(
    input.actions.map((action) => action.key)
  );

  const actions: PetSkinActionManifest[] = input.actions.map((action, i) => {
    assert(ACTION_KEY_RE.test(action.key), `Invalid action key: ${action.key}`);
    assert(
      isPetSkinActionMimeType(action.mimeType),
      `Unsupported action MIME for ${action.key}`
    );
    assert(
      action.bytes.byteLength > 0 &&
        action.bytes.byteLength <= PET_SKIN_MAX_ACTION_BYTES,
      `Action file size is invalid for ${action.key}`
    );
    assert(
      action.displayScale > 0 && action.displayScale <= 10,
      `Invalid displayScale for ${action.key}`
    );
    const motionConfig =
      action.motionConfig != null
        ? parsePetActionMotionConfig(action.motionConfig)
        : null;
    assert(
      action.motionConfig == null || motionConfig != null,
      `Invalid motionConfig for ${action.key}`
    );
    return {
      key: action.key,
      path: `${PET_SKIN_ACTIONS_DIR}/${filenames[i]}`,
      mimeType: action.mimeType,
      displayScale: action.displayScale,
      isActive: action.isActive,
      ...(motionConfig?.boxMotion ? { motionConfig } : {}),
    };
  });

  const manifest: PetSkinManifest = {
    schemaVersion: PET_SKIN_SCHEMA_VERSION,
    pet: {
      name: input.pet.name.trim(),
      species: input.pet.species,
      breed: input.pet.breed,
      sex: input.pet.sex,
    },
    avatar: {
      path: avatarPath,
      mimeType: input.avatar.mimeType,
      size: input.avatar.bytes.byteLength,
    },
    actions,
  };

  const files: PetSkinPackageFile[] = [
    {
      path: PET_SKIN_MANIFEST_PATH,
      bytes: strToU8(`${JSON.stringify(manifest, null, 2)}\n`),
    },
    { path: avatarPath, bytes: input.avatar.bytes },
    ...actions.map((action, i) => ({
      path: action.path,
      bytes: input.actions[i]!.bytes,
    })),
  ];

  return { manifest, files };
}

export function zipPetSkinPackage(
  files: readonly PetSkinPackageFile[]
): Uint8Array {
  const record: Record<string, Uint8Array> = {};
  for (const file of files) {
    assert(
      isSafePetSkinRelativePath(file.path),
      `Unsafe zip path: ${file.path}`
    );
    record[file.path] = file.bytes;
  }
  const zipped = zipSync(record, { level: 6 });
  assert(
    zipped.byteLength > 0 && zipped.byteLength <= PET_SKIN_MAX_PACKAGE_BYTES,
    'Package size is invalid'
  );
  return zipped;
}

export function parsePetSkinZip(zipBytes: Uint8Array): ParsedPetSkinPackage {
  assert(
    zipBytes.byteLength > 0 &&
      zipBytes.byteLength <= PET_SKIN_MAX_PACKAGE_BYTES,
    'Package size is invalid'
  );

  let unzipped: Record<string, Uint8Array>;
  try {
    unzipped = unzipSync(zipBytes);
  } catch {
    throw new PetSkinPackageError('Invalid pet skin zip');
  }

  const files = new Map<string, Uint8Array>();
  for (const [rawPath, bytes] of Object.entries(unzipped)) {
    const path = normalizeZipPath(rawPath);
    if (!path || path.endsWith('/')) continue;
    assert(isSafePetSkinRelativePath(path), `Unsafe zip path: ${path}`);
    files.set(path, bytes);
  }

  const manifestBytes = files.get(PET_SKIN_MANIFEST_PATH);
  assert(manifestBytes, 'manifest.json is missing');

  let rawManifest: unknown;
  try {
    rawManifest = JSON.parse(strFromU8(manifestBytes));
  } catch {
    throw new PetSkinPackageError('manifest.json is not valid JSON');
  }

  const manifest = parsePetSkinManifest(rawManifest);

  const expectedPaths = new Set<string>([
    PET_SKIN_MANIFEST_PATH,
    manifest.avatar.path,
    ...manifest.actions.map((action) => action.path),
  ]);

  for (const path of files.keys()) {
    assert(expectedPaths.has(path), `Unexpected file in package: ${path}`);
  }

  const avatarBytes = files.get(manifest.avatar.path);
  assert(avatarBytes, `Missing avatar file: ${manifest.avatar.path}`);
  assert(
    avatarBytes.byteLength > 0 &&
      avatarBytes.byteLength <= PET_SKIN_MAX_AVATAR_BYTES,
    'Avatar file size is invalid'
  );
  if (manifest.avatar.size != null) {
    assert(
      avatarBytes.byteLength === manifest.avatar.size,
      'Avatar size does not match manifest'
    );
  }

  for (const action of manifest.actions) {
    const bytes = files.get(action.path);
    assert(bytes, `Missing action file: ${action.path}`);
    assert(
      bytes.byteLength > 0 && bytes.byteLength <= PET_SKIN_MAX_ACTION_BYTES,
      `Action file size is invalid: ${action.key}`
    );
  }

  return { manifest, files, zipBytes };
}

/**
 * Ownership rewrite view used by import: strip any source identity and keep
 * only portable profile + playable action descriptors.
 */
export function toImportedPetSkinPayload(parsed: ParsedPetSkinPackage): {
  pet: PetSkinPetManifest;
  avatar: { path: string; mimeType: string; bytes: Uint8Array };
  actions: Array<{
    key: string;
    mimeType: string;
    displayScale: number;
    isActive: boolean;
    motionConfig?: PetActionMotionConfig;
    bytes: Uint8Array;
  }>;
} {
  const { manifest, files } = parsed;
  return {
    pet: { ...manifest.pet },
    avatar: {
      path: manifest.avatar.path,
      mimeType: manifest.avatar.mimeType,
      bytes: files.get(manifest.avatar.path)!,
    },
    actions: manifest.actions.map((action) => ({
      key: action.key,
      mimeType: action.mimeType,
      displayScale: action.displayScale,
      isActive: action.isActive,
      ...(action.motionConfig?.boxMotion
        ? { motionConfig: action.motionConfig }
        : {}),
      bytes: files.get(action.path)!,
    })),
  };
}
