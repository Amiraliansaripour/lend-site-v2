'use client';

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  type FormEvent,
  type ChangeEvent,
} from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUploadArea } from '@/components/file-upload-area';
import { isAllowedImageFile } from '@/lib/image-file';
import { uploadAttachment, deleteAttachment } from '@/api/facility';
import { getUser } from '@/api/users';
import { toast } from 'sonner';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import type { UserInfo } from '@/types/request-credit';
import { getShopImageUrl } from '@/lib/shop-utils';
import { normalizedFormatJalaliDate } from '@/utils/format';
import {
  useUploadUserAttachments,
  useValidateUserIdentityInfo,
  useChangeRequestState,
} from '@/mutations/request';

function formatBirthDate(date?: string) {
  if (!date) return '';
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + 1);
  return normalizedFormatJalaliDate(shifted, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

const ESSENTIAL_FIELD_LABELS = {
  firstName: 'نام',
  lastName: 'نام خانوادگی',
  nationalCode: 'کد ملی',
  birthDate: 'تاریخ تولد',
  phoneNumber: 'شماره موبایل',
  cityProvinceName: 'استان',
  cityName: 'شهر',
  address: 'آدرس',
  postalCode: 'کد پستی',
} as const;

function getMissingEssentialFields(userData?: UserInfo): string[] {
  const missingFields: string[] = [];

  if (!userData?.firstName?.trim()) missingFields.push(ESSENTIAL_FIELD_LABELS.firstName);
  if (!userData?.lastName?.trim()) missingFields.push(ESSENTIAL_FIELD_LABELS.lastName);
  if (!userData?.nationalCode?.trim()) missingFields.push(ESSENTIAL_FIELD_LABELS.nationalCode);
  if (!userData?.personInfo?.birthDate) missingFields.push(ESSENTIAL_FIELD_LABELS.birthDate);
  if (!userData?.personInfo?.phoneNumber?.trim())
    missingFields.push(ESSENTIAL_FIELD_LABELS.phoneNumber);
  if (!userData?.personInfo?.cityProvinceName?.trim())
    missingFields.push(ESSENTIAL_FIELD_LABELS.cityProvinceName);
  if (!userData?.personInfo?.cityName?.trim()) missingFields.push(ESSENTIAL_FIELD_LABELS.cityName);
  if (!userData?.personInfo?.address?.trim()) missingFields.push(ESSENTIAL_FIELD_LABELS.address);
  if (!userData?.personInfo?.postalCode?.trim())
    missingFields.push(ESSENTIAL_FIELD_LABELS.postalCode);

  return missingFields;
}

interface UserInformationProps {
  user?: UserInfo;
  requestId: string;
  onNext?: (data: UserInformationFormData) => void;
  onBack?: () => void;
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
  filePath: string;
  name?: string;
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
  onBack,
  onCancel,
  isEditMode = false,
  isReadOnly = false,
}: UserInformationProps) {
  const router = useRouter();
  const uploadUserAttachmentsMutation = useUploadUserAttachments();
  const validateUserIdentityMutation = useValidateUserIdentityInfo();
  const changeRequestStateMutation = useChangeRequestState();

  const [formData, setFormData] = useState<UserInformationFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    birthDate: formatBirthDate(user?.personInfo?.birthDate),
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
  const uploadedAttachmentIdsRef = useRef<Partial<Record<FileKey, string>>>({});
  const hasRedirectedToProfile = useRef(false);

  const missingEssentialFields = useMemo(() => getMissingEssentialFields(user), [user]);
  const hasEssentialInfo = missingEssentialFields.length === 0;

  const profileCallbackUrl = requestId
    ? `/requests/request-credit?id=${requestId}`
    : '/requests/request-credit';
  const profileUrl = `/profile?callBackUrl=${encodeURIComponent(profileCallbackUrl)}`;

  // Callback to handle ref changes
  const handleRefChange = useCallback((key: FileKey, ref: HTMLInputElement | null) => {
    fileInputRefs.current[key] = ref;
  }, []);

  // Redirect to profile when essential identity fields are missing
  useEffect(() => {
    if (hasEssentialInfo) {
      hasRedirectedToProfile.current = false;
      return;
    }
    if (isReadOnly || hasRedirectedToProfile.current) return;

    hasRedirectedToProfile.current = true;
    toast.error('لطفا تمام اطلاعات هویتی را در صفحه پروفایل تکمیل کنید');
    router.push(profileUrl);
  }, [hasEssentialInfo, isReadOnly, profileUrl, router]);

  // Keep form values in sync when user data is refreshed (e.g. after profile update)
  useEffect(() => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      birthDate: formatBirthDate(user?.personInfo?.birthDate),
      nationalCode: user?.nationalCode || '',
      phoneNumber: user?.personInfo?.phoneNumber || '',
      branchCityName: user?.personInfo?.cityProvinceName || '',
      branchName: user?.personInfo?.cityName || '',
      address: user?.personInfo?.address || '',
      postalCode: user?.personInfo?.postalCode || '',
      telephone: user?.personInfo?.telephone || '',
    });
  }, [user]);

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

  const getExistingPhotoUrl = useCallback(
    (type: number) => {
      const attachment = existingAttachments?.find(item => item.attachmentType === type);
      return getShopImageUrl(attachment?.filePath);
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

  const collectAttachmentIdsToSend = useCallback(
    (newlyUploadedType?: number) => {
      const ids = new Set<string>();

      for (const attachment of existingAttachments) {
        if (newlyUploadedType !== undefined && attachment.attachmentType === newlyUploadedType) {
          continue;
        }
        if (attachment.id) ids.add(attachment.id);
      }

      for (const id of Object.values(uploadedAttachmentIdsRef.current)) {
        if (id) ids.add(id);
      }

      return Array.from(ids);
    },
    [existingAttachments],
  );

  const uploadToServer = useCallback(
    async (file: File, key: FileKey) => {
      const userId = user?.id;
      if (!userId) {
        toast.error('شناسه کاربری یافت نشد.');
        return;
      }

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

        uploadedAttachmentIdsRef.current[key] = result.id;

        setUploadedFiles(prev => ({
          ...prev,
          [key]: { ...prev[key]!, id: result.id },
        }));

        const attachmentIdsToSend = collectAttachmentIdsToSend(ATTACHMENT_TYPES[key]);

        const uploadResponse = await uploadUserAttachmentsMutation.mutateAsync({
          userId,
          attachmentIdsToSend,
          isActive: true,
        });

        if (!uploadResponse?.isSuccess) {
          delete uploadedAttachmentIdsRef.current[key];
          setUploadProgress(prev => ({
            ...prev,
            [key]: { status: 'error', message: 'خطا در ثبت مدرک' },
          }));
          toast.error(uploadResponse?.message || 'خطا در ثبت مدارک');
          return;
        }

        setUploadProgress(prev => ({
          ...prev,
          [key]: { status: 'success', message: 'آپلود موفق' },
        }));

        toast.success('فایل با موفقیت آپلود شد');
      } catch {
        delete uploadedAttachmentIdsRef.current[key];
        setUploadProgress(prev => ({
          ...prev,
          [key]: { status: 'error', message: 'خطا در آپلود' },
        }));
        toast.error('خطا در آپلود فایل');
      }
    },
    [user?.id, collectAttachmentIdsToSend, uploadUserAttachmentsMutation],
  );

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

      delete uploadedAttachmentIdsRef.current[key];

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

    if (!hasEssentialInfo) {
      toast.error('لطفا تمام اطلاعات هویتی را در صفحه پروفایل تکمیل کنید');
      router.push(profileUrl);
      return;
    }

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
      // Validate new file uploads (IDs are already sent via User/Upload after each photo)
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

  const isFieldEmpty = (name: keyof UserInformationFormData) =>
    !String(formData[name] || '').trim();

  return (
    <form onSubmit={onFormSubmit} className='space-y-6'>
      {!hasEssentialInfo && !isReadOnly && (
        <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
          <div className='flex items-start gap-2'>
            <AlertCircle className='w-5 h-5 text-yellow-600 shrink-0 mt-0.5' />
            <div className='flex-1 space-y-3'>
              <div>
                <h3 className='text-sm font-medium text-yellow-800 mb-2'>
                  برای ادامه، اطلاعات هویتی زیر را در صفحه پروفایل تکمیل کنید:
                </h3>
                <ul className='text-sm text-yellow-700 space-y-1'>
                  {missingEssentialFields.map(field => (
                    <li key={field} className='flex items-center'>
                      <span className='w-2 h-2 bg-yellow-400 rounded-full ml-2'></span>
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
              <Button asChild type='button' size='sm'>
                <Link href={profileUrl}>تکمیل اطلاعات در پروفایل</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات هویتی</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {formFields.map(field => {
              const fieldName = field.name as keyof UserInformationFormData;
              const isEmpty = field.required && isFieldEmpty(fieldName);

              return (
                <div key={field.name} className='w-full'>
                  <Label htmlFor={field.name} className='mb-2'>
                    {field.label} {field.required && <span className='text-red-500'>*</span>}
                  </Label>
                  <Input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[fieldName] || ''}
                    onChange={handleInputChange}
                    required={field.required}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                    readOnly
                    disabled
                    className={isEmpty && !isReadOnly ? 'border-red-400 bg-red-50' : undefined}
                  />
                </div>
              );
            })}

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
                className={
                  isFieldEmpty('address') && !isReadOnly ? 'border-red-400 bg-red-50' : undefined
                }
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
                  const photoUrl = getExistingPhotoUrl(type);
                  const attachment = existingAttachments.find(item => item.attachmentType === type);

                  return (
                    <div key={type} className='space-y-2'>
                      <Label>{label}</Label>
                      {photoUrl ? (
                        <div className='relative'>
                          <div className='relative w-full h-40 border-2 border-green-500 rounded-lg overflow-hidden'>
                            <Image
                              src={photoUrl}
                              alt={label}
                              fill
                              unoptimized
                              className='object-cover cursor-pointer hover:opacity-80 transition-opacity'
                              onClick={() => openImageModal(photoUrl)}
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
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    uploadedAttachmentIdsRef.current = {};
                    setUploadedFiles({});
                    setUploadProgress({});
                    setShowUploadSection(true);
                  }}
                >
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
            !hasEssentialInfo ||
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
