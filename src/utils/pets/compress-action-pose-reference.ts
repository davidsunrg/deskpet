import {
  ACTION_POSE_REFERENCE_MAX_EDGE,
  ACTION_POSE_REFERENCE_MIME_TYPE,
  ACTION_POSE_REFERENCE_QUALITY,
  computeActionReferenceDimensions,
} from '@/utils/pets/action-pose';
import { encodeImage, resizeImage } from '@/server/fast/image';

export type CompressedActionPoseReference = {
  bytes: Buffer;
  mimeType: typeof ACTION_POSE_REFERENCE_MIME_TYPE;
  width: number;
  height: number;
  byteSize: number;
};

/**
 * Compress an action reference photo to WebP (max 1536px long edge, q85).
 * Server/CLI counterpart to the browser `preparePetActionReferenceImage`.
 */
export async function compressActionPoseReferenceBytes(
  input: Buffer
): Promise<CompressedActionPoseReference> {
  const meta = await encodeImage({
    bytes: input,
    format: 'png',
  });
  const sourceWidth = meta.width;
  const sourceHeight = meta.height;
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error('Reference image has invalid dimensions.');
  }

  const { width, height } = computeActionReferenceDimensions(
    sourceWidth,
    sourceHeight,
    ACTION_POSE_REFERENCE_MAX_EDGE
  );

  const resized = await resizeImage({
    bytes: input,
    width,
    height,
    fit: 'fill',
  });
  const encoded = await encodeImage({
    bytes: resized,
    format: 'webp',
    quality: ACTION_POSE_REFERENCE_QUALITY,
    orient: false,
  });

  return {
    bytes: encoded.bytes,
    mimeType: ACTION_POSE_REFERENCE_MIME_TYPE,
    width,
    height,
    byteSize: encoded.bytes.byteLength,
  };
}
