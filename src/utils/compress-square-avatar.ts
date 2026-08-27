export const SQUARE_AVATAR_MIME = 'image/jpeg' as const;

export type SquareCropPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function isSupportedAvatarImageType(type: string): boolean {
  return type === 'image/jpeg' || type === 'image/png' || type === 'image/webp';
}

export async function compressSquareAvatarFromCrop(
  file: File,
  _crop: SquareCropPixels
): Promise<File> {
  return file;
}
