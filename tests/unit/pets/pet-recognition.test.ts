import { describe, expect, test } from 'vitest';
import {
  DEFAULT_ARK_SEED_MODEL_ID,
  isArkSeedModelId,
  resolveArkSeedModelId,
  ArkSeedModel,
} from '@/lib/ai/ark-seed-models';
import { parseJsonObjectFromText } from '@/lib/ai/parse-json-object-from-text';
import {
  buildCreatorPetRecognitionPrompt,
  buildRecognitionCatalogSnapshot,
} from '@/prompts/common/recognition/creator-pet-recognition-prompt';
import { normalizeCreatorPetRecognitionData } from '@/utils/pets/creator-recognition';
import { assertPetMakerRecognitionPhotoKeys } from '@/utils/pets/pet-maker-recognition-keys';
import {
  buildPetMakerStagingKey,
  buildPetMakerStagingThumbnailKey,
} from '@/utils/pets/pet-maker-storage-keys';
import {
  isUnsupportedCreatorRecognitionSpecies,
  mapPetRecognitionToPrefill,
} from '@/utils/pets/map-pet-recognition-to-prefill';

describe('resolveArkSeedModelId', () => {
  test('prefers explicit model id', () => {
    expect(resolveArkSeedModelId(ArkSeedModel.Seed20Pro)).toBe(
      ArkSeedModel.Seed20Pro
    );
  });

  test('falls back to default Mini', () => {
    expect(resolveArkSeedModelId(null)).toBe(DEFAULT_ARK_SEED_MODEL_ID);
    expect(resolveArkSeedModelId('not-a-model')).toBe(
      DEFAULT_ARK_SEED_MODEL_ID
    );
    expect(isArkSeedModelId(DEFAULT_ARK_SEED_MODEL_ID)).toBe(true);
  });
});

describe('parseJsonObjectFromText', () => {
  test('parses bare JSON', () => {
    expect(parseJsonObjectFromText('{"species":"cat","breed":"any"}')).toEqual({
      species: 'cat',
      breed: 'any',
    });
  });

  test('parses fenced JSON and embedded objects', () => {
    expect(
      parseJsonObjectFromText('```json\n{"species":"dog","breed":"any"}\n```')
    ).toEqual({ species: 'dog', breed: 'any' });
    expect(
      parseJsonObjectFromText(
        'Here you go: {"species":"cat","breed":"any"} done'
      )
    ).toEqual({ species: 'cat', breed: 'any' });
  });
});

describe('creator recognition prompt', () => {
  test('embeds catalog species and breed ids', () => {
    const catalog = buildRecognitionCatalogSnapshot();
    const prompt = buildCreatorPetRecognitionPrompt(catalog);

    expect(catalog.species).toContain('cat');
    expect(catalog.species).toContain('dog');
    expect(catalog.breedsBySpecies.cat?.length).toBeGreaterThan(0);
    expect(prompt).toContain('Allowed species IDs');
    expect(prompt).toContain('character');
  });
});

describe('normalizeCreatorPetRecognitionData', () => {
  test('coerces catalog breed labels and clamps confidence', () => {
    const result = normalizeCreatorPetRecognitionData({
      species: 'Dog',
      breed: 'Golden Retriever',
      confidence: 1.8,
      colors: ['gold', 12, ''],
      markings: ['white chest'],
      visiblePose: 'sitting',
      notes: 'friendly',
    });

    expect(result.species).toBe('dog');
    expect(result.breed).toBe('golden-retriever');
    expect(result.confidence).toBe(1);
    expect(result.colors).toEqual(['gold']);
    expect(result.markings).toEqual(['white chest']);
  });

  test('maps character and unknown without breed lookup', () => {
    expect(
      normalizeCreatorPetRecognitionData({
        species: 'character',
        breed: 'something',
      }).species
    ).toBe('character');
    expect(
      normalizeCreatorPetRecognitionData({
        species: 'character',
        breed: 'something',
      }).breed
    ).toBe('any');
    expect(
      normalizeCreatorPetRecognitionData({ species: 'lizard' }).species
    ).toBe('unknown');
  });
});

describe('mapPetRecognitionToPrefill', () => {
  test('prefills supported species and leaves unsupported empty', () => {
    expect(
      mapPetRecognitionToPrefill({
        species: 'cat',
        breed: 'orange-cat',
      })
    ).toEqual({
      species: 'cat',
      breed: 'domestic-shorthair',
    });
    expect(isUnsupportedCreatorRecognitionSpecies('character')).toBe(true);
    expect(mapPetRecognitionToPrefill({ species: 'character' })).toEqual({
      species: '',
      breed: '',
    });
  });
});

describe('assertPetMakerRecognitionPhotoKeys', () => {
  const draftId = '11111111-1111-4111-8111-111111111111';

  test('accepts draft-owned staging keys', () => {
    const key = buildPetMakerStagingKey({
      draftId,
      fileId: '22222222-2222-4222-8222-222222222222',
      extension: 'webp',
    });
    const thumb = buildPetMakerStagingThumbnailKey({
      draftId,
      fileId: '22222222-2222-4222-8222-222222222222',
    });
    expect(
      assertPetMakerRecognitionPhotoKeys({
        draftId,
        photoKeys: [key],
      })
    ).toBeNull();
    expect(
      assertPetMakerRecognitionPhotoKeys({
        draftId,
        photoKeys: [thumb],
      })
    ).toBeNull();
  });

  test('rejects empty, oversize, and foreign keys', () => {
    expect(
      assertPetMakerRecognitionPhotoKeys({ draftId, photoKeys: [] })
    ).toMatch(/No uploaded photos/);
    expect(
      assertPetMakerRecognitionPhotoKeys({
        draftId,
        photoKeys: Array.from({ length: 9 }, (_, index) =>
          buildPetMakerStagingKey({
            draftId,
            fileId: `22222222-2222-4222-8222-22222222222${index}`,
            extension: 'webp',
          })
        ),
      })
    ).toMatch(/at most 8/);
    expect(
      assertPetMakerRecognitionPhotoKeys({
        draftId,
        photoKeys: ['pet-maker-staging/other-draft/file.webp'],
      })
    ).toMatch(/Invalid staging key/);
  });
});
