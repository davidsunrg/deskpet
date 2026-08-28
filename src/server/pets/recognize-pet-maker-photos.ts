import {
  arkJsonFromImages,
  isArkApiConfigured,
  type ArkImageInput,
} from '@/lib/ai/ark-client';
import {
  getArkSeedModel,
  resolveArkSeedModelId,
} from '@/lib/ai/ark-seed-models';
import { getObject } from '@/lib/storage/r2-s3';
import {
  buildCreatorPetRecognitionPrompt,
  buildRecognitionCatalogSnapshot,
  PET_RECOGNITION_SYSTEM,
} from '@/prompts/common/recognition/creator-pet-recognition-prompt';
import type {
  CreatorPetRecognitionData,
  CreatorRecognitionCache,
} from '@/types/creator-recognition';
import { normalizeCreatorPetRecognitionData } from '@/utils/pets/creator-recognition';
import {
  assertPetMakerRecognitionPhotoKeys,
  MAX_PET_MAKER_RECOGNITION_PHOTOS,
} from '@/utils/pets/pet-maker-recognition-keys';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type RecognizePetMakerPhotosInput = {
  draftId: string;
  photoKeys: string[];
  model?: string;
};

export type RecognizePetMakerPhotosResult =
  | {
      success: true;
      data: CreatorPetRecognitionData;
      model: string;
      modelLabel: string;
      cached: boolean;
      cache: CreatorRecognitionCache;
    }
  | {
      success: false;
      error: string;
      model: string;
      modelLabel: string;
      cached: false;
    };

export { assertPetMakerRecognitionPhotoKeys } from '@/utils/pets/pet-maker-recognition-keys';

function mimeTypeFromKey(key: string, contentType?: string): string {
  if (contentType && ALLOWED_MIME_TYPES.has(contentType)) {
    return contentType;
  }
  const lower = key.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

/**
 * Recognize pet maker staging photos via Ark vision.
 * Auth is not required — keys must belong to the provided draftId.
 */
export async function recognizePetMakerPhotos(
  input: RecognizePetMakerPhotosInput
): Promise<RecognizePetMakerPhotosResult> {
  const modelId = resolveArkSeedModelId(input.model);
  const modelLabel = getArkSeedModel(modelId)?.label ?? modelId;

  const keyError = assertPetMakerRecognitionPhotoKeys(input);
  if (keyError) {
    return {
      success: false,
      error: keyError,
      model: modelId,
      modelLabel,
      cached: false,
    };
  }

  if (!isArkApiConfigured()) {
    return {
      success: false,
      error: 'Pet recognition is not configured.',
      model: modelId,
      modelLabel,
      cached: false,
    };
  }

  try {
    const images: ArkImageInput[] = [];
    const photoKeys = input.photoKeys.slice(
      0,
      MAX_PET_MAKER_RECOGNITION_PHOTOS
    );

    for (const key of photoKeys) {
      const object = await getObject(key);
      if (object.body.byteLength <= 0) {
        return {
          success: false,
          error: 'One of the photos is empty.',
          model: modelId,
          modelLabel,
          cached: false,
        };
      }

      const mimeType = mimeTypeFromKey(key, object.contentType);
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return {
          success: false,
          error: 'Unsupported photo media type.',
          model: modelId,
          modelLabel,
          cached: false,
        };
      }

      images.push({
        mimeType,
        base64: uint8ArrayToBase64(object.body),
      });
    }

    const catalog = buildRecognitionCatalogSnapshot();
    const recognitionPrompt = buildCreatorPetRecognitionPrompt(catalog);
    const { data, model } = await arkJsonFromImages({
      images,
      system: PET_RECOGNITION_SYSTEM,
      prompt: recognitionPrompt,
      model: modelId,
    });

    const result = normalizeCreatorPetRecognitionData(data);
    const resolvedModelLabel = getArkSeedModel(model)?.label ?? modelLabel;
    const cache: CreatorRecognitionCache = {
      mediaIds: [...photoKeys].sort(),
      result,
      model,
      modelLabel: resolvedModelLabel,
      llmLogId: null,
      recognizedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: result,
      model,
      modelLabel: resolvedModelLabel,
      cached: false,
      cache,
    };
  } catch (error) {
    console.error('[recognizePetMakerPhotos]', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to recognize pet photos.',
      model: modelId,
      modelLabel,
      cached: false,
    };
  }
}
