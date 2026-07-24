'use client';

import { useState, useCallback, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUploadArea } from '@/components/file-upload-area';
import { uploadAttachment, deleteAttachment } from '@/api/facility';
import { getUser } from '@/api/users';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';
import type { UserInfo } from '@/types/request-credit';
import {
  useUploadUserAttachments,
  useValidateUserIdentityInfo,
  useChangeRequestState,
} from '@/mutations/request';

interface UserInformationProps {
  user?: UserInfo;
  requestId: string;
  onNext?: (data: UserInformationFormData) => void;
  onCancel?: () => void;
  isEditMode?: boolean;
  isReadOnly?: boolean;
}

interface UserInformationFormData {
  firstName: string;
  lastName: string;
  birthDate: string;
  nationalCode: string;
  phoneNumber: string;
  branchCityName: string;
  branchName: string;
  address: string;
  postalCode: string;
  telephone: string;
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

interface ExistingAttachment {
  id: string;
  attachmentType: number;
  file: string; // base64 string
}

interface UserWithAttachments {
  attachments?: ExistingAttachment[];
  [key: string]: unknown;
}

const ATTACHMENT_TYPES = {
  nationalCardFront: 100,
  nationalCardBack: 101,
  birthCertificate: 102,
} as const;

type FileKey = keyof typeof ATTACHMENT_TYPES;

export function UserInformation({
  user,
  requestId,
  onNext,
  onCancel,
  isEditMode = false,
  isReadOnly = false,
}: UserInformationProps) {
  const uploadUserAttachmentsMutation = useUploadUserAttachments();
  const validateUserIdentityMutation = useValidateUserIdentityInfo();
  const changeRequestStateMutation = useChangeRequestState();

  const [formData, setFormData] = useState<UserInformationFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    birthDate: user?.personInfo?.birthDate || '',
    nationalCode: user?.nationalCode || '',
    phoneNumber: user?.personInfo?.phoneNumber || '',
    branchCityName: user?.personInfo?.cityProvinceName || '',
    branchName: user?.personInfo?.cityName || '',
    address: user?.personInfo?.address || '',
    postalCode: user?.personInfo?.postalCode || '',
    telephone: user?.personInfo?.telephone || '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<Partial<Record<FileKey, UploadedFile>>>({});
  const [uploadProgress, setUploadProgress] = useState<Partial<Record<FileKey, UploadProgress>>>(
    {},
  );
  const [existingAttachments, setExistingAttachments] = useState<ExistingAttachment[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(true);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const fileInputRefs = useRef<Partial<Record<FileKey, HTMLInputElement | null>>>({});

  // Callback to handle ref changes
  const handleRefChange = useCallback((key: FileKey, ref: HTMLInputElement | null) => {
    fileInputRefs.current[key] = ref;
  }, []);

  // Fetch existing attachments
  useEffect(() => {
    const fetchUserImages = async () => {
      if (!user?.id) {
        setIsLoadingAttachments(false);
        return;
      }

      setIsLoadingAttachments(true);
      try {
        const userData = await getUser(user.id);
        const userWithAttachments = userData as UserWithAttachments;
        if (userWithAttachments && userWithAttachments.attachments) {
          setExistingAttachments(userWithAttachments.attachments);
        } else {
          setExistingAttachments([]);
        }
      } catch (error) {
        console.error('Error fetching user images:', error);
        setExistingAttachments([]);
      } finally {
        setIsLoadingAttachments(false);
      }
    };

    fetchUserImages();
  }, [user?.id]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getExistingPhotoBase64 = useCallback(
    (type: number) => {
      const attachment = existingAttachments?.find(item => item.attachmentType === type);
      return attachment?.file;
    },
    [existingAttachments],
  );

  const removeExistingSinglePhoto = useCallback(async (id: string) => {
    try {
      await deleteAttachment(id);
      setExistingAttachments(prev => prev.filter(attachment => attachment.id !== id));
      toast.success('تصویر با موفقیت حذف شد');
    } catch {
      toast.error('خطا در حذف تصویر');
    }
  }, []);

  const openImageModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
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

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!requestId) {
      toast.error('شناسه درخواست یافت نشد. لطفا ابتدا درخواست را ثبت کنید.');
      return;
    }

    const userId = user?.id;
    if (!userId) {
      toast.error('شناسه کاربری یافت نشد.');
      return;
    }

    // Check if user has existing attachments and not uploading new ones
    const hasExistingAttachments = existingAttachments.length > 0 && !showUploadSection;
    const isUploadingNewFiles = showUploadSection || existingAttachments.length === 0;

    if (isUploadingNewFiles) {
      // Validate new file uploads
      const requiredFiles: FileKey[] = ['nationalCardFront', 'birthCertificate'];

      for (const key of requiredFiles) {
        if (!uploadedFiles[key] || uploadProgress[key]?.status !== 'success') {
          const fileNames: Record<FileKey, string> = {
            nationalCardFront: 'روی کارت ملی',
            nationalCardBack: 'پشت کارت ملی',
            birthCertificate: 'شناسنامه',
          };
          toast.error(`لطفا ${fileNames[key]} را آپلود کنید`);
          return;
        }
      }

      const attachmentIdsToSend: string[] = [];
      for (const key of requiredFiles) {
        const fileId = uploadedFiles[key]?.id;
        if (fileId) {
          attachmentIdsToSend.push(fileId);
        }
      }
      if (uploadedFiles.nationalCardBack?.id) {
        attachmentIdsToSend.push(uploadedFiles.nationalCardBack.id);
      }

      uploadUserAttachmentsMutation.mutate(
        { userId, attachmentIdsToSend },
        {
          onSuccess: uploadResponse => {
            if (!uploadResponse?.isSuccess) {
              toast.error(uploadResponse?.message || 'خطا در آپلود مدارک');
              return;
            }
            validateUserIdentityMutation.mutate(requestId, {
              onSuccess: validationResponse => {
                if (!validationResponse?.isSuccess) {
                  toast.error(validationResponse?.message || 'خطا در تایید اطلاعات هویتی');
                  return;
                }

                changeRequestStateMutation.mutate(
                  { id: requestId, requestState: 2 },
                  {
                    onSuccess: () => {
                      toast.success('اطلاعات هویتی با موفقیت تایید و مرحله بعد فعال شد');
                      if (onNext) {
                        onNext(formData);
                      }
                    },
                    onError: error => {
                      const message =
                        error instanceof Error ? error.message : 'خطا در تغییر وضعیت درخواست';
                      toast.error(message);
                    },
                  },
                );
              },
              onError: error => {
                const message =
                  error instanceof Error ? error.message : 'خطا در تایید اطلاعات هویتی';
                toast.error(message);
              },
            });
          },
          onError: error => {
            const message = error instanceof Error ? error.message : 'خطا در آپلود مدارک';
            toast.error(message);
          },
        },
      );
    } else if (hasExistingAttachments) {
      // User has existing attachments, just validate and proceed
      validateUserIdentityMutation.mutate(requestId, {
        onSuccess: validationResponse => {
          if (!validationResponse?.isSuccess) {
            toast.error(validationResponse?.message || 'خطا در تایید اطلاعات هویتی');
            return;
          }

          changeRequestStateMutation.mutate(
            { id: requestId, requestState: 2 },
            {
              onSuccess: () => {
                toast.success('اطلاعات هویتی با موفقیت تایید و مرحله بعد فعال شد');
                if (onNext) {
                  onNext(formData);
                }
              },
              onError: error => {
                const message =
                  error instanceof Error ? error.message : 'خطا در تغییر وضعیت درخواست';
                toast.error(message);
              },
            },
          );
        },
        onError: error => {
          const message = error instanceof Error ? error.message : 'خطا در تایید اطلاعات هویتی';
          toast.error(message);
        },
      });
    }
  };

  const formFields = [
    { label: 'نام', name: 'firstName', type: 'text', required: true },
    { label: 'نام خانوادگی', name: 'lastName', type: 'text', required: true },
    { label: 'کد ملی', name: 'nationalCode', type: 'text', required: true, maxLength: 10 },
    {
      label: 'تاریخ تولد',
      name: 'birthDate',
      type: 'text',
      required: true,
      placeholder: '1370/01/01',
    },
    { label: 'شماره موبایل', name: 'phoneNumber', type: 'tel', required: true, maxLength: 11 },
    { label: 'تلفن ثابت', name: 'telephone', type: 'tel', required: false },
    { label: 'استان', name: 'branchCityName', type: 'text', required: true },
    { label: 'شهر', name: 'branchName', type: 'text', required: true },
    { label: 'کد پستی', name: 'postalCode', type: 'text', required: true, maxLength: 10 },
  ];

  return (
    <form onSubmit={onFormSubmit} className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات هویتی</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {formFields.map(field => (
              <div key={field.name} className='w-full'>
                <Label htmlFor={field.name} className='mb-2'>
                  {field.label} {field.required && <span className='text-red-500'>*</span>}
                </Label>
                <Input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name as keyof UserInformationFormData] || ''}
                  onChange={handleInputChange}
                  required={field.required}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  readOnly
                  disabled
                />
              </div>
            ))}

            <div className='md:col-span-2'>
              <Label htmlFor='address' className='mb-2'>
                آدرس <span className='text-red-500'>*</span>
              </Label>
              <Textarea
                id='address'
                name='address'
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                disabled
                readOnly
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>بارگذاری مدارک</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {isLoadingAttachments ? (
            <div className='flex justify-center items-center h-40'>
              <Loader2 className='w-8 h-8 animate-spin text-gray-400' />
              <span className='mr-2 text-gray-600'>در حال بارگذاری اطلاعات...</span>
            </div>
          ) : existingAttachments.length > 0 && !showUploadSection ? (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {[
                  { type: 102, label: 'شناسنامه', key: 'birthCertificate' as FileKey },
                  { type: 100, label: 'روی کارت ملی', key: 'nationalCardFront' as FileKey },
                  { type: 101, label: 'پشت کارت ملی', key: 'nationalCardBack' as FileKey },
                ].map(({ type, label, key }) => {
                  const photoBase64 = getExistingPhotoBase64(type);
                  const attachment = existingAttachments.find(item => item.attachmentType === type);

                  return (
                    <div key={type} className='space-y-2'>
                      <Label>{label}</Label>
                      {photoBase64 ? (
                        <div className='relative'>
                          <div className='relative w-full h-40 border-2 border-green-500 rounded-lg overflow-hidden'>
                            <Image
                              src={`data:image/jpeg;base64,${photoBase64}`}
                              alt={label}
                              fill
                              className='object-cover cursor-pointer hover:opacity-80 transition-opacity'
                              onClick={() =>
                                openImageModal(`data:image/jpeg;base64,${photoBase64}`)
                              }
                            />
                          </div>
                          <Button
                            type='button'
                            variant='destructive'
                            size='icon'
                            className='absolute top-2 right-2 h-6 w-6 rounded-full'
                            onClick={() => attachment && removeExistingSinglePhoto(attachment.id)}
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      ) : (
                        <FileUploadArea
                          fileKey={key}
                          label={label}
                          uploadedFile={uploadedFiles[key]}
                          uploadProgress={uploadProgress[key]}
                          onRefChange={handleRefChange}
                          onFileSelect={handleFileSelect}
                          onRemoveFile={handleRemoveFile}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className='flex justify-center'>
                <Button type='button' variant='outline' onClick={() => setShowUploadSection(true)}>
                  بارگذاری مدارک جدید
                </Button>
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label>شناسنامه *</Label>
                <FileUploadArea
                  fileKey='birthCertificate'
                  label='شناسنامه *'
                  uploadedFile={uploadedFiles['birthCertificate']}
                  uploadProgress={uploadProgress['birthCertificate']}
                  onRefChange={handleRefChange}
                  onFileSelect={handleFileSelect}
                  onRemoveFile={handleRemoveFile}
                />
              </div>
              <div className='space-y-2'>
                <Label>روی کارت ملی *</Label>
                <FileUploadArea
                  fileKey='nationalCardFront'
                  label='روی کارت ملی *'
                  uploadedFile={uploadedFiles['nationalCardFront']}
                  uploadProgress={uploadProgress['nationalCardFront']}
                  onRefChange={handleRefChange}
                  onFileSelect={handleFileSelect}
                  onRemoveFile={handleRemoveFile}
                />
              </div>
              <div className='space-y-2'>
                <Label>پشت کارت ملی</Label>
                <FileUploadArea
                  fileKey='nationalCardBack'
                  label='پشت کارت ملی'
                  uploadedFile={uploadedFiles['nationalCardBack']}
                  uploadProgress={uploadProgress['nationalCardBack']}
                  onRefChange={handleRefChange}
                  onFileSelect={handleFileSelect}
                  onRemoveFile={handleRemoveFile}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div
          className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
          onClick={closeImageModal}
        >
          <div className='relative max-w-4xl max-h-full p-4'>
            <div className='relative w-full h-[80vh]'>
              <Image
                src={selectedImage}
                alt='تصویر بزرگ شده'
                fill
                className='object-contain'
                onClick={e => e.stopPropagation()}
              />
            </div>
            <Button
              onClick={closeImageModal}
              variant='ghost'
              size='icon'
              className='absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75'
            >
              <X className='h-6 w-6' />
            </Button>
          </div>
        </div>
      )}

      <div className='flex justify-center gap-4'>
        <Button
          type='submit'
          disabled={
            isReadOnly ||
            uploadUserAttachmentsMutation.isPending ||
            validateUserIdentityMutation.isPending ||
            changeRequestStateMutation.isPending
          }
          size='lg'
        >
          {uploadUserAttachmentsMutation.isPending ||
          validateUserIdentityMutation.isPending ||
          changeRequestStateMutation.isPending
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
    </form>
  );
}
