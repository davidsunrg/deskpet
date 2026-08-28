'use client';

import {
  PET_MEDIA_THUMBNAIL_MAX_EDGE,
  PET_MEDIA_THUMBNAIL_MIME_TYPE,
  PET_MEDIA_THUMBNAIL_QUALITY,
} from '@/utils/constants';

export type PreparedPetMediaThumbnail = {
  file: File;
  mimeType: typeof PET_MEDIA_THUMBNAIL_MIME_TYPE;
  byteSize: number;
  /** Encoded thumbnail pixel size. */
  width: number;
  height: number;
};

function canvasToWebpFile(
  canvas: HTMLCanvasElement,
  quality: number,
  width: number,
  height: number
): Promise<PreparedPetMediaThumbnail> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to encode thumbnail.'));
          return;
        }
        const file = new File([blob], 'thumbnail.webp', {
          type: PET_MEDIA_THUMBNAIL_MIME_TYPE,
          lastModified: Date.now(),
        });
        resolve({
          file,
          mimeType: PET_MEDIA_THUMBNAIL_MIME_TYPE,
          byteSize: file.size,
          width,
          height,
        });
      },
      PET_MEDIA_THUMBNAIL_MIME_TYPE,
      quality / 100
    );
  });
}

function drawThumbnail(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number
): HTMLCanvasElement {
  const maxEdge = PET_MEDIA_THUMBNAIL_MAX_EDGE;
  const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is not available.');
  }
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

/**
 * Build a compressed WebP thumbnail for a pet maker photo before upload.
 * Max edge 640px, quality 75 — matches reference recognition thumbnails.
 */
export async function preparePetMediaThumbnail(
  file: File
): Promise<PreparedPetMediaThumbnail> {
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

    const canvas = drawThumbnail(image, sourceWidth, sourceHeight);
    return canvasToWebpFile(
      canvas,
      PET_MEDIA_THUMBNAIL_QUALITY,
      canvas.width,
      canvas.height
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
