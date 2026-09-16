'use client';

import { useState } from 'react';
import { Download, Expand, FileText, X } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getUploadUrl } from '@/lib/site-template';
import { cn } from '@/lib/utils';

export function resolveMessageAttachmentSrc(attachmentUrl?: string | null): string | null {
  if (!attachmentUrl) return null;

  const trimmed = attachmentUrl.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith('/uploads/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || '';
    return `${baseUrl}${trimmed}`;
  }

  return getUploadUrl(trimmed) || null;
}

export function isMessageImageAttachment(attachmentUrl?: string | null): boolean {
  if (!attachmentUrl) return false;
  const path = attachmentUrl.split('?')[0] ?? attachmentUrl;
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(path);
}

type MessageAttachmentProps = {
  attachmentUrl?: string | null;
  isMe?: boolean;
  fileLabel?: string;
};

export function MessageAttachment({
  attachmentUrl,
  isMe = false,
  fileLabel = 'فایل پیوست',
}: MessageAttachmentProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const src = resolveMessageAttachmentSrc(attachmentUrl);
  if (!src) return null;

  const isImage = isMessageImageAttachment(attachmentUrl) && !imgFailed;

  if (isImage) {
    return (
      <>
        <button
          type='button'
          onClick={() => setLightboxOpen(true)}
          className={cn(
            'group relative mt-2 block w-full overflow-hidden rounded-xl text-right',
            'max-w-[min(100%,17.5rem)] sm:max-w-[20rem]',
            'ring-1 ring-black/5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            isMe ? 'ring-white/15' : 'ring-border/60',
          )}
          aria-label='بزرگ‌نمایی تصویر'
        >
          {!imgLoaded && (
            <div className='absolute inset-0 animate-pulse bg-muted/60 dark:bg-muted/30' />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt='تصویر پیوست'
            loading='lazy'
            decoding='async'
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgFailed(true)}
            className={cn(
              'block h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]',
              'max-h-52 sm:max-h-64',
              !imgLoaded && 'opacity-0',
            )}
          />
          <span
            className={cn(
              'pointer-events-none absolute bottom-2 left-2 inline-flex size-7 items-center justify-center rounded-full',
              'bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100',
            )}
          >
            <Expand className='size-3.5' />
          </span>
        </button>

        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent
            showCloseButton={false}
            className='max-w-[min(96vw,56rem)] border-0 bg-transparent p-0 shadow-none sm:max-w-[min(96vw,56rem)]'
          >
            <DialogTitle className='sr-only'>پیش‌نمایش تصویر</DialogTitle>
            <div className='relative flex max-h-[90vh] flex-col items-center justify-center'>
              <button
                type='button'
                onClick={() => setLightboxOpen(false)}
                className='absolute -top-2 left-0 z-10 inline-flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/75'
                aria-label='بستن'
              >
                <X className='size-4' />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt='تصویر پیوست'
                className='max-h-[85vh] w-auto max-w-full rounded-xl object-contain shadow-2xl'
              />
              <a
                href={src}
                target='_blank'
                rel='noreferrer'
                download
                className='mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-black/70'
              >
                <Download className='size-3.5' />
                دانلود تصویر
              </a>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <a
      href={src}
      target='_blank'
      rel='noreferrer'
      className={cn(
        'mt-2 flex min-w-48 items-center gap-3 rounded-xl border px-3 py-2',
        isMe ? 'border-white/20 bg-white/10' : 'border-border bg-muted/40',
      )}
    >
      <div
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-lg',
          isMe ? 'bg-white/15' : 'bg-primary/10',
        )}
      >
        <FileText className={cn('size-4', isMe ? 'text-white' : 'text-primary')} />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{fileLabel}</p>
      </div>
      <Download
        className={cn('size-4 shrink-0', isMe ? 'text-white/60' : 'text-muted-foreground')}
      />
    </a>
  );
}
