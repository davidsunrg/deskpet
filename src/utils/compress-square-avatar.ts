export const SQUARE_AVATAR_MIME = 'image/jpeg' as const;
export const SQUARE_AVATAR_MAX_EDGE = 512;
export const SQUARE_AVATAR_QUALITY = 0.82;

export type SquareCropPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CompressedSquareAvatar = {
  file: File;
  mimeType: typeof SQUARE_AVATAR_MIME;
  byteSize: number;
};

export function isSupportedAvatarImageType(type: string): boolean {
  return type === 'image/jpeg' || type === 'image/png' || type === 'image/webp';
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load avatar image.'));
    };
    image.src = url;
  });
}

function squareCropPixels(
  width: number,
  height: number
): { x: number; y: number; size: number } {
  const size = Math.min(width, height);
  return {
    x: Math.floor((width - size) / 2),
    y: Math.floor((height - size) / 2),
    size,
  };
}

async function encodeSquareAvatar(
  source: CanvasImageSource,
  crop: { x: number; y: number; size: number }
): Promise<CompressedSquareAvatar> {
  const outputSize = Math.min(SQUARE_AVATAR_MAX_EDGE, crop.size);
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create avatar canvas.');
  }

  ctx.drawImage(
    source,
    crop.x,
    crop.y,
    crop.size,
    crop.size,
    0,
    0,
    outputSize,
    outputSize
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error('Failed to encode avatar.'));
          return;
        }
        resolve(result);
      },
      SQUARE_AVATAR_MIME,
      SQUARE_AVATAR_QUALITY
    );
  });

  const file = new File([blob], 'avatar.jpg', {
    type: SQUARE_AVATAR_MIME,
    lastModified: Date.now(),
  });

  return {
    file,
    mimeType: SQUARE_AVATAR_MIME,
    byteSize: file.size,
  };
}

export async function compressSquareAvatar(
  file: File
): Promise<CompressedSquareAvatar> {
  const image = await loadImageFromFile(file);
  const crop = squareCropPixels(image.naturalWidth, image.naturalHeight);
  return encodeSquareAvatar(image, crop);
}

export async function compressSquareAvatarFromCrop(
  file: File,
  crop: SquareCropPixels
): Promise<CompressedSquareAvatar> {
  const image = await loadImageFromFile(file);
  const size = Math.min(crop.width, crop.height);
  return encodeSquareAvatar(image, {
    x: crop.x,
    y: crop.y,
    size,
  });
}
