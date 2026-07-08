'use client';

import { useState, useCallback, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadAttachment, deleteAttachment } from '@/api/facility';
import { toast } from 'sonner';
import { Upload, X, FileCheck, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateIncomeInfo } from '@/mutations/request';

interface IncomeInformationProps {
  requestId: string;
  onNext?: (data: IncomeFormData) => void;
  onCancel?: () => void;
  initialData?: IncomeFormData;
  isEditMode?: boolean;
}

interface IncomeFormData {
  income: string;
  payAbility: string;
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
  accountTurnover: 101,
  salarySlip: 101,
} as const;

type FileKey = keyof typeof ATTACHMENT_TYPES;

const FILE_LABELS: Record<FileKey, string> = {
  accountTurnover: 'گردش حساب',
  salarySlip: 'فیش حقوقی',
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
      <Label className='block'>{FILE_LABELS[fileKey]}</Label>
      <p className='text-xs text-blue-600 mb-2'>
        پسوندهای مجاز: excel, txt, jpg, jpeg, png (حداکثر 3 مگابایت)
      </p>
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
          accept='application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,.xlsx,text/plain,.txt,image/jpeg,.jpg,.jpeg,image/png,.png'
          onChange={e => onFileSelect(e, fileKey)}
          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
        />

        {uploadedFile ? (
          <div className='space-y-2'>
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
          </div>
        )}
      </div>
    </div>
  );
};

export function IncomeInformation({
  requestId,
  onNext,
  onCancel,
  initialData,
  isEditMode = false,
}: IncomeInformationProps) {
  const createIncomeInfoMutation = useCreateIncomeInfo();

  const [formData, setFormData] = useState<IncomeFormData>({
    income: initialData?.income || '',
    payAbility: initialData?.payAbility || '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<Partial<Record<FileKey, UploadedFile>>>({});
  const [uploadProgress, setUploadProgress] = useState<Partial<Record<FileKey, UploadProgress>>>(
    {},
  );
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);

  const fileInputRefs = useRef<Partial<Record<FileKey, HTMLInputElement | null>>>({});

  const formatNumber = (value: string): string => {
    if (!value) return '';
    const num = value.replace(/,/g, '').replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/,/g, '');

    setFormData(prev => ({
      ...prev,
      [name]: numericValue,
    }));
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

      setAttachmentIds(prev =>
        result.id && !prev.includes(result.id) ? [...prev, result.id] : prev,
      );

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

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>, key: FileKey) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (!file) return;

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
          setAttachmentIds(prev => prev.filter(id => id !== fileData.id));
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

  const isFormValid =
    formData.income &&
    formData.payAbility &&
    uploadedFiles.accountTurnover &&
    uploadProgress.accountTurnover?.status === 'success' &&
    uploadedFiles.salarySlip &&
    uploadProgress.salarySlip?.status === 'success';

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const numericIncome = Number(formData.income);
    const numericInstallment = Number(formData.payAbility);

    if (!formData.income) {
      toast.error('لطفا مقدار درآمد را وارد کنید');
      return;
    }

    if (!formData.payAbility) {
      toast.error('لطفا میزان اقساط ماهیانه را وارد کنید');
      return;
    }

    if (numericInstallment >= numericIncome) {
      toast.error('مقدار قسط نباید بیشتر یا مساوی درآمد شما باشد');
      return;
    }

    const requiredFiles: FileKey[] = ['accountTurnover', 'salarySlip'];
    for (const key of requiredFiles) {
      if (!uploadedFiles[key] || uploadProgress[key]?.status !== 'success') {
        toast.error(`لطفا ${FILE_LABELS[key]} را آپلود کنید`);
        return;
      }
    }

    createIncomeInfoMutation.mutate(
      {
        income: numericIncome * 10,
        payAbility: numericInstallment * 10,
        requestId,
        attachmentIds,
      },
      {
        onSuccess: response => {
          if (response.isSuccess) {
            toast.success('اطلاعات با موفقیت ثبت شد');
            if (onNext) {
              onNext(formData);
            }
          } else {
            toast.error(response.message || 'خطا در ارسال اطلاعات');
          }
        },
        onError: () => {
          toast.error('خطا در ثبت اطلاعات');
        },
      },
    );
  };

  return (
    <form onSubmit={onFormSubmit} className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات درآمدی</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='w-full'>
              <Label htmlFor='income' className='mb-2'>
                مقدار درآمد (تومان) <span className='text-red-500'>*</span>
              </Label>
              <Input
                type='text'
                id='income'
                name='income'
                value={formatNumber(formData.income)}
                onChange={handleInputChange}
                required
                placeholder='مثال: 200,000,000'
              />
            </div>

            <div className='w-full'>
              <Label htmlFor='payAbility' className='mb-2'>
                میزان اقساط ماهیانه شما (تومان) <span className='text-red-500'>*</span>
              </Label>
              <Input
                type='text'
                id='payAbility'
                name='payAbility'
                value={formatNumber(formData.payAbility)}
                onChange={handleInputChange}
                required
                placeholder='مثال: 50,000,000'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FileUploadArea
              fileKey='accountTurnover'
              uploadedFile={uploadedFiles['accountTurnover']}
              uploadProgress={uploadProgress['accountTurnover']}
              onRefChange={(key, ref) => {
                fileInputRefs.current[key] = ref;
              }}
              onFileSelect={handleFileSelect}
              onDrop={handleDrop}
              onRemoveFile={handleRemoveFile}
            />
            <FileUploadArea
              fileKey='salarySlip'
              uploadedFile={uploadedFiles['salarySlip']}
              uploadProgress={uploadProgress['salarySlip']}
              onRefChange={(key, ref) => {
                fileInputRefs.current[key] = ref;
              }}
              onFileSelect={handleFileSelect}
              onDrop={handleDrop}
              onRemoveFile={handleRemoveFile}
            />
          </div>

          {!isFormValid && (
            <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <div className='flex items-start gap-2'>
                <AlertCircle className='w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-sm font-medium text-yellow-800 mb-2'>
                    برای ادامه، موارد زیر را تکمیل کنید:
                  </h3>
                  <ul className='text-sm text-yellow-700 space-y-1'>
                    {!formData.income && (
                      <li className='flex items-center'>
                        <span className='w-2 h-2 bg-yellow-400 rounded-full ml-2'></span>
                        مقدار درآمد را وارد کنید
                      </li>
                    )}
                    {!formData.payAbility && (
                      <li className='flex items-center'>
                        <span className='w-2 h-2 bg-yellow-400 rounded-full ml-2'></span>
                        میزان اقساط ماهیانه را وارد کنید
                      </li>
                    )}
                    {(!uploadedFiles.accountTurnover ||
                      uploadProgress.accountTurnover?.status !== 'success') && (
                      <li className='flex items-center'>
                        <span className='w-2 h-2 bg-yellow-400 rounded-full ml-2'></span>
                        فایل گردش حساب را آپلود کنید
                      </li>
                    )}
                    {(!uploadedFiles.salarySlip ||
                      uploadProgress.salarySlip?.status !== 'success') && (
                      <li className='flex items-center'>
                        <span className='w-2 h-2 bg-yellow-400 rounded-full ml-2'></span>
                        فایل فیش حقوقی را آپلود کنید
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className='flex justify-center gap-4'>
            <Button
              type='submit'
              disabled={createIncomeInfoMutation.isPending || !isFormValid}
              size='lg'
            >
              {createIncomeInfoMutation.isPending
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
  );
}
