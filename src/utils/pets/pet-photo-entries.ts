/**
 * Pet photo storage entries: primary image + optional recognition/UI thumbnail.
 * Stored in the same `pet.photo_keys` JSON column.
 */

export type PetPhotoEntry = {
  key: string;
  thumbnailKey: string | null;
};

/** Narrow unknown JSON from `pet.photo_keys` into structured entries. */
export function normalizePetPhotoEntries(value: unknown): PetPhotoEntry[] {
  if (!Array.isArray(value)) return [];

  const entries: PetPhotoEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const key = typeof record.key === 'string' ? record.key.trim() : '';
    if (!key) continue;
    const thumbnailRaw = record.thumbnailKey;
    const thumbnailKey =
      typeof thumbnailRaw === 'string' && thumbnailRaw.trim()
        ? thumbnailRaw.trim()
        : null;
    entries.push({ key, thumbnailKey });
  }
  return entries;
}

/** Primary full-size keys only. */
export function petPhotoPrimaryKeys(entries: PetPhotoEntry[]): string[] {
  return entries.map((entry) => entry.key);
}

/** Prefer thumbnail for lightweight UI previews. */
export function petPhotoPreviewKey(entry: PetPhotoEntry): string {
  return entry.thumbnailKey || entry.key;
}

/** All owned storage keys (primary + thumbnail). */
export function petPhotoOwnedKeys(entries: PetPhotoEntry[]): string[] {
  const keys: string[] = [];
  for (const entry of entries) {
    keys.push(entry.key);
    if (entry.thumbnailKey) keys.push(entry.thumbnailKey);
  }
  return keys;
}
