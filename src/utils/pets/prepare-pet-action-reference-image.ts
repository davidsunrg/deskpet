'use client';

import {
  ACTION_POSE_REFERENCE_MAX_EDGE,
  ACTION_POSE_REFERENCE_MIME_TYPE,
  ACTION_POSE_REFERENCE_QUALITY,
  computeActionReferenceDimensions,
} from '@/utils/pets/action-pose';

export type PreparedPetActionReferenceImage = {
  file: File;
  mimeType: typeof ACTION_POSE_REFERENCE_MIME_TYPE;
  byteSize: number;
  width: number;
  height: number;
};

function canvasToWebpFile(
  canvas: HTMLCanvasElement,
  quality: number,
  width: number,
  height: number
): Promise<PreparedPetActionReferenceImage> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to encode reference image.'));
          return;
        }
        const file = new File([blob], 'action-reference.webp', {
          type: ACTION_POSE_REFERENCE_MIME_TYPE,
          lastModified: Date.now(),
        });
        resolve({
          file,
          mimeType: ACTION_POSE_REFERENCE_MIME_TYPE,
          byteSize: file.size,
          width,
          height,
        });
      },
      ACTION_POSE_REFERENCE_MIME_TYPE,
      quality / 100
    );
  });
}

/**
 * Compress an action reference photo to WebP (max 1536px long edge, q85).
 * Does not upscale smaller images. Preserves aspect ratio.
 */
export async function preparePetActionReferenceImage(
  file: File
): Promise<PreparedPetActionReferenceImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Unsupported media type.');
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('Failed to load image.'));
      element.src = url;
    });

    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;
    if (!sourceWidth || !sourceHeight) {
      throw new Error('Image has no dimensions.');
    }

    const { width, height } = computeActionReferenceDimensions(
      sourceWidth,
      sourceHeight,
      ACTION_POSE_REFERENCE_MAX_EDGE
    );

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas is not available.');
    }
    context.drawImage(image, 0, 0, width, height);

    return canvasToWebpFile(
      canvas,
      ACTION_POSE_REFERENCE_QUALITY,
      width,
      height
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
