export async function createPetAvatarUploadAction(_input: {
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  byteSize: number;
}) {
  return {
    data: {
      success: false as const,
      error: 'Pet avatar upload is not configured yet.',
    },
  };
}

export async function completePetAvatarUploadAction(_input: {
  key: string;
  previousImageUrl?: string | null;
}) {
  return {
    data: {
      success: false as const,
      error: 'Pet avatar upload is not configured yet.',
    },
  };
}
