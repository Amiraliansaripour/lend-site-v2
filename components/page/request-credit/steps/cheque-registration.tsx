'use client';

import { useState, useCallback, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  uploadAttachment,
  deleteAttachment,
  sayadInquiry,
  type SayadInquiryData,
} from '@/api/facility';
import { toast } from 'sonner';
import {
  Upload,
  X,
  FileCheck,
  Loader2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegisterCheque, useChangeRequestState } from '@/mutations/request';
import { ALLOWED_IMAGE_ACCEPT, isAllowedImageFile, previewImageToSrc } from '@/lib/image-file';
import { getShopImageUrl } from '@/lib/shop-utils';
import type { RequestPreviewData } from '@/api/request';

interface ChequeRegistrationProps {
  requestId: string;
  guarantees?: string[];
  guaranteedAmount?: number;
  /** Number of Sayad cheques required by plan (ChequeCount) */
  chequeCount?: number;
  onNext?: (data?: ChequeFormData) => void;
  onBack?: () => void;
  onCancel?: () => void;
  isEditMode?: boolean;
  isReadOnly?: boolean;
  previewData?: RequestPreviewData | null;
}

interface ChequeFormData {
  sayadId: string;
  sayadIds?: string[];
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

type InquiryStatus = 'idle' | 'loading' | 'success' | 'error';

type ChequeSlot = {
  sayadId: string;
  front?: UploadedFile;
  back?: UploadedFile;
  frontProgress?: UploadProgress;
  backProgress?: UploadProgress;
  inquiryStatus: InquiryStatus;
  inquiryMessage?: string;
  inquiryData?: SayadInquiryData;
};

const STATIC_ATTACHMENT_TYPES = {
  promissoryImage: 111,
  salaryDeductionImage: 110,
} as const;

const CHEQUE_ATTACHMENT_TYPE = 107;

type StaticFileKey = keyof typeof STATIC_ATTACHMENT_TYPES;
type ChequeSide = 'front' | 'back';

const STATIC_FILE_LABELS: Record<StaticFileKey, string> = {
  promissoryImage: 'تصویر سفته',
  salaryDeductionImage: 'تصویر مدرک کسر از حقوق',
};

function attachmentIdFromFilePath(filePath?: string | null): string | undefined {
  if (!filePath) return undefined;
  const filename = filePath.split(/[\\/]/).pop() || filePath;
  const id = filename.replace(/\.[^.]+$/, '');
  return id || undefined;
}

function createEmptyCheque(): ChequeSlot {
  return { sayadId: '', inquiryStatus: 'idle' };
}

function buildChequeSlots(count: number, previous: ChequeSlot[] = []): ChequeSlot[] {
  const safeCount = Math.max(0, count);
  return Array.from({ length: safeCount }, (_, index) => previous[index] ?? createEmptyCheque());
}

interface GenericFileUploadProps {
  label: string;
  uploadedFile?: UploadedFile;
  uploadProgress?: UploadProgress;
  inputRef: (el: HTMLInputElement | null) => void;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onRemoveFile: () => void;
  disabled?: boolean;
}

const GenericFileUpload = ({
  label,
  uploadedFile,
  uploadProgress,
  inputRef,
  onFileSelect,
  onDrop,
  onRemoveFile,
  disabled = false,
}: GenericFileUploadProps) => {
  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      <p className='text-xs text-blue-600 mb-2'>پسوندهای مجاز: jpg, jpeg, png (حداکثر 3 مگابایت)</p>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 text-center transition-colors',
          uploadedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-60 pointer-events-none',
        )}
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type='file'
          accept={ALLOWED_IMAGE_ACCEPT}
          onChange={onFileSelect}
          disabled={disabled}
          className={cn(
            'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
            uploadedFile && 'pointer-events-none',
          )}
        />

        {uploadedFile ? (
          <div className='relative z-10 space-y-2'>
            <div className='relative w-full h-32'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedFile.preview}
                alt={label}
                className='h-32 w-full rounded object-contain'
              />
            </div>
            <p className='text-xs text-gray-600 truncate'>
              {uploadedFile.file?.name || (uploadedFile.isExisting ? 'فایل موجود' : '')}
            </p>
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
                void onRemoveFile();
              }}
              className='mt-2'
              disabled={disabled}
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
  chequeCount: chequeCountProp = 0,
  onNext,
  onBack,
  onCancel,
  isEditMode = false,
  isReadOnly = false,
  previewData,
}: ChequeRegistrationProps) {
  const registerChequeMutation = useRegisterCheque();
  const changeRequestStateMutation = useChangeRequestState();

  const requiresCheque = guarantees.includes('چک');
  const resolvedChequeCount = requiresCheque ? Math.max(1, chequeCountProp || 1) : 0;

  const [cheques, setCheques] = useState<ChequeSlot[]>(() => buildChequeSlots(resolvedChequeCount));
  const [staticFiles, setStaticFiles] = useState<Partial<Record<StaticFileKey, UploadedFile>>>({});
  const [staticProgress, setStaticProgress] = useState<
    Partial<Record<StaticFileKey, UploadProgress>>
  >({});
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);
  const [showHelpText, setShowHelpText] = useState(false);
  const [hasHydratedPreview, setHasHydratedPreview] = useState(false);
  const [isInquiring, setIsInquiring] = useState(false);

  const [accordionStates, setAccordionStates] = useState({
    cheque: true,
    salaryDeduction: false,
    promissoryNote: false,
  });

  const chequeFrontRefs = useRef<Array<HTMLInputElement | null>>([]);
  const chequeBackRefs = useRef<Array<HTMLInputElement | null>>([]);
  const staticInputRefs = useRef<Partial<Record<StaticFileKey, HTMLInputElement | null>>>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setCheques(prev => buildChequeSlots(resolvedChequeCount, prev));
  }, [resolvedChequeCount]);

  useEffect(() => {
    if (!previewData || hasHydratedPreview) return;

    const nextStatic: Partial<Record<StaticFileKey, UploadedFile>> = {};
    const nextStaticProgress: Partial<Record<StaticFileKey, UploadProgress>> = {};

    const staticMap: Array<{
      key: StaticFileKey;
      value?: string | null;
      filePath?: string | null;
    }> = [
      {
        key: 'promissoryImage',
        value: previewData.chequeFileImagePromissory,
        filePath: previewData.chequeAttachmentPromissoryFilePath,
      },
      {
        key: 'salaryDeductionImage',
        value: previewData.chequeFileImageDeductionSalary,
        filePath: previewData.chequeAttachmentDeductionSalaryFilePath,
      },
    ];

    for (const item of staticMap) {
      const src = previewImageToSrc(item.value) || getShopImageUrl(item.filePath);
      if (!src) continue;
      nextStatic[item.key] = {
        preview: src,
        isExisting: true,
        id: attachmentIdFromFilePath(item.filePath),
      };
      nextStaticProgress[item.key] = { status: 'success', message: 'فایل موجود' };
    }

    setStaticFiles(nextStatic);
    setStaticProgress(nextStaticProgress);

    if (requiresCheque) {
      setCheques(prev => {
        const next = buildChequeSlots(resolvedChequeCount, prev);
        const frontSrc =
          previewImageToSrc(previewData.chequeFileImage) ||
          getShopImageUrl(previewData.chequeAttachmentFilePath);
        const backSrc =
          previewImageToSrc(previewData.chequeFileImageBack) ||
          getShopImageUrl(previewData.chequeAttachmentBackFilePath);

        if (next[0]) {
          next[0] = {
            ...next[0],
            sayadId: previewData.chequeSayadId || next[0].sayadId,
            front: frontSrc
              ? {
                  preview: frontSrc,
                  isExisting: true,
                  id: attachmentIdFromFilePath(previewData.chequeAttachmentFilePath),
                }
              : next[0].front,
            back: backSrc
              ? {
                  preview: backSrc,
                  isExisting: true,
                  id: attachmentIdFromFilePath(previewData.chequeAttachmentBackFilePath),
                }
              : next[0].back,
            frontProgress: frontSrc
              ? { status: 'success', message: 'فایل موجود' }
              : next[0].frontProgress,
            backProgress: backSrc
              ? { status: 'success', message: 'فایل موجود' }
              : next[0].backProgress,
          };
        }
        return next;
      });
    }

    setHasHydratedPreview(true);
  }, [previewData, hasHydratedPreview, requiresCheque, resolvedChequeCount]);

  const toggleAccordion = (section: keyof typeof accordionStates) => {
    setAccordionStates(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateCheque = useCallback((index: number, patch: Partial<ChequeSlot>) => {
    setCheques(prev => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }, []);

  const handleSayadChange = (index: number, raw: string) => {
    let input = raw.replace(/\D/g, '');

    if (input.length > 16) {
      input = input.slice(0, 16);
      setShakeIndex(index);
      setTimeout(() => setShakeIndex(null), 500);
      toast.error('شناسه یکتای صیادی نمی‌تواند بیشتر از 16 رقم باشد');
    } else if (input.length < 16 && input.length > 0) {
      toast.info(`چک ${index + 1}: باقی‌مانده ${16 - input.length} رقم`);
    }

    updateCheque(index, {
      sayadId: input,
      inquiryStatus: 'idle',
      inquiryMessage: undefined,
      inquiryData: undefined,
    });
  };

  const uploadChequeSide = useCallback(async (index: number, side: ChequeSide, file: File) => {
    const progressKey = side === 'front' ? 'frontProgress' : 'backProgress';
    const fileKey = side === 'front' ? 'front' : 'back';

    setCheques(prev =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [progressKey]: { status: 'uploading', message: 'در حال آپلود...', progress: 0 },
              inquiryStatus: 'idle',
              inquiryMessage: undefined,
              inquiryData: undefined,
            }
          : item,
      ),
    );
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('Name', file.name);
      formDataUpload.append('attachmentType', String(CHEQUE_ATTACHMENT_TYPE));
      formDataUpload.append('file', file);

      const result = await uploadAttachment(formDataUpload);

      setCheques(prev =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                [fileKey]: { ...item[fileKey]!, id: result.id },
                [progressKey]: { status: 'success', message: 'آپلود موفق' },
              }
            : item,
        ),
      );
      toast.success(`چک ${index + 1}: فایل با موفقیت آپلود شد`);
    } catch {
      setCheques(prev =>
        prev.map((item, i) =>
          i === index
            ? { ...item, [progressKey]: { status: 'error', message: 'خطا در آپلود' } }
            : item,
        ),
      );
      toast.error(`چک ${index + 1}: خطا در آپلود فایل`);
    }
  }, []);

  const handleChequeFile = useCallback(
    (index: number, side: ChequeSide, file: File | undefined, clearInput: () => void) => {
      if (!file) return;

      if (!isAllowedImageFile(file)) {
        toast.error('فقط فایل‌های با پسوند jpg، jpeg و png مجاز هستند');
        clearInput();
        return;
      }

      if (file.size > 3 * 1024 * 1024) {
        toast.error('حجم فایل باید کمتر از 3 مگابایت باشد');
        clearInput();
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setCheques(prev =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  [side]: { file, preview },
                  inquiryStatus: 'idle',
                  inquiryMessage: undefined,
                  inquiryData: undefined,
                }
              : item,
          ),
        );
        void uploadChequeSide(index, side, file);
      };
      reader.readAsDataURL(file);
    },
    [uploadChequeSide],
  );

  const handleRemoveChequeFile = useCallback(
    async (index: number, side: ChequeSide) => {
      const slot = cheques[index];
      const fileData = side === 'front' ? slot?.front : slot?.back;
      const attachmentId = fileData?.id;

      if (attachmentId) {
        try {
          await deleteAttachment(attachmentId);
          toast.success('فایل حذف شد');
        } catch {
          toast.error('خطا در حذف فایل');
          return;
        }
      }

      setCheques(prev =>
        prev.map((item, i) => {
          if (i !== index) return item;
          const next = { ...item, inquiryStatus: 'idle' as InquiryStatus };
          if (side === 'front') {
            delete next.front;
            delete next.frontProgress;
          } else {
            delete next.back;
            delete next.backProgress;
          }
          return next;
        }),
      );
      const refs = side === 'front' ? chequeFrontRefs : chequeBackRefs;
      if (refs.current[index]) refs.current[index]!.value = '';
    },
    [cheques],
  );

  const uploadStaticFile = useCallback(async (file: File, key: StaticFileKey) => {
    setStaticProgress(prev => ({
      ...prev,
      [key]: { status: 'uploading', message: 'در حال آپلود...', progress: 0 },
    }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('Name', file.name);
      formDataUpload.append('attachmentType', String(STATIC_ATTACHMENT_TYPES[key]));
      formDataUpload.append('file', file);

      const result = await uploadAttachment(formDataUpload);

      setStaticProgress(prev => ({
        ...prev,
        [key]: { status: 'success', message: 'آپلود موفق' },
      }));
      setStaticFiles(prev => ({
        ...prev,
        [key]: { ...prev[key]!, id: result.id },
      }));
      toast.success('فایل با موفقیت آپلود شد');
    } catch {
      setStaticProgress(prev => ({
        ...prev,
        [key]: { status: 'error', message: 'خطا در آپلود' },
      }));
      toast.error('خطا در آپلود فایل');
    }
  }, []);

  const handleStaticFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>, key: StaticFileKey) => {
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
        setStaticFiles(prev => ({
          ...prev,
          [key]: { file, preview: reader.result as string },
        }));
        void uploadStaticFile(file, key);
      };
      reader.readAsDataURL(file);
    },
    [uploadStaticFile],
  );

  const handleStaticDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>, key: StaticFileKey) => {
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
        setStaticFiles(prev => ({
          ...prev,
          [key]: { file, preview: reader.result as string },
        }));
        void uploadStaticFile(file, key);
      };
      reader.readAsDataURL(file);
    },
    [uploadStaticFile],
  );

  const handleRemoveStaticFile = useCallback(
    async (key: StaticFileKey) => {
      const fileData = staticFiles[key];
      const attachmentId = fileData?.id;

      if (attachmentId) {
        try {
          await deleteAttachment(attachmentId);
          toast.success('فایل حذف شد');
        } catch {
          toast.error('خطا در حذف فایل');
          return;
        }
      }

      setStaticFiles(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setStaticProgress(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });

      if (staticInputRefs.current[key]) {
        staticInputRefs.current[key]!.value = '';
      }
    },
    [staticFiles],
  );

  const firstSayadId = cheques[0]?.sayadId || '';

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

      if (firstSayadId) {
        ctx.fillText(firstSayadId, 220, 74);
      }

      if (guaranteedAmount) {
        ctx.fillText(guaranteedAmount.toString(), 193, 190);
      }
    };

    const drawCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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
  }, [firstSayadId, guaranteedAmount]);

  const validateForm = (): boolean => {
    if (requiresCheque) {
      for (let i = 0; i < cheques.length; i++) {
        const cheque = cheques[i];
        if (cheque.sayadId.length !== 16) {
          toast.error(`چک ${i + 1}: شناسه یکتای صیادی باید 16 رقم باشد`);
          setShakeIndex(i);
          setTimeout(() => setShakeIndex(null), 500);
          return false;
        }

        if (!cheque.front || cheque.frontProgress?.status !== 'success') {
          toast.error(`چک ${i + 1}: لطفا تصویر روی چک صیادی را آپلود کنید`);
          return false;
        }

        if (!cheque.back || cheque.backProgress?.status !== 'success') {
          toast.error(`چک ${i + 1}: لطفا تصویر پشت چک صیادی را آپلود کنید`);
          return false;
        }

        if (!cheque.front.id || !cheque.back.id) {
          toast.error(`چک ${i + 1}: شناسه فایل آپلود شده ناقص است`);
          return false;
        }
      }

      const sayadIds = cheques.map(c => c.sayadId);
      const duplicates = sayadIds.filter((id, idx) => sayadIds.indexOf(id) !== idx);
      if (duplicates.length > 0) {
        toast.error('شناسه صیادی تکراری مجاز نیست؛ برای هر چک شناسه یکتا وارد کنید');
        return false;
      }
    }

    if (guarantees.includes('کسر از حقوق')) {
      if (
        !staticFiles.salaryDeductionImage ||
        staticProgress.salaryDeductionImage?.status !== 'success'
      ) {
        toast.error('لطفا تصویر مدرک کسر از حقوق را آپلود کنید');
        return false;
      }
    }

    if (guarantees.includes('سفته')) {
      if (!staticFiles.promissoryImage || staticProgress.promissoryImage?.status !== 'success') {
        toast.error('لطفا تصویر سفته را آپلود کنید');
        return false;
      }
    }

    return true;
  };

  const runSayadInquiries = async (): Promise<boolean> => {
    setIsInquiring(true);

    setCheques(prev =>
      prev.map(item => ({
        ...item,
        inquiryStatus: 'loading' as InquiryStatus,
        inquiryMessage: 'در حال استعلام...',
      })),
    );

    const results = await Promise.all(
      cheques.map(async (cheque, index) => {
        const result = await sayadInquiry(cheque.sayadId);
        return { index, result };
      }),
    );

    let allOk = true;

    for (const { index, result } of results) {
      if (!result.ok) {
        allOk = false;
        toast.error(`چک ${index + 1}: ${result.message}`);
      }
    }

    setCheques(prev =>
      prev.map((item, index) => {
        const match = results.find(r => r.index === index);
        if (!match) return item;
        const { result } = match;
        if (result.ok) {
          return {
            ...item,
            inquiryStatus: 'success' as InquiryStatus,
            inquiryMessage: result.message || 'استعلام با موفقیت انجام شد',
            inquiryData: result.data,
          };
        }
        return {
          ...item,
          inquiryStatus: 'error' as InquiryStatus,
          inquiryMessage: result.message,
          inquiryData: result.data,
        };
      }),
    );
    setIsInquiring(false);

    if (!allOk) {
      toast.error('تا زمانی که استعلام همه چک‌ها موفق نباشد، امکان ادامه وجود ندارد');
      return false;
    }

    toast.success('استعلام همه چک‌های صیادی با موفقیت انجام شد');
    return true;
  };

  const registerAndContinue = (formPayload: ChequeFormData) => {
    const chequeItems = cheques.map(c => ({
      sayadId: c.sayadId,
      attachmentId: c.front!.id!,
      attachmentBackId: c.back!.id!,
    }));

    const payload = {
      sayadId: chequeItems[0]?.sayadId || null,
      requestId,
      attachmentId: chequeItems[0]?.attachmentId || null,
      attachmentBackId: chequeItems[0]?.attachmentBackId || null,
      attachmentPromissoryId: staticFiles.promissoryImage?.id || null,
      attachmentDeductionSalaryId: staticFiles.salaryDeductionImage?.id || null,
      ...(chequeItems.length > 0 ? { cheques: chequeItems } : {}),
    };

    registerChequeMutation.mutate(payload, {
      onSuccess: result => {
        if (result.isSuccess) {
          changeRequestStateMutation.mutate(
            { id: requestId, requestState: 7 },
            {
              onSuccess: () => {
                toast.success('اطلاعات با موفقیت ثبت شد');
                onNext?.(formPayload);
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

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isReadOnly) return;
    if (!validateForm()) return;

    const formPayload: ChequeFormData = {
      sayadId: cheques[0]?.sayadId || '',
      sayadIds: cheques.map(c => c.sayadId),
    };

    if (requiresCheque) {
      const onlyExistingCheques = cheques.every(c => c.front?.isExisting && c.back?.isExisting);
      const sayadUnchanged =
        cheques.length === 1 &&
        cheques[0].sayadId === (previewData?.chequeSayadId || '') &&
        !!previewData?.chequeId;

      const staticUnchanged =
        (!guarantees.includes('سفته') || !!staticFiles.promissoryImage?.isExisting) &&
        (!guarantees.includes('کسر از حقوق') || !!staticFiles.salaryDeductionImage?.isExisting);

      // Marketing: CTA is استعلام — every submit must re-inquire all cheques
      const inquired = await runSayadInquiries();
      if (!inquired) return;

      if (onlyExistingCheques && sayadUnchanged && staticUnchanged && previewData?.chequeId) {
        onNext?.(formPayload);
        return;
      }

      registerAndContinue(formPayload);
      return;
    }

    // No cheque — only promissory / salary deduction
    const staticKeys: StaticFileKey[] = [];
    if (guarantees.includes('کسر از حقوق')) staticKeys.push('salaryDeductionImage');
    if (guarantees.includes('سفته')) staticKeys.push('promissoryImage');

    const onlyExisting =
      staticKeys.length > 0 && staticKeys.every(key => staticFiles[key]?.isExisting);

    if (onlyExisting && previewData?.chequeId) {
      onNext?.(formPayload);
      return;
    }

    registerAndContinue(formPayload);
  };

  const isBusy =
    isInquiring || registerChequeMutation.isPending || changeRequestStateMutation.isPending;

  const submitLabel = (() => {
    if (isBusy) {
      if (isInquiring) return 'در حال استعلام...';
      return 'در حال ثبت...';
    }
    if (isEditMode) return 'ویرایش';
    if (requiresCheque) return 'استعلام چک صیادی';
    return 'مرحله بعد';
  })();

  return (
    <form onSubmit={e => void onFormSubmit(e)} className='space-y-6'>
      {requiresCheque && (
        <Card>
          <CardHeader
            className='cursor-pointer hover:bg-gray-50'
            onClick={() => toggleAccordion('cheque')}
          >
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>ثبت چک صیادی</CardTitle>
                <p className='text-sm text-muted-foreground mt-1'>
                  تعداد چک موردنیاز بر اساس طرح: {resolvedChequeCount}
                </p>
              </div>
              {accordionStates.cheque ? (
                <ChevronUp className='w-5 h-5' />
              ) : (
                <ChevronDown className='w-5 h-5' />
              )}
            </div>
          </CardHeader>
          {accordionStates.cheque && (
            <CardContent className='space-y-8'>
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

              {guaranteedAmount ? (
                <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                  <p className='text-center'>
                    مبلغ ثبت هر چک باید{' '}
                    <strong className='text-red-600'>
                      {guaranteedAmount.toLocaleString('fa-IR')}
                    </strong>{' '}
                    ریال باشد
                  </p>
                </div>
              ) : null}

              {cheques.map((cheque, index) => (
                <div
                  key={`cheque-slot-${index}`}
                  className='space-y-4 rounded-lg border border-gray-200 p-4 bg-white'
                >
                  <div className='flex items-center justify-between gap-3 flex-wrap'>
                    <h3 className='font-semibold text-gray-900'>
                      چک صیادی{' '}
                      {resolvedChequeCount > 1 ? `${index + 1} از ${resolvedChequeCount}` : ''}
                    </h3>
                    {cheque.inquiryStatus === 'success' && (
                      <span className='inline-flex items-center gap-1 text-sm text-green-700'>
                        <CheckCircle2 className='w-4 h-4' />
                        استعلام موفق
                      </span>
                    )}
                    {cheque.inquiryStatus === 'error' && (
                      <span className='inline-flex items-center gap-1 text-sm text-red-700'>
                        <XCircle className='w-4 h-4' />
                        استعلام ناموفق
                      </span>
                    )}
                    {cheque.inquiryStatus === 'loading' && (
                      <span className='inline-flex items-center gap-1 text-sm text-blue-700'>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        در حال استعلام
                      </span>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Label htmlFor={`sayadId-${index}`}>
                        شناسه یکتای صیادی <span className='text-red-500'>*</span>
                      </Label>
                      {index === 0 && (
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
                      )}
                    </div>
                    <Input
                      type='text'
                      id={`sayadId-${index}`}
                      name={`sayadId-${index}`}
                      value={cheque.sayadId}
                      onChange={e => handleSayadChange(index, e.target.value)}
                      inputMode='numeric'
                      pattern='[0-9]*'
                      maxLength={16}
                      required
                      disabled={isReadOnly || isBusy}
                      className={cn(
                        cheque.sayadId.length === 16
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : 'border-red-500 focus-visible:ring-red-500',
                        shakeIndex === index && 'animate-shake',
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm',
                        cheque.sayadId.length === 16 ? 'text-green-600' : 'text-red-600',
                      )}
                    >
                      {cheque.sayadId.length > 0 && `${cheque.sayadId.length} رقم وارد شده`}
                    </span>
                  </div>

                  {index === 0 && (
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          ref={imgRef}
                          src='/images/FrontOfCheck.png'
                          alt='Front of Check'
                          className='hidden'
                        />
                      </div>
                    </div>
                  )}

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <GenericFileUpload
                      label='تصویر روی چک صیادی'
                      uploadedFile={cheque.front}
                      uploadProgress={cheque.frontProgress}
                      inputRef={el => {
                        chequeFrontRefs.current[index] = el;
                      }}
                      onFileSelect={e =>
                        handleChequeFile(index, 'front', e.target.files?.[0], () => {
                          e.target.value = '';
                        })
                      }
                      onDrop={e => {
                        e.preventDefault();
                        handleChequeFile(index, 'front', e.dataTransfer.files[0], () => undefined);
                      }}
                      onRemoveFile={() => void handleRemoveChequeFile(index, 'front')}
                      disabled={isReadOnly || isBusy}
                    />
                    <GenericFileUpload
                      label='تصویر پشت چک صیادی'
                      uploadedFile={cheque.back}
                      uploadProgress={cheque.backProgress}
                      inputRef={el => {
                        chequeBackRefs.current[index] = el;
                      }}
                      onFileSelect={e =>
                        handleChequeFile(index, 'back', e.target.files?.[0], () => {
                          e.target.value = '';
                        })
                      }
                      onDrop={e => {
                        e.preventDefault();
                        handleChequeFile(index, 'back', e.dataTransfer.files[0], () => undefined);
                      }}
                      onRemoveFile={() => void handleRemoveChequeFile(index, 'back')}
                      disabled={isReadOnly || isBusy}
                    />
                  </div>

                  {cheque.inquiryStatus === 'success' && cheque.inquiryData && (
                    <div className='rounded-lg border border-green-200 bg-green-50 p-3 text-sm space-y-1'>
                      {cheque.inquiryData.name && (
                        <p>
                          نام صاحب حساب: <strong>{cheque.inquiryData.name}</strong>
                        </p>
                      )}
                      {cheque.inquiryData.iban && (
                        <p>
                          شبا: <strong dir='ltr'>{cheque.inquiryData.iban}</strong>
                        </p>
                      )}
                      {cheque.inquiryData.mediaTypeDescription && (
                        <p>{cheque.inquiryData.mediaTypeDescription}</p>
                      )}
                      {cheque.inquiryMessage && (
                        <p className='text-green-700'>{cheque.inquiryMessage}</p>
                      )}
                    </div>
                  )}

                  {cheque.inquiryStatus === 'error' && cheque.inquiryMessage && (
                    <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
                      {cheque.inquiryMessage}
                    </div>
                  )}
                </div>
              ))}
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
              <GenericFileUpload
                label={STATIC_FILE_LABELS.salaryDeductionImage}
                uploadedFile={staticFiles.salaryDeductionImage}
                uploadProgress={staticProgress.salaryDeductionImage}
                inputRef={el => {
                  staticInputRefs.current.salaryDeductionImage = el;
                }}
                onFileSelect={e => handleStaticFileSelect(e, 'salaryDeductionImage')}
                onDrop={e => handleStaticDrop(e, 'salaryDeductionImage')}
                onRemoveFile={() => void handleRemoveStaticFile('salaryDeductionImage')}
                disabled={isReadOnly || isBusy}
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
              <GenericFileUpload
                label={STATIC_FILE_LABELS.promissoryImage}
                uploadedFile={staticFiles.promissoryImage}
                uploadProgress={staticProgress.promissoryImage}
                inputRef={el => {
                  staticInputRefs.current.promissoryImage = el;
                }}
                onFileSelect={e => handleStaticFileSelect(e, 'promissoryImage')}
                onDrop={e => handleStaticDrop(e, 'promissoryImage')}
                onRemoveFile={() => void handleRemoveStaticFile('promissoryImage')}
                disabled={isReadOnly || isBusy}
              />
            </CardContent>
          )}
        </Card>
      )}

      <div className='flex justify-center gap-4'>
        <Button type='submit' disabled={isReadOnly || isBusy} size='lg'>
          {isBusy && <Loader2 className='w-4 h-4 animate-spin ml-1' />}
          {submitLabel}
        </Button>
        {onBack && (
          <Button type='button' variant='outline' size='lg' onClick={onBack} disabled={isBusy}>
            بازگشت
          </Button>
        )}
        {onCancel && (
          <Button type='button' variant='outline' size='lg' onClick={onCancel} disabled={isBusy}>
            انصراف
          </Button>
        )}
      </div>
    </form>
  );
}
