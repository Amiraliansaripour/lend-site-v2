<<<<<<< HEAD
'use client';

import { type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Upload, X, FileCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  file: File;
  preview: string;
  id?: string;
}

interface UploadProgress {
  status: 'uploading' | 'success' | 'error';
  message: string;
  progress?: number;
}

interface FileUploadAreaProps<T extends string> {
  fileKey: T;
  label: string;
  uploadedFile?: UploadedFile;
  uploadProgress?: UploadProgress;
  onRefChange: (key: T, ref: HTMLInputElement | null) => void;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>, key: T) => void;
  onRemoveFile: (key: T) => void;
  accept?: string;
  maxSize?: number;
}

export function FileUploadArea<T extends string>({
  fileKey,
  label,
  uploadedFile,
  uploadProgress,
  onRefChange,
  onFileSelect,
  onRemoveFile,
  accept = 'image/*',
}: FileUploadAreaProps<T>) {
  return (
    <div className='space-y-2'>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 text-center transition-colors',
          uploadedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400',
        )}
      >
        <input
          ref={el => onRefChange(fileKey, el)}
          type='file'
          accept={accept}
          onChange={e => onFileSelect(e, fileKey)}
          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
        />

        {uploadedFile ? (
          <div className='space-y-2'>
            <div className='relative w-full h-32'>
              <Image
                src={uploadedFile.preview}
                alt={label}
                fill
                className='object-contain rounded'
              />
            </div>
            <div className='flex items-center justify-center gap-2'>
              {uploadProgress?.status === 'uploading' && (
                <div className='flex items-center gap-2'>
                  <Loader2 className='w-4 h-4 animate-spin text-blue-600' />
                  <span className='text-sm text-blue-600'>{uploadProgress.message}</span>
                </div>
              )}
              {uploadProgress?.status === 'success' && (
                <>
                  <FileCheck className='w-4 h-4 text-green-600' />
                  <span className='text-sm text-green-600'>آپلود موفق</span>
                </>
              )}
              {uploadProgress?.status === 'error' && (
                <span className='text-sm text-red-600'>{uploadProgress.message}</span>
              )}
            </div>
            <Button
              type='button'
              variant='destructive'
              size='sm'
              onClick={e => {
                e.stopPropagation();
                onRemoveFile(fileKey);
              }}
              className='mt-2'
            >
              <X className='w-4 h-4 mr-1' />
              حذف
            </Button>
          </div>
        ) : (
          <div className='py-4'>
            <Upload className='w-8 h-8 mx-auto mb-2 text-gray-400' />
            <p className='text-sm text-gray-600'>کلیک کنید یا فایل را بکشید</p>
            <p className='text-xs text-gray-500 mt-1'>حداکثر 3 مگابایت</p>
          </div>
        )}
      </div>
    </div>
  );
}
=======
'use client';

import { type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Upload, X, FileCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  file: File;
  preview: string;
  id?: string;
}

interface UploadProgress {
  status: 'uploading' | 'success' | 'error';
  message: string;
  progress?: number;
}

interface FileUploadAreaProps<T extends string> {
  fileKey: T;
  label: string;
  uploadedFile?: UploadedFile;
  uploadProgress?: UploadProgress;
  onRefChange: (key: T, ref: HTMLInputElement | null) => void;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>, key: T) => void;
  onRemoveFile: (key: T) => void;
  accept?: string;
  maxSize?: number;
}

export function FileUploadArea<T extends string>({
  fileKey,
  label,
  uploadedFile,
  uploadProgress,
  onRefChange,
  onFileSelect,
  onRemoveFile,
  accept = 'image/*',
}: FileUploadAreaProps<T>) {
  return (
    <div className='space-y-2'>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 text-center transition-colors',
          uploadedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400',
        )}
      >
        <input
          ref={el => onRefChange(fileKey, el)}
          type='file'
          accept={accept}
          onChange={e => onFileSelect(e, fileKey)}
          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
        />

        {uploadedFile ? (
          <div className='space-y-2'>
            <div className='relative w-full h-32'>
              <Image
                src={uploadedFile.preview}
                alt={label}
                fill
                className='object-contain rounded'
              />
            </div>
            <div className='flex items-center justify-center gap-2'>
              {uploadProgress?.status === 'uploading' && (
                <div className='flex items-center gap-2'>
                  <Loader2 className='w-4 h-4 animate-spin text-blue-600' />
                  <span className='text-sm text-blue-600'>{uploadProgress.message}</span>
                </div>
              )}
              {uploadProgress?.status === 'success' && (
                <>
                  <FileCheck className='w-4 h-4 text-green-600' />
                  <span className='text-sm text-green-600'>آپلود موفق</span>
                </>
              )}
              {uploadProgress?.status === 'error' && (
                <span className='text-sm text-red-600'>{uploadProgress.message}</span>
              )}
            </div>
            <Button
              type='button'
              variant='destructive'
              size='sm'
              onClick={e => {
                e.stopPropagation();
                onRemoveFile(fileKey);
              }}
              className='mt-2'
            >
              <X className='w-4 h-4 mr-1' />
              حذف
            </Button>
          </div>
        ) : (
          <div className='py-4'>
            <Upload className='w-8 h-8 mx-auto mb-2 text-gray-400' />
            <p className='text-sm text-gray-600'>کلیک کنید یا فایل را بکشید</p>
            <p className='text-xs text-gray-500 mt-1'>حداکثر 3 مگابایت</p>
          </div>
        )}
      </div>
    </div>
  );
}
>>>>>>> a47b58a (pwa)
