/**
 * X-style public pet handles: lowercase letters, numbers, underscore; 4–15 chars.
 */

export const PET_HANDLE_MIN_LENGTH = 4;
export const PET_HANDLE_MAX_LENGTH = 15;
/** Used when a name normalizes to nothing. */
export const PET_HANDLE_EMPTY_FALLBACK = 'pet';
/** Appended (possibly repeatedly) when the base is shorter than the minimum. */
export const PET_HANDLE_SHORT_PAD = '_pet';
/** Alphanumeric characters in a collision postfix (`_a1b2c3` → 6 chars). */
export const PET_HANDLE_COLLISION_RANDOM_LENGTH = 6;

const HANDLE_PATTERN = /^[a-z0-9_]{4,15}$/;
const RANDOM_ALPHANUM = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Normalize a display name into a base handle (no uniqueness postfix).
 */
export function normalizePetHandleBase(name: string): string {
  let handle = name
    .toLowerCase()
    // Separator runs (whitespace / punctuation) → underscore.
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!handle) {
    handle = PET_HANDLE_EMPTY_FALLBACK;
  }

  while (handle.length < PET_HANDLE_MIN_LENGTH) {
    handle = `${handle}${PET_HANDLE_SHORT_PAD}`;
  }

  handle = handle.slice(0, PET_HANDLE_MAX_LENGTH).replace(/_+$/g, '');

  if (handle.length < PET_HANDLE_MIN_LENGTH) {
    handle = `${handle}${PET_HANDLE_SHORT_PAD}`.slice(0, PET_HANDLE_MAX_LENGTH);
    handle = handle.replace(/_+$/g, '');
  }

  if (!isValidPetHandle(handle)) {
    return `${PET_HANDLE_EMPTY_FALLBACK}${PET_HANDLE_SHORT_PAD}`.slice(
      0,
      PET_HANDLE_MAX_LENGTH
    );
  }

  return handle;
}

export function isValidPetHandle(handle: string): boolean {
  return HANDLE_PATTERN.test(handle);
}

/** Build a random lowercase alphanumeric postfix body (no leading `_`). */
export function createPetHandleCollisionPostfixBody(
  random: () => number = Math.random
): string {
  let out = '';
  for (let i = 0; i < PET_HANDLE_COLLISION_RANDOM_LENGTH; i += 1) {
    const index = Math.floor(random() * RANDOM_ALPHANUM.length);
    out += RANDOM_ALPHANUM[index] ?? 'a';
  }
  return out;
}

/**
 * Append a collision postfix like `_a1b2c3`, truncating the base so the result
 * stays within {@link PET_HANDLE_MAX_LENGTH}.
 */
export function appendPetHandleCollisionPostfix(
  base: string,
  postfixBody: string = createPetHandleCollisionPostfixBody()
): string {
  const body = postfixBody
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, PET_HANDLE_COLLISION_RANDOM_LENGTH);
  const suffix = `_${body || createPetHandleCollisionPostfixBody()}`;
  const maxBaseLength = Math.max(1, PET_HANDLE_MAX_LENGTH - suffix.length);
  let truncated = base.slice(0, maxBaseLength).replace(/_+$/g, '');
  if (!truncated) {
    truncated = PET_HANDLE_EMPTY_FALLBACK.slice(0, maxBaseLength);
  }

  let handle = `${truncated}${suffix}`;
  if (handle.length > PET_HANDLE_MAX_LENGTH) {
    handle = handle.slice(0, PET_HANDLE_MAX_LENGTH);
  }

  if (!isValidPetHandle(handle)) {
    // Extremely defensive fallback that still fits the format.
    const fallbackBody = body
      .padEnd(PET_HANDLE_COLLISION_RANDOM_LENGTH, '0')
      .slice(0, PET_HANDLE_COLLISION_RANDOM_LENGTH);
    handle = `pet_${fallbackBody}`.slice(0, PET_HANDLE_MAX_LENGTH);
  }

  return handle;
}

/**
 * Candidate handle for attempt `0` (base) or later collision retries.
 */
export function petHandleCandidate(
  name: string,
  attempt: number,
  postfixBody?: string
): string {
  const base = normalizePetHandleBase(name);
  if (attempt <= 0) return base;
  return appendPetHandleCollisionPostfix(base, postfixBody);
}
