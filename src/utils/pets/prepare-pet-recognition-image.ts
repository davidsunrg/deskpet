'use client';

import { computeActionReferenceDimensions } from '@/utils/pets/action-pose';

const PET_RECOGNITION_MAX_EDGE = 512;
const PET_RECOGNITION_MIME = 'image/webp';
const PET_RECOGNITION_QUALITY = 80;

export type PreparedPetRecognitionImage = {
  file: File;
  mimeType: typeof PET_RECOGNITION_MIME;
  byteSize: number;
  width: number;
  height: number;
};

function canvasToWebpFile(
  canvas: HTMLCanvasElement,
  quality: number,
  width: number,
  height: number
): Promise<PreparedPetRecognitionImage> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to encode recognition image.'));
          return;
        }
        const file = new File([blob], 'pet-recognition.webp', {
          type: PET_RECOGNITION_MIME,
          lastModified: Date.now(),
        });
        resolve({
          file,
          mimeType: PET_RECOGNITION_MIME,
          byteSize: file.size,
          width,
          height,
        });
      },
      PET_RECOGNITION_MIME,
      quality / 100
    );
  });
}

/**
 * Downscale a creator photo for Ark recognition (max 512px long edge, WebP).
 * Does not upscale. Preserves aspect ratio.
 */
export async function preparePetRecognitionImage(
  file: File
): Promise<PreparedPetRecognitionImage> {
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
      PET_RECOGNITION_MAX_EDGE
    );

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas is not available.');
    }
    context.drawImage(image, 0, 0, width, height);

    return canvasToWebpFile(canvas, PET_RECOGNITION_QUALITY, width, height);
  } finally {
    URL.revokeObjectURL(url);
  }
}
