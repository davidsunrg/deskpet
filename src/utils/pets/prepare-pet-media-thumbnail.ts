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
  /** Source media natural size (stored / PhotoSwipe / tile aspect). */
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

async function thumbnailFromImageFile(
  file: File
): Promise<PreparedPetMediaThumbnail> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('Failed to load image.'));
      element.src = url;
    });
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const canvas = drawThumbnail(image, width, height);
    return canvasToWebpFile(canvas, PET_MEDIA_THUMBNAIL_QUALITY, width, height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function thumbnailFromVideoFile(
  file: File
): Promise<PreparedPetMediaThumbnail> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = url;

    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error('Failed to load video.'));
    });

    // Seek near the start for a representative frame.
    const seekTo = Math.min(0.25, Math.max(0, (video.duration || 1) * 0.05));
    if (Number.isFinite(seekTo) && seekTo > 0) {
      await new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error('Failed to seek video.'));
        video.currentTime = seekTo;
      });
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      throw new Error('Video has no dimensions.');
    }

    const canvas = drawThumbnail(video, width, height);
    return canvasToWebpFile(canvas, PET_MEDIA_THUMBNAIL_QUALITY, width, height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Build a compressed WebP thumbnail for a photo or video before upload.
 * Returned width/height are the original media dimensions.
 */
export async function preparePetMediaThumbnail(
  file: File
): Promise<PreparedPetMediaThumbnail> {
  if (file.type.startsWith('image/')) {
    return thumbnailFromImageFile(file);
  }
  if (file.type.startsWith('video/')) {
    return thumbnailFromVideoFile(file);
  }
  throw new Error('Unsupported media type.');
}
