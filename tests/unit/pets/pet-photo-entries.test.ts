import { describe, expect, test } from 'vitest';
import {
  buildPetMakerFinalThumbnailKey,
  buildPetMakerStagingThumbnailKey,
  fileIdFromKey,
  isPetMakerStagingThumbnailKey,
} from '@/utils/pets/pet-maker-storage-keys';
import {
  normalizePetPhotoEntries,
  petPhotoOwnedKeys,
  petPhotoPreviewKey,
  petPhotoPrimaryKeys,
} from '@/utils/pets/pet-photo-entries';
import { PET_MEDIA_THUMBNAIL_MAX_EDGE } from '@/utils/constants';

describe('pet maker thumbnail keys', () => {
  const draftId = '11111111-1111-4111-8111-111111111111';
  const fileId = '22222222-2222-4222-8222-222222222222';
  const userId = '33333333-3333-4333-8333-333333333333';
  const petId = '44444444-4444-4444-8444-444444444444';

  test('builds staging and final thumbnail keys', () => {
    expect(buildPetMakerStagingThumbnailKey({ draftId, fileId })).toBe(
      `pet-maker-staging/${draftId}/${fileId}.thumbnail.webp`
    );
    expect(buildPetMakerFinalThumbnailKey({ userId, petId, fileId })).toBe(
      `pet-maker/${userId}/${petId}/${fileId}.thumbnail.webp`
    );
  });

  test('detects thumbnail staging keys and extracts file ids', () => {
    const thumb = buildPetMakerStagingThumbnailKey({ draftId, fileId });
    expect(isPetMakerStagingThumbnailKey(thumb)).toBe(true);
    expect(fileIdFromKey(thumb)).toBe(fileId);
    expect(fileIdFromKey(`pet-maker-staging/${draftId}/${fileId}.webp`)).toBe(
      fileId
    );
  });
});

describe('normalizePetPhotoEntries', () => {
  test('normalizes legacy string arrays', () => {
    const entries = normalizePetPhotoEntries([
      'pet-maker/u/p/a.webp',
      '  ',
      'pet-maker/u/p/b.webp',
    ]);
    expect(entries).toEqual([
      { key: 'pet-maker/u/p/a.webp', thumbnailKey: null },
      { key: 'pet-maker/u/p/b.webp', thumbnailKey: null },
    ]);
    expect(petPhotoPrimaryKeys(entries)).toEqual([
      'pet-maker/u/p/a.webp',
      'pet-maker/u/p/b.webp',
    ]);
  });

  test('normalizes structured entries and prefers thumbnails for preview', () => {
    const entries = normalizePetPhotoEntries([
      {
        key: 'pet-maker/u/p/a.webp',
        thumbnailKey: 'pet-maker/u/p/a.thumbnail.webp',
      },
      { key: 'pet-maker/u/p/b.webp', thumbnailKey: null },
    ]);
    expect(petPhotoPreviewKey(entries[0]!)).toBe(
      'pet-maker/u/p/a.thumbnail.webp'
    );
    expect(petPhotoPreviewKey(entries[1]!)).toBe('pet-maker/u/p/b.webp');
    expect(petPhotoOwnedKeys(entries)).toEqual([
      'pet-maker/u/p/a.webp',
      'pet-maker/u/p/a.thumbnail.webp',
      'pet-maker/u/p/b.webp',
    ]);
  });

  test('matches reference thumbnail long-edge setting', () => {
    expect(PET_MEDIA_THUMBNAIL_MAX_EDGE).toBe(640);
  });
});
