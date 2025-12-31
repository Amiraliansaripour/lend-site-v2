import { useCallback } from 'react';

import mime from 'mime';

import { cn } from '@/lib/utils';
import { compact } from '@/utils/format';

import {
  FileIcon,
  FileCogIcon,
  FileCodeIcon,
  FileTextIcon,
  FileAudioIcon,
  FileVideoIcon,
  FileArchiveIcon,
} from 'lucide-react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type FilePreviewProps = {
  src: string;
  className?: string;
};

export function FilePreview({ src, className }: FilePreviewProps) {
  const type = mime.getType(src) ?? '';
  const filename = src.startsWith('data:image/')
    ? new Date().toISOString()
    : src.split('/').at(-1)!;

  const compactedFilename = compact(filename, { chunkSize: 8 });
  const hasBeenCompacted = filename.length !== compactedFilename.length;

  const getDefaultRender = useCallback(() => {
    if (type.startsWith('image/') || src.startsWith('data:image/')) {
      return <img src={src} alt={filename} className='size-full object-cover' />;
    }

    return getFileIcon(type, filename);
  }, []);

  return (
    <a
      href={src}
      download={filename}
      className={cn('flex items-center gap-2.5 rounded-md border p-3', className)}
    >
      <div className='flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-accent/50 [&>svg]:size-5'>
        {getDefaultRender()}
      </div>
      {hasBeenCompacted ? (
        <Tooltip>
          <TooltipTrigger type='button' className='text-sm -mb-1'>
            {compactedFilename}
          </TooltipTrigger>
          <TooltipContent>{filename}</TooltipContent>
        </Tooltip>
      ) : (
        filename
      )}
    </a>
  );
}

function getFileIcon(type: string, filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase() ?? '';

  if (type.startsWith('video/')) {
    return <FileVideoIcon />;
  }

  if (type.startsWith('audio/')) {
    return <FileAudioIcon />;
  }

  if (type.startsWith('text/') || ['txt', 'md', 'rtf', 'pdf'].includes(extension)) {
    return <FileTextIcon />;
  }

  if (
    [
      'html',
      'css',
      'js',
      'jsx',
      'ts',
      'tsx',
      'json',
      'xml',
      'php',
      'py',
      'rb',
      'java',
      'c',
      'cpp',
      'cs',
    ].includes(extension)
  ) {
    return <FileCodeIcon />;
  }

  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
    return <FileArchiveIcon />;
  }

  if (
    ['exe', 'msi', 'app', 'apk', 'deb', 'rpm'].includes(extension) ||
    type.startsWith('application/')
  ) {
    return <FileCogIcon />;
  }

  return <FileIcon />;
}
