import { useMemo } from 'react';

import { X, Upload } from 'lucide-react';

import { toast } from 'sonner';

import { useFieldContext } from '@/components/form';

import { Button } from '@/components/ui/button';

import { Label } from '../ui/label';
import {
  FileUpload,
  FileUploadItem,
  FileUploadList,
  FileUploadTrigger,
  FileUploadDropzone,
  FileUploadItemDelete,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  type FileUploadProps,
} from '../ui/file-upload';

import { FormFieldInfo } from './form-field-info';
import { FormFieldWrapper } from './form-field-wrapper';

type UploadError = keyof typeof UPLOAD_ERRORS;

type FileUploadFieldProps = Omit<FileUploadProps, 'value' | 'onValueChange' | 'onFileReject'> & {
  errors?: Partial<Record<UploadError, string>>;
};

const UPLOAD_ERRORS = {
  file_too_large: '',
  maximum_files_allowed: '',
  file_type_not_accepted: '',
} as const;

const mapUploadError = (message: string) => {
  const normalizedMessage = message
    .trim()
    .replace(/\d/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase() as UploadError;

  return normalizedMessage in UPLOAD_ERRORS ? normalizedMessage : null;
};

export function FileUploadField({ label, errors = {}, ...props }: FileUploadFieldProps) {
  const field = useFieldContext<File[]>();

  const uploadErrors = useMemo(() => ({ ...UPLOAD_ERRORS, ...errors }), []);

  const maxFiles = props.maxFiles ?? 2;
  const maxSize = props.maxSize ?? 5 * 1024 * 1024;

  return (
    <FormFieldWrapper>
      <Label htmlFor={field.name} className='capitalize'>
        {label ?? field.name}
      </Label>
      <FileUpload
        value={field.state.value}
        onValueChange={field.handleChange}
        onFileReject={(_, message) => {
          const mappedMessage = mapUploadError(message);
          toast.error(mappedMessage ? uploadErrors[mappedMessage] || message : message);
        }}
        {...props}
        maxSize={maxSize}
        maxFiles={maxFiles}
      >
        <FileUploadDropzone>
          <div className='flex flex-col items-center gap-1 text-center'>
            <div className='flex items-center justify-center rounded-full border p-2.5'>
              <Upload className='size-6 text-muted-foreground' />
            </div>
            <p className='font-medium text-sm'>Drag & drop files here</p>
            <p className='text-muted-foreground text-xs'>
              Or click to browse (max {maxFiles} files, up to {Math.round(maxSize / 1024 / 1024)}MB
              each)
            </p>
          </div>
          <FileUploadTrigger id={field.name} asChild>
            <Button variant='outline' size='sm' className='mt-2 w-fit cursor-pointer'>
              Browse files
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>

        <FileUploadList>
          {field.state.value.map((file, index) => (
            <FileUploadItem dir='rtl' key={index} value={file}>
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemDelete asChild>
                <Button variant='ghost' size='icon' className='size-7 cursor-pointer'>
                  <X />
                  <span className='sr-only'>Delete</span>
                </Button>
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>

      <FormFieldInfo meta={field.state.meta} />
    </FormFieldWrapper>
  );
}
