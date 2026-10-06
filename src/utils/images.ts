/** Max embedded image size — keeps IndexedDB records reasonable. */
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export type ImageRejection = 'not-image' | 'too-large';

/** Validate a dropped/pasted file before embedding it as a data URL. */
export function validateImageFile(file: { type: string; size: number }): ImageRejection | null {
  if (!file.type.startsWith('image/')) return 'not-image';
  if (file.size > MAX_IMAGE_BYTES) return 'too-large';
  return null;
}

/** Read a File/Blob as a data URL for embedding in note HTML. */
export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}
