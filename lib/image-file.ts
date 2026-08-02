export const ALLOWED_IMAGE_ACCEPT = '.jpg,.jpeg,.png,image/jpeg,image/png';

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

export function isAllowedImageFile(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
    return false;
  }

  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    return false;
  }

  return true;
}
