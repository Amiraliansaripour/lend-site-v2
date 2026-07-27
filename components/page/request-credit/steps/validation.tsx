'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  sendValidationOtp,
  verifyValidationOtp,
  sendFinotechInquiry,
  getFinotechCreditStatus,
  changeRequestState,
  type FinotechCreditData,
} from '@/api/facility';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ValidationProps {
  requestId: string;
  userId?: string;
  neededScore?: number;
  validateType?: number | null;
  isEditMode?: boolean;
  isReadOnly?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
}

interface IranianValidationData {
  score?: number;
  risk?: string;
  token?: string;
  trackId?: string;
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

// ─── Iranian Validation (validateType === 1) ─────────────────────────────────

function IranianValidation({
  requestId,
  userId,
  neededScore,
  isEditMode,
  isReadOnly,
  onNext,
  onBack,
  onCancel,
}: Omit<ValidationProps, 'validateType'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') || requestId;

  const [validationData, setValidationData] = useState<IranianValidationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInfo, setOtpInfo] = useState<{ token: string; trackId: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState('');

  const checkValidationScore = useCallback(() => {
    if (!validationData?.score) return false;
    return Number(validationData.score) >= Number(neededScore);
  }, [validationData?.score, neededScore]);

  const initializeValidation = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await sendValidationOtp(id);

      if (!data?.score) {
        setShowOtpModal(true);
        setOtpInfo({ token: data.token!, trackId: data.trackId! });
      } else {
        setValidationData(data);
      }
    } catch {
      toast.error('خطا در دریافت اطلاعات اعتبارسنجی');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && userId) {
      void initializeValidation();
    }
  }, [id, userId, initializeValidation]);

  const handleVerifyOtp = async () => {
    if (!otpInfo || !id || otp.length !== 5) {
      toast.error('لطفا کد 5 رقمی را وارد کنید');
      return;
    }

    try {
      setIsVerifying(true);
      const data = await verifyValidationOtp({
        trackId: otpInfo.trackId,
        token: otpInfo.token,
        otp,
        requestId: id,
      });

      toast.success('کد با موفقیت تایید شد');
      setShowOtpModal(false);
      setValidationData(data);
    } catch {
      toast.error('کد وارد شده صحیح نیست');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;

    if (isVerifying) {
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

  if (showOtpModal) {
    return (
      <Card className='max-w-md mx-auto'>
        <CardHeader>
          <CardTitle>تایید کد پنج رقمی</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            لطفا کد 5 رقمی ارسال شده به شماره موبایل خود را وارد کنید.
          </p>
          <input
            type='text'
            maxLength={5}
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            className='w-full text-center text-2xl tracking-widest border rounded-lg p-4'
            placeholder='- - - - -'
            dir='ltr'
          />
          <div className='flex gap-2'>
            <Button
              onClick={handleVerifyOtp}
              disabled={isVerifying || otp.length !== 5}
              className='flex-1'
            >
              {isVerifying ? 'در حال تایید...' : 'تایید'}
            </Button>
            <Button variant='outline' onClick={() => setShowOtpModal(false)}>
              انصراف
            </Button>
          </div>
        </CardContent>
      </Card>
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
            {isLoading || isVerifying ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <ValidationCard
                  title='امتیاز'
                  value={validationData?.score || '-'}
                  variant={checkValidationScore() ? 'success' : 'danger'}
                />
                <ValidationCard title='ریسک' value={validationData?.risk || '-'} variant='info' />
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
          disabled={isReadOnly || !checkValidationScore() || isVerifying}
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

// ─── Finotech Validation (validateType === 0) ────────────────────────────────

function FinotechValidation({
  requestId,
  userId,
  isEditMode,
  isReadOnly,
  onNext,
  onBack,
  onCancel,
}: Omit<ValidationProps, 'validateType' | 'neededScore'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') || requestId;

  const [creditData, setCreditData] = useState<FinotechCreditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState('');

  const checkAllConditions = useCallback(() => {
    if (!creditData) return false;
    return (
      creditData.lifeStatus === true &&
      creditData.chequeColorStatus === 1 &&
      creditData.isBlocked !== true &&
      creditData.over18 === true &&
      creditData.facilityDeferred === false &&
      creditData.guarantyDeferred === false
    );
  }, [creditData]);

  const fetchCreditData = useCallback(async () => {
    if (!userId || !id) return;
    try {
      setIsLoading(true);
      const data = await getFinotechCreditStatus(userId, id);
      setCreditData(data);
    } catch {
      setCreditData(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, id]);

  const checkOtpStatus = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const response = await sendFinotechInquiry(id);

      if (response?.otpStatus) {
        setShowOtpModal(true);
        setIsLoading(false);
      } else {
        await fetchCreditData();
      }
    } catch {
      setIsLoading(false);
    }
  }, [id, fetchCreditData]);

  useEffect(() => {
    if (id && userId) {
      void checkOtpStatus();
    }
  }, [id, userId, checkOtpStatus]);

  const handleVerifyOtp = async () => {
    if (!id || otp.length !== 5) {
      toast.error('لطفا کد 5 رقمی را وارد کنید');
      return;
    }

    try {
      setIsVerifying(true);
      const response = await sendFinotechInquiry(id, otp);

      if (!response?.otpStatus) {
        toast.success('کد با موفقیت تایید شد');
        setShowOtpModal(false);
        await fetchCreditData();
      } else {
        toast.error('کد وارد شده صحیح نیست.');
      }
    } catch {
      toast.error('خطا در بررسی کد تایید.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;

    if (isLoading || !creditData) {
      toast.error('پس از اعلام وضعیت اعتبارسنجی امکان رفتن به مرحله بعد وجود دارد.');
      return;
    }

    if (!checkAllConditions()) {
      toast.error('برای ادامه اعتبارسنجی باید همه شرایط صحیح باشد.');
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

  if (isLoading && !creditData && !showOtpModal) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[200px]'>
        <p className='text-gray-700 text-lg'>در حال بررسی وضعیت اعتبارسنجی...</p>
      </div>
    );
  }

  if (showOtpModal) {
    return (
      <Card className='max-w-md mx-auto'>
        <CardHeader>
          <CardTitle>کد دریافت اعتبار سنجی</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            لطفا کد 5 رقمی ارسال شده به شماره موبایل خود را وارد کنید.
          </p>
          <input
            type='text'
            maxLength={5}
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            className='w-full text-center text-2xl tracking-widest border rounded-lg p-4'
            placeholder='- - - - -'
            dir='ltr'
          />
          <div className='flex gap-2'>
            <Button
              onClick={handleVerifyOtp}
              disabled={isVerifying || otp.length !== 5}
              className='flex-1'
            >
              {isVerifying ? 'در حال تایید...' : 'تایید'}
            </Button>
            <Button variant='outline' onClick={() => router.push('/requests')}>
              انصراف
            </Button>
          </div>
        </CardContent>
      </Card>
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
            {isLoading || !creditData ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <ValidationCard
                  title='در قید حیات'
                  value={creditData.lifeStatus ? 'است' : 'نیست'}
                  variant={creditData.lifeStatus ? 'success' : 'danger'}
                />
                <ValidationCard
                  title='چک برگشتی'
                  value={creditData.chequeColorStatus === 1 ? 'فاقد چک برگشتی' : 'دارای چک برگشتی'}
                  variant={creditData.chequeColorStatus === 1 ? 'success' : 'danger'}
                />
                <ValidationCard
                  title='لیست سیاه بانکی'
                  value={!creditData.isBlocked ? 'نیست' : 'است'}
                  variant={!creditData.isBlocked ? 'success' : 'danger'}
                />
                <ValidationCard
                  title='بالای 18 سال'
                  value={creditData.over18 ? 'است' : 'نیست'}
                  variant={creditData.over18 ? 'success' : 'danger'}
                />
                <ValidationCard
                  title='تسهیلات معوق'
                  value={creditData.facilityDeferred === false ? 'ندارد' : 'دارد'}
                  variant={creditData.facilityDeferred === false ? 'success' : 'danger'}
                />
                <ValidationCard
                  title='ضمانت های معوق'
                  value={creditData.guarantyDeferred === false ? 'ندارد' : 'دارد'}
                  variant={creditData.guarantyDeferred === false ? 'success' : 'danger'}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-center gap-4'>
        <Button
          onClick={handleSubmit}
          disabled={isReadOnly || !checkAllConditions() || isLoading}
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

// ─── Exported Wrapper ────────────────────────────────────────────────────────

export function Validation({
  requestId,
  userId,
  neededScore = 0,
  validateType,
  isEditMode = false,
  isReadOnly = false,
  onNext,
  onBack,
  onCancel,
}: ValidationProps) {
  if (validateType === 1) {
    return (
      <IranianValidation
        requestId={requestId}
        userId={userId}
        neededScore={neededScore}
        isEditMode={isEditMode}
        isReadOnly={isReadOnly}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />
    );
  }

  if (validateType === 0) {
    return (
      <FinotechValidation
        requestId={requestId}
        userId={userId}
        isEditMode={isEditMode}
        isReadOnly={isReadOnly}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />
    );
  }

  return (
    <Card>
      <CardContent className='flex items-center justify-center min-h-[200px]'>
        <p className='text-muted-foreground'>اطلاعات اعتبار سنجی یافت نشد.</p>
      </CardContent>
    </Card>
  );
}
