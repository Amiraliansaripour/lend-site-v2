'use client';

import { useState, useCallback, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { uploadAttachment, deleteAttachment } from '@/api/facility';
import { toast } from 'sonner';
import { ZoomIn } from 'lucide-react';
import { useCreateInvoice, useChangeRequestState } from '@/mutations/request';
import { FileUploadArea } from '@/components/file-upload-area';
import { isAllowedImageFile, previewImageToSrc } from '@/lib/image-file';
import { getShopImageUrl } from '@/lib/shop-utils';
import type { RequestPreviewData } from '@/api/request';

interface ProformaInvoiceProps {
  requestId: string;
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  isEditMode?: boolean;
  isReadOnly?: boolean;
  previewData?: RequestPreviewData | null;
}

interface UploadedFile {
  file?: File;
  preview: string;
  id?: string;
  isExisting?: boolean;
}

interface UploadProgress {
  status: 'uploading' | 'success' | 'error';
  message: string;
  progress?: number;
}

function attachmentIdFromFilePath(filePath?: string | null): string | undefined {
  if (!filePath) return undefined;
  const filename = filePath.split(/[\\/]/).pop() || filePath;
  const id = filename.replace(/\.[^.]+$/, '');
  return id || undefined;
}

export function ProformaInvoice({
  requestId,
  onNext,
  onBack,
  onCancel,
  isEditMode = false,
  isReadOnly = false,
  previewData,
}: ProformaInvoiceProps) {
  const createInvoiceMutation = useCreateInvoice();
  const changeRequestStateMutation = useChangeRequestState();

  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [attachmentId, setAttachmentId] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!previewData || uploadedFile) return;

    const imageSrc =
      previewImageToSrc(previewData.invoiceFileImage) ||
      getShopImageUrl(previewData.invoiceAttachmentFilePath);

    if (!imageSrc) return;

    const existingId = attachmentIdFromFilePath(previewData.invoiceAttachmentFilePath);
    setUploadedFile({
      preview: imageSrc,
      id: existingId,
      isExisting: true,
    });
    setUploadProgress({ status: 'success', message: 'فایل موجود' });
    setAttachmentId(existingId ?? null);
  }, [previewData, uploadedFile]);

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

      if (!isAllowedImageFile(file)) {
        toast.error('فقط فایل‌های با پسوند jpg، jpeg و png مجاز هستند');
        event.target.value = '';
        return;
      }

      if (file.size > 3 * 1024 * 1024) {
        toast.error('حجم فایل باید کمتر از 3 مگابایت باشد');
        event.target.value = '';
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

    if (isReadOnly) return;

    if (!uploadedFile || uploadProgress?.status !== 'success') {
      toast.error('لطفا تصویر پیش‌فاکتور را آپلود کنید');
      return;
    }

    // Existing invoice from preview — continue without re-creating
    if (uploadedFile.isExisting && previewData?.invoiceId) {
      if (onNext) onNext();
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
                  isReadOnly ||
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
              {onBack && (
                <Button type='button' variant='outline' size='lg' onClick={onBack}>
                  بازگشت
                </Button>
              )}
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedFile.preview}
                alt='پیش فاکتور بزرگ شده'
                className='w-full h-full object-contain'
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
