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

/** Normalize API preview image values (raw base64 or data URL) into a usable src. */
export function previewImageToSrc(value?: string | null, mimeType = 'image/jpeg'): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/api/')) {
    return trimmed;
  }

  // Filenames / relative paths are not base64.
  if (isProbablyFilePath(trimmed)) return null;

  return `data:${mimeType};base64,${trimmed}`;
}

function isProbablyFilePath(value: string): boolean {
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(value)) return true;
  if (value.includes('\\') || value.includes('/') || value.includes(' ')) return true;
  return false;
}

export function resolveAttachmentImageSrc(
  attachment?: {
    file?: string | null;
    fileImage?: string | null;
    data?: string | null;
    url?: string | null;
    filePath?: string | null;
    attachmentFilePath?: string | null;
    [key: string]: unknown;
  } | null,
  fallbackFileImage?: string | null,
  getUploadUrl?: (filePath?: string | null) => string | null,
): string | null {
  if (attachment) {
    const inlineCandidates = [
      attachment.fileImage,
      attachment.file,
      attachment.data,
      attachment.url,
      typeof attachment.FileImage === 'string' ? attachment.FileImage : null,
      typeof attachment.File === 'string' ? attachment.File : null,
    ];

    for (const candidate of inlineCandidates) {
      const src = previewImageToSrc(typeof candidate === 'string' ? candidate : null);
      if (src) return src;
    }

    const pathCandidates = [
      attachment.filePath,
      attachment.attachmentFilePath,
      typeof attachment.FilePath === 'string' ? attachment.FilePath : null,
      isProbablyFilePath(String(attachment.file || '')) ? attachment.file : null,
    ];

    for (const path of pathCandidates) {
      if (typeof path !== 'string' || !path.trim()) continue;
      const src = getUploadUrl?.(path.trim()) ?? previewImageToSrc(path.trim());
      if (src) return src;
    }
  }

  return previewImageToSrc(fallbackFileImage);
}
