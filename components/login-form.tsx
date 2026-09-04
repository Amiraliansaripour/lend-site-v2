'use client';

import { useEffect, useState } from 'react';

// * sonner
import { toast } from 'sonner';

// * tanstack query
import { useQuery } from '@tanstack/react-query';

// * i18n
import { useRouter } from '@/i18n/navigation';

// * lucide icons
import { RefreshCcw } from 'lucide-react';

// * queriess
import { getCaptchaQueryOptions } from '@/queries/captcha';

// * mutations
import { useLoginByOtp, useLoginByUsername } from '@/mutations/users';

// * api
import { LoginOtpSchema, LoginSchema } from '@/api/users';

// * utils
import { base64ToDataUrl } from '@/utils/convert';

// * cookies
import { accessToken } from '@/lib/auth/client/cookies';
import { BrandName } from '@/components/brand-text';

// * components
import { useAppForm } from './form';
import { Button } from '@/components/ui/button';
import { Skeleton } from './ui/skeleton';

const OTP_RESEND_SECONDS = 120;

export function LoginForm() {
  const [isOtpStep, setIsOtpStep] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [captchaCredentials, setCaptchaCredentials] = useState<{
    id: string;
    code: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const router = useRouter();

  const {
    data: captchaData,
    isLoading: captchaLoading,
    refetch: refetchCaptcha,
  } = useQuery(getCaptchaQueryOptions());

  const { mutate: loginUser, isPending } = useLoginByUsername();
  const { mutate: loginByOtp, isPending: isOtpPending } = useLoginByOtp();

  useEffect(() => {
    if (!isOtpStep || canResend) return;

    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timerId = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [isOtpStep, countdown, canResend]);

  const startOtpCountdown = () => {
    setCountdown(OTP_RESEND_SECONDS);
    setCanResend(false);
  };

  const form = useAppForm<{ phoneNumber: string; X_CaptchaCode: number; otp?: string }>({
    defaultValues: {
      otp: '',
      phoneNumber: '',
      X_CaptchaCode: '' as any,
    },

    validators: { onSubmit: isOtpStep ? LoginOtpSchema : LoginSchema },

    onSubmit: async ({ value }) => {
      if (!isOtpStep) {
        const { phoneNumber, X_CaptchaCode } = value;

        if (!captchaData?.id) {
          toast.error('کپچا بارگذاری نشده است');
          return;
        }

        const captchaCode = X_CaptchaCode.toString();

        loginUser(
          {
            phoneNumber,
            isActive: true,
            X_CaptchaId: captchaData.id,
            X_CaptchaCode: captchaCode,
          },
          {
            onSuccess: response => {
              if (!response.isSuccess) {
                refetchCaptcha();
                toast.error(response.message);
                return;
              }
              setIsOtpStep(true);
              setPhoneNumber(phoneNumber);
              setCaptchaCredentials({ id: captchaData.id, code: captchaCode });
              startOtpCountdown();
              toast.success(response.message || 'ورود با موفقیت انجام شد');
            },
          },
        );
      } else {
        const { otp } = value;

        loginByOtp(
          {
            otp: otp ?? '',
            phoneNumber,
            grant_type: 'otp',
          },
          {
            onSuccess: response => {
              if (!response.isSuccess) return toast.error(response.message);
              toast.success(response.message || 'ورود با موفقیت انجام شد');
              accessToken.set(response.data.access_token);
              localStorage.setItem('USER_INFO', JSON.stringify(response.data));
              router.push('/');
            },
          },
        );
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit();
  };

  const reloadCaptcha = () => {
    refetchCaptcha();
  };

  const handleResendOtp = () => {
    if (!phoneNumber || !captchaCredentials || isPending) return;

    loginUser(
      {
        phoneNumber,
        isActive: true,
        X_CaptchaId: captchaCredentials.id,
        X_CaptchaCode: captchaCredentials.code,
      },
      {
        onSuccess: response => {
          if (!response.isSuccess) {
            toast.error(response.message);
            return;
          }
          startOtpCountdown();
          toast.success(response.message || 'کد تایید مجددا ارسال شد');
        },
        onError: () => {
          toast.error('خطا در ارسال مجدد کد');
        },
      },
    );
  };

  const goBackToPhoneStep = () => {
    setIsOtpStep(false);
    form.setFieldValue('otp', '');
    startOtpCountdown();
  };

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className='w-full max-w-md rounded-2xl border border-brand/10 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(0,85,255,0.2)] md:p-8'>
      <div className='mb-8 text-center lg:hidden'>
        <span className='text-3xl font-black text-brand'>
          <BrandName />
        </span>
      </div>

      <div className='mb-8 text-right'>
        <h1 className='text-2xl font-bold text-[#0f172a]'>ورود / ثبت نام</h1>
        <p className='mt-2 text-sm leading-7 text-[#64748b]'>
          {isOtpStep
            ? 'برای ورود به حساب کاربری خود کد اعتبار سنجی را وارد نمایید.'
            : 'برای ورود به حساب کاربری خود شماره همراه را وارد نمایید.'}
        </p>
      </div>

      <div>
        <form onSubmit={handleSubmit} noValidate>
          {isOtpStep ? (
            <>
              <form.AppField
                name='otp'
                children={(field: any) => (
                  <field.TextField
                    className='text-center tracking-[1em] text-xl font-semibold'
                    dir='ltr'
                    type='text'
                    label='کد اعتبار سنجی'
                    placeholder='- - - -'
                    maxLength={4}
                  />
                )}
              />

              <div className='flex flex-col gap-3'>
                <form.AppForm>
                  <form.SubmitButton
                    className='w-full h-12 rounded-xl bg-brand text-white hover:bg-brand/90'
                    disabled={isOtpPending}
                  >
                    {isOtpPending ? 'در حال ارسال...' : 'تایید'}
                  </form.SubmitButton>
                </form.AppForm>

                {canResend ? (
                  <>
                    <Button
                      type='button'
                      variant='outline'
                      className='w-full'
                      onClick={handleResendOtp}
                      disabled={isPending}
                    >
                      {isPending ? 'در حال ارسال...' : 'ارسال مجدد کد'}
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      className='w-full'
                      onClick={goBackToPhoneStep}
                    >
                      بازگشت
                    </Button>
                  </>
                ) : (
                  <div className='flex flex-col items-center gap-2'>
                    <p className='text-center text-sm text-muted-foreground'>
                      ارسال مجدد کد در{' '}
                      <span dir='ltr' className='inline-block tabular-nums'>
                        {formatCountdown(countdown)}
                      </span>
                    </p>
                    <Button
                      type='button'
                      variant='link'
                      className='text-sm text-muted-foreground hover:text-foreground h-auto p-0'
                      onClick={goBackToPhoneStep}
                    >
                      ویرایش شماره همراه
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className='flex flex-col gap-6'>
              <form.AppField
                name='phoneNumber'
                children={(field: any) => (
                  <field.TextField
                    dir='ltr'
                    type='tel'
                    label='شماره همراه'
                    inputMode='tel'
                    placeholder='09123456789'
                    autoComplete='tel'
                  />
                )}
              />

              <div className='flex justify-between items-center gap-x-3 mt-3 w-full'>
                <div className='w-[calc(100%-120px)]'>
                  <form.AppField
                    name='X_CaptchaCode'
                    children={(field: any) => (
                      <field.TextField
                        placeholder='کد کپچا'
                        inputMode='text'
                        autoComplete='one-time-code'
                      />
                    )}
                  />
                </div>
                {!captchaLoading ? (
                  <div className='flex items-center gap-x-2 h-9'>
                    <img
                      src={base64ToDataUrl(captchaData?.captchaImage ?? '')}
                      className='h-9 rounded-md shrink-0'
                    />

                    <RefreshCcw
                      onClick={reloadCaptcha}
                      className='cursor-pointer flex shrink-0 size-5'
                    />
                  </div>
                ) : (
                  <Skeleton className='w-full h-10' />
                )}
              </div>

              <div className='flex flex-col gap-3'>
                <form.AppForm>
                  <form.SubmitButton
                    className='w-full h-12 rounded-xl bg-brand text-white hover:bg-brand/90'
                    disabled={isPending}
                  >
                    {isPending ? 'در حال ارسال...' : 'تایید'}
                  </form.SubmitButton>
                </form.AppForm>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
