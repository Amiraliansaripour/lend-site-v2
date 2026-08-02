'use client';

import { useState, useCallback, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadAttachment, deleteAttachment } from '@/api/facility';
import { toast } from 'sonner';
import { Upload, X, FileCheck, Loader2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegisterCheque, useChangeRequestState } from '@/mutations/request';
import { ALLOWED_IMAGE_ACCEPT, isAllowedImageFile } from '@/lib/image-file';

interface ChequeRegistrationProps {
  requestId: string;
  guarantees?: string[];
  guaranteedAmount?: number;
  onNext?: (data?: ChequeFormData) => void;
  onBack?: () => void;
  onCancel?: () => void;
  isEditMode?: boolean;
  isReadOnly?: boolean;
}

interface ChequeFormData {
  sayadId: string;
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

const ATTACHMENT_TYPES = {
  chequeImage: 107,
  chequeBackImage: 107,
  promissoryImage: 111,
  salaryDeductionImage: 110,
} as const;

type FileKey = keyof typeof ATTACHMENT_TYPES;

const FILE_LABELS: Record<FileKey, string> = {
  chequeImage: 'تصویر چک صیادی',
  chequeBackImage: 'تصویر پشت چک صیادی',
  promissoryImage: 'تصویر سفته',
  salaryDeductionImage: 'تصویر مدرک کسر از حقوق',
};

interface FileUploadAreaProps {
  fileKey: FileKey;
  uploadedFile?: UploadedFile;
  uploadProgress?: UploadProgress;
  onRefChange: (key: FileKey, ref: HTMLInputElement | null) => void;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>, key: FileKey) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>, key: FileKey) => void;
  onRemoveFile: (key: FileKey) => void;
}

const FileUploadArea = ({
  fileKey,
  uploadedFile,
  uploadProgress,
  onRefChange,
  onFileSelect,
  onDrop,
  onRemoveFile,
}: FileUploadAreaProps) => {
  return (
    <div className='space-y-2'>
      <Label>{FILE_LABELS[fileKey]}</Label>
      <p className='text-xs text-blue-600 mb-2'>پسوندهای مجاز: jpg, jpeg, png (حداکثر 3 مگابایت)</p>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 text-center transition-colors',
          uploadedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400',
        )}
        onDragOver={e => e.preventDefault()}
        onDrop={e => onDrop(e, fileKey)}
      >
        <input
          ref={el => onRefChange(fileKey, el)}
          type='file'
          accept={ALLOWED_IMAGE_ACCEPT}
          onChange={e => onFileSelect(e, fileKey)}
          className={cn(
            'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
            uploadedFile && 'pointer-events-none',
          )}
        />

        {uploadedFile ? (
          <div className='relative z-10 space-y-2'>
            <div className='relative w-full h-32'>
              <Image
                src={uploadedFile.preview}
                alt={FILE_LABELS[fileKey]}
                fill
                className='object-contain rounded'
              />
            </div>
            <p className='text-xs text-gray-600 truncate'>{uploadedFile.file.name}</p>
            <div className='flex items-center justify-center gap-2'>
              {uploadProgress?.status === 'uploading' && (
                <>
                  <Loader2 className='w-4 h-4 text-blue-600 animate-spin' />
                  <span className='text-sm text-blue-600'>{uploadProgress.message}</span>
                </>
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
                e.preventDefault();
                e.stopPropagation();
                void onRemoveFile(fileKey);
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
          </div>
        )}
      </div>
    </div>
  );
};

export function ChequeRegistration({
  requestId,
  guarantees = [],
  guaranteedAmount,
  onNext,
  onBack,
  onCancel,
  isEditMode = false,
  isReadOnly = false,
}: ChequeRegistrationProps) {
  const registerChequeMutation = useRegisterCheque();
  const changeRequestStateMutation = useChangeRequestState();

  const [formData, setFormData] = useState<ChequeFormData>({
    sayadId: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<Partial<Record<FileKey, UploadedFile>>>({});
  const [uploadProgress, setUploadProgress] = useState<Partial<Record<FileKey, UploadProgress>>>(
    {},
  );
  const [shake, setShake] = useState(false);
  const [showHelpText, setShowHelpText] = useState(false);

  const [accordionStates, setAccordionStates] = useState({
    cheque: true,
    salaryDeduction: false,
    promissoryNote: false,
  });

  const fileInputRefs = useRef<Partial<Record<FileKey, HTMLInputElement | null>>>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const toggleAccordion = (section: keyof typeof accordionStates) => {
    setAccordionStates(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');

    if (input.length > 16) {
      input = input.slice(0, 16);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error('شناسه یکتای صیادی نمی‌تواند بیشتر از 16 رقم باشد');
    } else if (input.length < 16 && input.length > 0) {
      toast.info(`باقی‌مانده: ${16 - input.length} رقم`);
    }

    setFormData({ sayadId: input });
  };

  const uploadToServer = useCallback(async (file: File, key: FileKey) => {
    setUploadProgress(prev => ({
      ...prev,
      [key]: { status: 'uploading', message: 'در حال آپلود...', progress: 0 },
    }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('Name', file.name);
      formDataUpload.append('attachmentType', String(ATTACHMENT_TYPES[key]));
      formDataUpload.append('file', file);

      const result = await uploadAttachment(formDataUpload);

      setUploadProgress(prev => ({
        ...prev,
        [key]: { status: 'success', message: 'آپلود موفق' },
      }));

      setUploadedFiles(prev => ({
        ...prev,
        [key]: { ...prev[key]!, id: result.id },
      }));

      toast.success('فایل با موفقیت آپلود شد');
    } catch {
      setUploadProgress(prev => ({
        ...prev,
        [key]: { status: 'error', message: 'خطا در آپلود' },
      }));
      toast.error('خطا در آپلود فایل');
    }
  }, []);

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>, key: FileKey) => {
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
        setUploadedFiles(prev => ({
          ...prev,
          [key]: {
            file,
            preview: reader.result as string,
          },
        }));
        void uploadToServer(file, key);
      };
      reader.readAsDataURL(file);
    },
    [uploadToServer],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>, key: FileKey) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (!file) return;

      if (!isAllowedImageFile(file)) {
        toast.error('فقط فایل‌های با پسوند jpg، jpeg و png مجاز هستند');
        return;
      }

      if (file.size > 3 * 1024 * 1024) {
        toast.error('حجم فایل باید کمتر از 3 مگابایت باشد');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFiles(prev => ({
          ...prev,
          [key]: {
            file,
            preview: reader.result as string,
          },
        }));
        void uploadToServer(file, key);
      };
      reader.readAsDataURL(file);
    },
    [uploadToServer],
  );

  const handleRemoveFile = useCallback(
    async (key: FileKey) => {
      const fileData = uploadedFiles[key];
      if (fileData?.id) {
        try {
          await deleteAttachment(fileData.id);
          toast.success('فایل حذف شد');
        } catch {
          toast.error('خطا در حذف فایل');
        }
      }

      setUploadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[key];
        return newFiles;
      });

      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[key];
        return newProgress;
      });

      if (fileInputRefs.current[key]) {
        fileInputRefs.current[key]!.value = '';
      }
    },
    [uploadedFiles],
  );

  useEffect(() => {
    return () => {
      Object.values(uploadedFiles).forEach(fileData => {
        if (fileData?.preview) {
          URL.revokeObjectURL(fileData.preview);
        }
      });
    };
  }, [uploadedFiles]);

  // Canvas drawing effect for cheque preview
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imgRef.current;

    if (!canvas || !ctx || !img) return;

    const drawFallbackBackground = () => {
      ctx.fillStyle = '#f3eef7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#c4b5d4';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.fillText('شناسه صیادی:', 220, 56);
      ctx.fillText('مبلغ:', 193, 172);
    };

    const drawOverlay = () => {
      ctx.font = '14px Arial';
      ctx.fillStyle = '#000';

      if (formData.sayadId) {
        ctx.fillText(formData.sayadId, 220, 74);
      }

      if (guaranteedAmount) {
        ctx.fillText(guaranteedAmount.toString(), 193, 190);
      }
    };

    const drawCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // img.complete is true for broken images too — only draw when decode succeeded
      if (img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        drawFallbackBackground();
      }

      drawOverlay();
    };

    img.onload = drawCanvas;
    img.onerror = drawCanvas;

    if (img.complete) {
      drawCanvas();
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [formData.sayadId, guaranteedAmount]);

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isReadOnly) return;

    if (guarantees.includes('چک')) {
      if (formData.sayadId.length !== 16) {
        toast.error('شناسه یکتای صیادی باید 16 رقم باشد');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      if (!uploadedFiles.chequeImage || uploadProgress.chequeImage?.status !== 'success') {
        toast.error('لطفا تصویر چک صیادی را آپلود کنید');
        return;
      }

      if (!uploadedFiles.chequeBackImage || uploadProgress.chequeBackImage?.status !== 'success') {
        toast.error('لطفا تصویر پشت چک صیادی را آپلود کنید');
        return;
      }
    }

    if (guarantees.includes('کسر از حقوق')) {
      if (
        !uploadedFiles.salaryDeductionImage ||
        uploadProgress.salaryDeductionImage?.status !== 'success'
      ) {
        toast.error('لطفا تصویر مدرک کسر از حقوق را آپلود کنید');
        return;
      }
    }

    if (guarantees.includes('سفته')) {
      if (!uploadedFiles.promissoryImage || uploadProgress.promissoryImage?.status !== 'success') {
        toast.error('لطفا تصویر سفته را آپلود کنید');
        return;
      }
    }

    const payload = {
      sayadId: formData.sayadId || null,
      requestId,
      attachmentId: uploadedFiles.chequeImage?.id || null,
      attachmentBackId: uploadedFiles.chequeBackImage?.id || null,
      attachmentPromissoryId: uploadedFiles.promissoryImage?.id || null,
      attachmentDeductionSalaryId: uploadedFiles.salaryDeductionImage?.id || null,
    };

    registerChequeMutation.mutate(payload, {
      onSuccess: result => {
        if (result.isSuccess) {
          changeRequestStateMutation.mutate(
            { id: requestId, requestState: 7 },
            {
              onSuccess: () => {
                toast.success('اطلاعات با موفقیت ثبت شد');
                if (onNext) {
                  onNext(formData);
                }
              },
              onError: () => {
                toast.error('خطا در تغییر وضعیت درخواست');
              },
            },
          );
        } else {
          toast.error(result.message || 'خطا در ثبت اطلاعات');
        }
      },
      onError: () => {
        toast.error('خطا در ثبت اطلاعات');
      },
    });
  };

  return (
    <form onSubmit={onFormSubmit} className='space-y-6'>
      {guarantees.includes('چک') && (
        <Card>
          <CardHeader
            className='cursor-pointer hover:bg-gray-50'
            onClick={() => toggleAccordion('cheque')}
          >
            <div className='flex items-center justify-between'>
              <CardTitle>ثبت چک صیادی</CardTitle>
              {accordionStates.cheque ? (
                <ChevronUp className='w-5 h-5' />
              ) : (
                <ChevronDown className='w-5 h-5' />
              )}
            </div>
          </CardHeader>
          {accordionStates.cheque && (
            <CardContent className='space-y-6'>
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <p className='font-bold text-center mb-4'>چک باید در وجه زیر باشد:</p>
                <div className='flex flex-col md:flex-row md:gap-8 justify-center'>
                  <span>
                    شناسه ملی شرکت: <strong className='text-blue-600'>14014520172</strong>
                  </span>
                  <span>
                    نام شرکت: <strong className='text-blue-600'>فناوری اطلاعات راژمان</strong>
                  </span>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='flex items-center gap-2'>
                  <Label htmlFor='sayadId'>
                    شناسه یکتای صیادی <span className='text-red-500'>*</span>
                  </Label>
                  <div className='relative group'>
                    <HelpCircle
                      className='w-4 h-4 text-blue-500 cursor-pointer'
                      onMouseEnter={() => setShowHelpText(true)}
                      onMouseLeave={() => setShowHelpText(false)}
                    />
                    {showHelpText && (
                      <div className='absolute top-full left-0 mt-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10'>
                        شناسه یکتا 16 رقم دارد
                      </div>
                    )}
                  </div>
                </div>
                <Input
                  type='text'
                  id='sayadId'
                  name='sayadId'
                  value={formData.sayadId}
                  onChange={handleInputChange}
                  inputMode='numeric'
                  pattern='[0-9]*'
                  maxLength={16}
                  required
                  className={cn(
                    formData.sayadId.length === 16
                      ? 'border-green-500 focus-visible:ring-green-500'
                      : 'border-red-500 focus-visible:ring-red-500',
                    shake && 'animate-shake',
                  )}
                />
                <span
                  className={cn(
                    'text-sm',
                    formData.sayadId.length === 16 ? 'text-green-600' : 'text-red-600',
                  )}
                >
                  {formData.sayadId.length > 0 && `${formData.sayadId.length} رقم وارد شده`}
                </span>

                {guaranteedAmount && (
                  <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                    <p className='text-center'>
                      مبلغ ثبت چک باید{' '}
                      <strong className='text-red-600'>
                        {guaranteedAmount.toLocaleString('fa-IR')}
                      </strong>{' '}
                      ریال باشد
                    </p>
                  </div>
                )}
              </div>

              {/* Canvas Preview Section */}
              <div className='space-y-4'>
                <Label>پیش‌نمایش چک صیادی</Label>
                <div className='border border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center'>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={300}
                    className='border border-gray-400 rounded bg-white max-w-full mx-auto'
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  <img
                    ref={imgRef}
                    src='/images/FrontOfCheck.png'
                    alt='Front of Check'
                    className='hidden'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FileUploadArea
                  fileKey='chequeImage'
                  uploadedFile={uploadedFiles['chequeImage']}
                  uploadProgress={uploadProgress['chequeImage']}
                  onRefChange={(key, ref) => {
                    fileInputRefs.current[key] = ref;
                  }}
                  onFileSelect={handleFileSelect}
                  onDrop={handleDrop}
                  onRemoveFile={handleRemoveFile}
                />
                <FileUploadArea
                  fileKey='chequeBackImage'
                  uploadedFile={uploadedFiles['chequeBackImage']}
                  uploadProgress={uploadProgress['chequeBackImage']}
                  onRefChange={(key, ref) => {
                    fileInputRefs.current[key] = ref;
                  }}
                  onFileSelect={handleFileSelect}
                  onDrop={handleDrop}
                  onRemoveFile={handleRemoveFile}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {guarantees.includes('کسر از حقوق') && (
        <Card>
          <CardHeader
            className='cursor-pointer hover:bg-gray-50'
            onClick={() => toggleAccordion('salaryDeduction')}
          >
            <div className='flex items-center justify-between'>
              <CardTitle>کسر از حقوق</CardTitle>
              {accordionStates.salaryDeduction ? (
                <ChevronUp className='w-5 h-5' />
              ) : (
                <ChevronDown className='w-5 h-5' />
              )}
            </div>
          </CardHeader>
          {accordionStates.salaryDeduction && (
            <CardContent>
              <FileUploadArea
                fileKey='salaryDeductionImage'
                uploadedFile={uploadedFiles['salaryDeductionImage']}
                uploadProgress={uploadProgress['salaryDeductionImage']}
                onRefChange={(key, ref) => {
                  fileInputRefs.current[key] = ref;
                }}
                onFileSelect={handleFileSelect}
                onDrop={handleDrop}
                onRemoveFile={handleRemoveFile}
              />
            </CardContent>
          )}
        </Card>
      )}

      {guarantees.includes('سفته') && (
        <Card>
          <CardHeader
            className='cursor-pointer hover:bg-gray-50'
            onClick={() => toggleAccordion('promissoryNote')}
          >
            <div className='flex items-center justify-between'>
              <CardTitle>سفته</CardTitle>
              {accordionStates.promissoryNote ? (
                <ChevronUp className='w-5 h-5' />
              ) : (
                <ChevronDown className='w-5 h-5' />
              )}
            </div>
          </CardHeader>
          {accordionStates.promissoryNote && (
            <CardContent className='space-y-4'>
              {guaranteedAmount && (
                <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                  <p className='text-center'>
                    مبلغ تضمین:{' '}
                    <strong className='text-blue-600'>
                      {guaranteedAmount.toLocaleString('fa-IR')}
                    </strong>{' '}
                    ریال
                  </p>
                </div>
              )}
              <FileUploadArea
                fileKey='promissoryImage'
                uploadedFile={uploadedFiles['promissoryImage']}
                uploadProgress={uploadProgress['promissoryImage']}
                onRefChange={(key, ref) => {
                  fileInputRefs.current[key] = ref;
                }}
                onFileSelect={handleFileSelect}
                onDrop={handleDrop}
                onRemoveFile={handleRemoveFile}
              />
            </CardContent>
          )}
        </Card>
      )}

      <div className='flex justify-center gap-4'>
        <Button
          type='submit'
          disabled={
            isReadOnly || registerChequeMutation.isPending || changeRequestStateMutation.isPending
          }
          size='lg'
        >
          {registerChequeMutation.isPending || changeRequestStateMutation.isPending
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
    </form>
  );
}
