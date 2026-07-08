<<<<<<< HEAD
'use client';

import { useState, useCallback, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { uploadAttachment, deleteAttachment } from '@/api/facility';
import { toast } from 'sonner';
import { ZoomIn } from 'lucide-react';
import { useCreateInvoice, useChangeRequestState } from '@/mutations/request';
import { FileUploadArea } from '@/components/file-upload-area';

interface ProformaInvoiceProps {
  requestId: string;
  onNext?: () => void;
  onCancel?: () => void;
  isEditMode?: boolean;
}

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

export function ProformaInvoice({
  requestId,
  onNext,
  onCancel,
  isEditMode = false,
}: ProformaInvoiceProps) {
  const createInvoiceMutation = useCreateInvoice();
  const changeRequestStateMutation = useChangeRequestState();

  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [attachmentId, setAttachmentId] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadToServer = useCallback(async (file: File) => {
    setUploadProgress({ status: 'uploading', message: 'در حال آپلود...', progress: 0 });

    try {
      const formData = new FormData();
      formData.append('Name', file.name);
      formData.append('attachmentType', '106');
      formData.append('file', file);

      const result = await uploadAttachment(formData);

      setUploadProgress({ status: 'success', message: 'آپلود موفق' });
      setAttachmentId(result.id);
      toast.success('فایل با موفقیت آپلود شد');
    } catch {
      setUploadProgress({ status: 'error', message: 'خطا در آپلود' });
      toast.error('خطا در آپلود فایل');
    }
  }, []);

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 3 * 1024 * 1024) {
        toast.error('حجم فایل باید کمتر از 3 مگابایت باشد');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFile({
          file,
          preview: reader.result as string,
        });
        void uploadToServer(file);
      };
      reader.readAsDataURL(file);
    },
    [uploadToServer],
  );

  const handleRemoveFile = useCallback(async () => {
    if (attachmentId) {
      try {
        await deleteAttachment(attachmentId);
        toast.success('فایل حذف شد');
      } catch {
        toast.error('خطا در حذف فایل');
      }
    }

    setUploadedFile(null);
    setUploadProgress(null);
    setAttachmentId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [attachmentId]);

  useEffect(() => {
    return () => {
      if (uploadedFile?.preview) {
        URL.revokeObjectURL(uploadedFile.preview);
      }
    };
  }, [uploadedFile]);

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!uploadedFile || uploadProgress?.status !== 'success') {
      toast.error('لطفا تصویر پیش‌فاکتور را آپلود کنید');
      return;
    }

    if (!attachmentId) {
      toast.error('لطفا منتظر تکمیل آپلود باشید');
      return;
    }

    createInvoiceMutation.mutate(
      {
        requestId,
        attachmentId,
      },
      {
        onSuccess: response => {
          if (response.isSuccess) {
            changeRequestStateMutation.mutate(
              { id: requestId, requestState: 6 },
              {
                onSuccess: () => {
                  toast.success('اطلاعات با موفقیت ثبت شد');
                  if (onNext) {
                    onNext();
                  }
                },
                onError: () => {
                  toast.error('خطا در تغییر وضعیت درخواست');
                },
              },
            );
          } else {
            toast.error(response.message || 'خطا در ثبت اطلاعات');
          }
        },
        onError: () => {
          toast.error('خطا در ثبت اطلاعات');
        },
      },
    );
  };

  return (
    <>
      <form onSubmit={onFormSubmit} className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>پیش فاکتور</CardTitle>
            <CardDescription>پیش فاکتور خود را بارگذاری کنید</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <Label>پیش فاکتور</Label>
            <FileUploadArea
              fileKey='invoice'
              label=''
              uploadedFile={uploadedFile || undefined}
              uploadProgress={uploadProgress || undefined}
              onRefChange={(_, ref) => {
                fileInputRef.current = ref;
              }}
              onFileSelect={handleFileSelect}
              onRemoveFile={() => void handleRemoveFile()}
              accept='image/jpeg,image/png'
            />

            {uploadedFile && (
              <div className='flex justify-center'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <ZoomIn className='w-4 h-4 mr-2' />
                  مشاهده تصویر بزرگ
                </Button>
              </div>
            )}

            <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-gray-700'>
                فاکتور بارگذاری شده میبایست سربرگ دار و دارای مهر رسمی فروشگاه باشد. همچنین درج نام
                و نام خانوادگی خریدار، کد ملی خریدار، تاریخ صدور فاکتور، شماره فاکتور و مبلغ دقیق
                خرید به صورت کاملا واضح و خوانا ضروری میباشد.
              </p>
            </div>

            <div className='flex justify-center gap-4 pt-6'>
              <Button
                type='submit'
                disabled={
                  createInvoiceMutation.isPending ||
                  changeRequestStateMutation.isPending ||
                  !uploadedFile ||
                  uploadProgress?.status !== 'success'
                }
                size='lg'
              >
                {createInvoiceMutation.isPending || changeRequestStateMutation.isPending
                  ? 'در حال ثبت...'
                  : isEditMode
                    ? 'ویرایش'
                    : 'مرحله بعد'}
              </Button>
              {onCancel && (
                <Button type='button' variant='outline' size='lg' onClick={onCancel}>
                  انصراف
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className='max-w-4xl max-h-screen p-2'>
          {uploadedFile && (
            <div className='relative w-full h-[80vh]'>
              <Image
                src={uploadedFile.preview}
                alt='پیش فاکتور بزرگ شده'
                fill
                className='object-contain'
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
=======
'use client';

import { useState, useCallback, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { uploadAttachment, deleteAttachment } from '@/api/facility';
import { toast } from 'sonner';
import { ZoomIn } from 'lucide-react';
import { useCreateInvoice, useChangeRequestState } from '@/mutations/request';
import { FileUploadArea } from '@/components/file-upload-area';

interface ProformaInvoiceProps {
  requestId: string;
  onNext?: () => void;
  onCancel?: () => void;
  isEditMode?: boolean;
}

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

export function ProformaInvoice({
  requestId,
  onNext,
  onCancel,
  isEditMode = false,
}: ProformaInvoiceProps) {
  const createInvoiceMutation = useCreateInvoice();
  const changeRequestStateMutation = useChangeRequestState();

  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [attachmentId, setAttachmentId] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadToServer = useCallback(async (file: File) => {
    setUploadProgress({ status: 'uploading', message: 'در حال آپلود...', progress: 0 });

    try {
      const formData = new FormData();
      formData.append('Name', file.name);
      formData.append('attachmentType', '106');
      formData.append('file', file);

      const result = await uploadAttachment(formData);

      setUploadProgress({ status: 'success', message: 'آپلود موفق' });
      setAttachmentId(result.id);
      toast.success('فایل با موفقیت آپلود شد');
    } catch {
      setUploadProgress({ status: 'error', message: 'خطا در آپلود' });
      toast.error('خطا در آپلود فایل');
    }
  }, []);

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 3 * 1024 * 1024) {
        toast.error('حجم فایل باید کمتر از 3 مگابایت باشد');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFile({
          file,
          preview: reader.result as string,
        });
        void uploadToServer(file);
      };
      reader.readAsDataURL(file);
    },
    [uploadToServer],
  );

  const handleRemoveFile = useCallback(async () => {
    if (attachmentId) {
      try {
        await deleteAttachment(attachmentId);
        toast.success('فایل حذف شد');
      } catch {
        toast.error('خطا در حذف فایل');
      }
    }

    setUploadedFile(null);
    setUploadProgress(null);
    setAttachmentId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [attachmentId]);

  useEffect(() => {
    return () => {
      if (uploadedFile?.preview) {
        URL.revokeObjectURL(uploadedFile.preview);
      }
    };
  }, [uploadedFile]);

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!uploadedFile || uploadProgress?.status !== 'success') {
      toast.error('لطفا تصویر پیش‌فاکتور را آپلود کنید');
      return;
    }

    if (!attachmentId) {
      toast.error('لطفا منتظر تکمیل آپلود باشید');
      return;
    }

    createInvoiceMutation.mutate(
      {
        requestId,
        attachmentId,
      },
      {
        onSuccess: response => {
          if (response.isSuccess) {
            changeRequestStateMutation.mutate(
              { id: requestId, requestState: 6 },
              {
                onSuccess: () => {
                  toast.success('اطلاعات با موفقیت ثبت شد');
                  if (onNext) {
                    onNext();
                  }
                },
                onError: () => {
                  toast.error('خطا در تغییر وضعیت درخواست');
                },
              },
            );
          } else {
            toast.error(response.message || 'خطا در ثبت اطلاعات');
          }
        },
        onError: () => {
          toast.error('خطا در ثبت اطلاعات');
        },
      },
    );
  };

  return (
    <>
      <form onSubmit={onFormSubmit} className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>پیش فاکتور</CardTitle>
            <CardDescription>پیش فاکتور خود را بارگذاری کنید</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <Label>پیش فاکتور</Label>
            <FileUploadArea
              fileKey='invoice'
              label=''
              uploadedFile={uploadedFile || undefined}
              uploadProgress={uploadProgress || undefined}
              onRefChange={(_, ref) => {
                fileInputRef.current = ref;
              }}
              onFileSelect={handleFileSelect}
              onRemoveFile={() => void handleRemoveFile()}
              accept='image/jpeg,image/png'
            />

            {uploadedFile && (
              <div className='flex justify-center'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <ZoomIn className='w-4 h-4 mr-2' />
                  مشاهده تصویر بزرگ
                </Button>
              </div>
            )}

            <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-gray-700'>
                فاکتور بارگذاری شده میبایست سربرگ دار و دارای مهر رسمی فروشگاه باشد. همچنین درج نام
                و نام خانوادگی خریدار، کد ملی خریدار، تاریخ صدور فاکتور، شماره فاکتور و مبلغ دقیق
                خرید به صورت کاملا واضح و خوانا ضروری میباشد.
              </p>
            </div>

            <div className='flex justify-center gap-4 pt-6'>
              <Button
                type='submit'
                disabled={
                  createInvoiceMutation.isPending ||
                  changeRequestStateMutation.isPending ||
                  !uploadedFile ||
                  uploadProgress?.status !== 'success'
                }
                size='lg'
              >
                {createInvoiceMutation.isPending || changeRequestStateMutation.isPending
                  ? 'در حال ثبت...'
                  : isEditMode
                    ? 'ویرایش'
                    : 'مرحله بعد'}
              </Button>
              {onCancel && (
                <Button type='button' variant='outline' size='lg' onClick={onCancel}>
                  انصراف
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className='max-w-4xl max-h-screen p-2'>
          {uploadedFile && (
            <div className='relative w-full h-[80vh]'>
              <Image
                src={uploadedFile.preview}
                alt='پیش فاکتور بزرگ شده'
                fill
                className='object-contain'
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
>>>>>>> a47b58a (pwa)
