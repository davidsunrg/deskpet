export type PresignedUploadTarget = {
  uploadUrl: string;
  contentType: string;
};

/**
 * Upload a file/blob directly to object storage with a browser PUT.
 */
export function uploadFileWithPresignedUrl(
  file: Blob,
  upload: PresignedUploadTarget,
  onProgress?: (percent: number) => void,
  label = 'upload'
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const contentType =
      upload.contentType.trim() || file.type || 'application/octet-stream';

    xhr.open('PUT', upload.uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject(new Error(`Storage upload failed (${xhr.status}) for ${label}`));
    };

    xhr.onerror = () => {
      reject(
        new Error(
          'Upload to storage failed. This is often a CORS issue — allow PUT with Content-Type from this origin on the bucket.'
        )
      );
    };

    xhr.send(file);
  });
}
