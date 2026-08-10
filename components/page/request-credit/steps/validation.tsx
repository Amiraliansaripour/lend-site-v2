'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  sendOtpIc,
  icsFullProcess,
  changeRequestState,
  type IcsFullProcessData,
} from '@/api/facility';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface ValidationProps {
  requestId: string;
  nationalCode?: string;
  mobileNumber?: string;
  neededScore?: number;
  isEditMode?: boolean;
  isReadOnly?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
}

type ValidationPhase = 'loading' | 'otp' | 'result' | 'waiting' | 'unavailable' | 'error';

const WAITING_STATUSES = new Set(['waiting', 'pending', 'inqueue']);

function normalizeStatus(status?: string | null): string {
  return (status || '').trim().toLowerCase();
}

function isWaitingStatus(status?: string | null): boolean {
  return WAITING_STATUSES.has(normalizeStatus(status));
}

function isUnavailableStatus(status?: string | null): boolean {
  return normalizeStatus(status) === 'unavailable';
}

function isCompletedStatus(
  status?: string | null,
  isComplete?: boolean,
  success?: boolean,
): boolean {
  const normalized = normalizeStatus(status);
  if (normalized === 'completed' || normalized === 'reportgenerated' || normalized === '200') {
    return true;
  }
  return Boolean(isComplete && success);
}

function ValidationCard({
  title,
  value,
  variant = 'default',
}: {
  title: string;
  value: string | number;
  variant?: 'success' | 'danger' | 'info' | 'warning' | 'default';
}) {
  const variants = {
    success: 'border-green-600/50 bg-green-100/50',
    danger: 'border-red-600/50 bg-red-100/50',
    info: 'border-blue-600/50 bg-blue-100/50',
    warning: 'border-yellow-600/50 bg-yellow-100/50',
    default: 'border-purple-600/50 bg-purple-100/50',
  };

  return (
    <div className={cn('rounded-2xl font-bold p-3 border-2', variants[variant])}>
      <div className='grid grid-cols-2 place-items-center h-10'>
        <h3 className='whitespace-nowrap'>{title} :</h3>
        <p className='text-center w-full'>{value}</p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className='rounded-2xl font-bold p-3 border-2 border-gray-300/50 bg-gray-100/50'>
      <div className='flex flex-col gap-2'>
        <p className='text-gray-500'>در حال بارگذاری ...</p>
        <Skeleton className='h-4 w-full' />
      </div>
    </div>
  );
}

function OtpVerificationCard({
  otp,
  isVerifying,
  onOtpChange,
  onVerify,
  onResend,
  isResending,
}: {
  otp: string;
  isVerifying: boolean;
  onOtpChange: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  isResending: boolean;
}) {
  return (
    <Card className='max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>تایید کد پنج رقمی</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-sm text-muted-foreground'>
          لطفا کد ۵ رقمی ارسال شده به شماره موبایل خود را وارد کنید.
        </p>
        <input
          type='text'
          maxLength={5}
          value={otp}
          onChange={e => onOtpChange(e.target.value.replace(/\D/g, ''))}
          className='w-full text-center text-2xl tracking-widest border rounded-lg p-4'
          placeholder='- - - - -'
          dir='ltr'
        />
        <div className='flex gap-2'>
          <Button onClick={onVerify} disabled={isVerifying || otp.length !== 5} className='flex-1'>
            {isVerifying ? 'در حال تایید...' : 'تایید'}
          </Button>
          <Button variant='outline' onClick={onResend} disabled={isResending || isVerifying}>
            {isResending ? <Loader2 className='h-4 w-4 animate-spin' /> : 'ارسال مجدد'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusMessageCard({
  title,
  description,
  variant = 'warning',
  onRetry,
  isRetrying,
  children,
}: {
  title: string;
  description: string;
  variant?: 'warning' | 'danger';
  onRetry?: () => void;
  isRetrying?: boolean;
  children?: React.ReactNode;
}) {
  const styles =
    variant === 'danger'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-amber-200 bg-amber-50 text-amber-800';

  return (
    <Card className={cn('border', styles)}>
      <CardContent className='pt-6 space-y-4'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='h-5 w-5 mt-0.5 shrink-0' />
          <div className='space-y-1 text-right'>
            <h3 className='font-semibold'>{title}</h3>
            <p className='text-sm leading-6'>{description}</p>
          </div>
        </div>
        {children}
        {onRetry && (
          <div className='flex justify-center'>
            <Button onClick={onRetry} disabled={isRetrying} size='lg'>
              {isRetrying ? (
                <Loader2 className='h-4 w-4 animate-spin ml-2' />
              ) : (
                <RefreshCw className='h-4 w-4 ml-2' />
              )}
              تلاش مجدد
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Validation({
  requestId,
  nationalCode,
  mobileNumber,
  neededScore = 0,
  isEditMode = false,
  isReadOnly = false,
  onNext,
  onBack,
  onCancel,
}: ValidationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') || requestId;

  const [phase, setPhase] = useState<ValidationPhase>('loading');
  const [creditData, setCreditData] = useState<IcsFullProcessData | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const initializedRef = useRef(false);

  const checkValidationScore = useCallback(() => {
    if (creditData?.score == null || creditData.score === '') return false;
    return Number(creditData.score) >= Number(neededScore);
  }, [creditData?.score, neededScore]);

  const handleSendOtp = useCallback(
    async (showSuccessToast = false) => {
      if (!nationalCode || !mobileNumber) {
        toast.error('اطلاعات کد ملی یا شماره موبایل ناقص است.');
        setPhase('error');
        setStatusMessage('اطلاعات هویتی برای اعتبارسنجی ناقص است.');
        return;
      }

      try {
        setIsSendingOtp(true);
        setPhase('loading');

        const data = await sendOtpIc({ nationalCode, mobileNumber });

        if (isUnavailableStatus(data.status)) {
          setPhase('unavailable');
          setStatusMessage(
            data.message ||
              'سرویس‌دهنده اعتبارسنجی در حال حاضر مشغول است. لطفاً بعداً دوباره تلاش کنید. نیازی به پرداخت مجدد نیست.',
          );
          return;
        }

        const normalized = normalizeStatus(data.status);
        // InQueue / waiting: process not ready for OTP yet — show retry (no re-payment).
        if (data.isInQueue || normalized === 'inqueue' || normalized === 'waiting') {
          setPhase('waiting');
          setStatusMessage(
            data.message || 'درخواست شما در صف بررسی است. لطفاً کمی صبر کنید و دوباره تلاش کنید.',
          );
          return;
        }

        // Pending (or success) after SendOtpIc typically means the SMS was sent.
        setOtp('');
        setPhase('otp');
        if (showSuccessToast || data.message) {
          toast.success(data.message || 'کد تایید ارسال شد');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'خطا در ارسال کد تایید';
        toast.error(message);
        setPhase('error');
        setStatusMessage(message);
      } finally {
        setIsSendingOtp(false);
      }
    },
    [nationalCode, mobileNumber],
  );

  useEffect(() => {
    if (!id || !nationalCode || !mobileNumber || initializedRef.current) return;
    initializedRef.current = true;
    void handleSendOtp(false);
  }, [id, nationalCode, mobileNumber, handleSendOtp]);

  const handleProcessResult = useCallback((data: IcsFullProcessData) => {
    if (isUnavailableStatus(data.status)) {
      setCreditData(null);
      setPhase('unavailable');
      setStatusMessage(
        data.message ||
          'سرویس‌دهنده اعتبارسنجی در حال حاضر مشغول است. لطفاً بعداً دوباره تلاش کنید. نیازی به پرداخت مجدد نیست.',
      );
      return;
    }

    if (isWaitingStatus(data.status) || (!data.isComplete && !data.success)) {
      setCreditData(null);
      setPhase('waiting');
      setStatusMessage(
        data.message || 'درخواست شما در صف بررسی است. لطفاً کمی صبر کنید و دوباره تلاش کنید.',
      );
      return;
    }

    if (isCompletedStatus(data.status, data.isComplete, data.success)) {
      setCreditData(data);
      setPhase('result');
      toast.success(data.message || 'اعتبارسنجی با موفقیت انجام شد');
      return;
    }

    // Fallback: unknown status — treat as waiting with retry
    setCreditData(null);
    setPhase('waiting');
    setStatusMessage(data.message || 'وضعیت اعتبارسنجی مشخص نیست. لطفاً دوباره تلاش کنید.');
  }, []);

  const handleVerifyOtp = async () => {
    if (!id || !nationalCode || !mobileNumber || otp.length !== 5) {
      toast.error('لطفا کد ۵ رقمی را وارد کنید');
      return;
    }

    try {
      setIsVerifying(true);
      const data = await icsFullProcess({
        lendRequestId: id,
        nationalCode,
        mobileNumber,
        token: otp,
      });
      handleProcessResult(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'کد وارد شده صحیح نیست';
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRetry = async () => {
    setOtp('');
    await handleSendOtp(true);
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;

    if (isVerifying || phase === 'loading' || !creditData) {
      toast.error('پس از اعلام وضعیت اعتبارسنجی امکان رفتن به مرحله بعد وجود دارد.');
      return;
    }

    if (!checkValidationScore()) {
      toast.error(`امتیاز مورد نیاز برای این طرح ${neededScore} است`);
      return;
    }

    try {
      await changeRequestState({ id: id!, requestState: 4 });

      if (isEditMode) {
        router.push('/requests');
      } else if (onNext) {
        onNext();
      }
    } catch {
      toast.error('خطا در ثبت اطلاعات');
    }
  };

  if (phase === 'loading') {
    return (
      <div className='flex flex-col items-center justify-center min-h-[200px] gap-3'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <p className='text-gray-700 text-lg'>در حال بررسی وضعیت اعتبارسنجی...</p>
      </div>
    );
  }

  if (phase === 'otp') {
    return (
      <OtpVerificationCard
        otp={otp}
        isVerifying={isVerifying}
        onOtpChange={setOtp}
        onVerify={handleVerifyOtp}
        onResend={handleRetry}
        isResending={isSendingOtp}
      />
    );
  }

  if (phase === 'unavailable') {
    return (
      <div className='space-y-6'>
        <StatusMessageCard
          title='سرویس موقتاً در دسترس نیست'
          description={
            statusMessage ||
            'سرویس‌دهنده اعتبارسنجی در حال حاضر مشغول است. لطفاً بعداً دوباره تلاش کنید. نیازی به پرداخت مجدد نیست.'
          }
          variant='danger'
          onRetry={handleRetry}
          isRetrying={isSendingOtp}
        />
        <div className='flex justify-center gap-4'>
          {onBack && (
            <Button variant='outline' size='lg' onClick={onBack}>
              بازگشت
            </Button>
          )}
          {!isEditMode && onCancel && (
            <Button variant='outline' size='lg' onClick={onCancel}>
              انصراف
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'waiting' || phase === 'error') {
    return (
      <div className='space-y-6'>
        <StatusMessageCard
          title={phase === 'error' ? 'خطا در اعتبارسنجی' : 'در انتظار نتیجه'}
          description={statusMessage}
          variant={phase === 'error' ? 'danger' : 'warning'}
          onRetry={handleRetry}
          isRetrying={isSendingOtp}
        />
        <div className='flex justify-center gap-4'>
          {onBack && (
            <Button variant='outline' size='lg' onClick={onBack}>
              بازگشت
            </Button>
          )}
          {!isEditMode && onCancel && (
            <Button variant='outline' size='lg' onClick={onCancel}>
              انصراف
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>اعتبار سنجی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {!creditData ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <ValidationCard
                  title='امتیاز'
                  value={creditData.score ?? '-'}
                  variant={checkValidationScore() ? 'success' : 'danger'}
                />
                <ValidationCard title='ریسک' value={creditData.risk || '-'} variant='info' />
                <ValidationCard
                  title='امتیاز مورد نیاز'
                  value={neededScore || 0}
                  variant='default'
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-center gap-4'>
        <Button
          onClick={handleSubmit}
          disabled={isReadOnly || !checkValidationScore() || isVerifying || !creditData}
          size='lg'
        >
          {isEditMode ? 'ویرایش' : 'مرحله بعد'}
        </Button>
        {onBack && (
          <Button variant='outline' size='lg' onClick={onBack}>
            بازگشت
          </Button>
        )}
        {!isEditMode && onCancel && (
          <Button variant='outline' size='lg' onClick={onCancel}>
            انصراف
          </Button>
        )}
      </div>
    </div>
  );
}
