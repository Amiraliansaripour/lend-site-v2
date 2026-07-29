'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCcw } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { useAppForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { getCaptchaQueryOptions } from '@/queries/captcha';
import { useLoginByOtp, useLoginByUsername } from '@/mutations/users';
import { LoginOtpSchema, LoginSchema } from '@/api/users';
import { accessToken } from '@/lib/auth/client/cookies';
import { base64ToDataUrl } from '@/utils/convert';

const OTP_RESEND_SECONDS = 120;

type Props = {
  onLoginSuccess: () => void;
};

export function RecipientLogin({ onLoginSuccess }: Props) {
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [captchaCredentials, setCaptchaCredentials] = useState<{ id: string; code: string } | null>(
    null,
  );
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

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
    const id = setTimeout(() => setCountdown(p => p - 1), 1000);
    return () => clearTimeout(id);
  }, [isOtpStep, countdown, canResend]);

  const startCountdown = () => {
    setCountdown(OTP_RESEND_SECONDS);
    setCanResend(false);
  };

  const form = useAppForm<{ phoneNumber: string; X_CaptchaCode: number; otp?: string }>({
    defaultValues: { otp: '', phoneNumber: '', X_CaptchaCode: '' as any },
    validators: { onSubmit: isOtpStep ? LoginOtpSchema : LoginSchema },
    onSubmit: async ({ value }) => {
      if (!isOtpStep) {
        if (!captchaData?.id) {
          toast.error('کپچا بارگذاری نشده است');
          return;
        }
        const captchaCode = value.X_CaptchaCode.toString();
        loginUser(
          {
            phoneNumber: value.phoneNumber,
            isActive: true,
            X_CaptchaId: captchaData.id,
            X_CaptchaCode: captchaCode,
          },
          {
            onSuccess: response => {
              setIsOtpStep(true);
              setPhoneNumber(value.phoneNumber);
              setCaptchaCredentials({ id: captchaData.id, code: captchaCode });
              startCountdown();
              toast.success(response.message || 'کد تایید ارسال شد');
            },
          },
        );
      } else {
        loginByOtp(
          { otp: value.otp ?? '', phoneNumber, grant_type: 'otp' },
          {
            onSuccess: response => {
              if (!response.isSuccess) return toast.error(response.message);
              accessToken.set(response.data.access_token);
              localStorage.setItem('USER_INFO', JSON.stringify(response.data));
              toast.success('ورود با موفقیت انجام شد');
              onLoginSuccess();
            },
          },
        );
      }
    },
  });

  const formatCountdown = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleResend = () => {
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
          startCountdown();
          toast.success(response.message || 'کد مجددا ارسال شد');
        },
      },
    );
  };

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle>ورود خریدار</CardTitle>
        <CardDescription>
          {isOtpStep
            ? 'کد تایید ارسال شده به شماره همراه خود را وارد کنید'
            : 'برای پرداخت، شماره همراه خود را وارد کنید'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={e => {
            e.preventDefault();
            form.handleSubmit();
          }}
          noValidate
        >
          {isOtpStep ? (
            <div className='flex flex-col gap-4'>
              <form.AppField
                name='otp'
                children={(field: any) => (
                  <field.TextField
                    className='text-center tracking-[1em] text-xl font-semibold'
                    dir='ltr'
                    label='کد تایید'
                    placeholder='- - - -'
                    maxLength={4}
                    inputMode='numeric'
                  />
                )}
              />
              <form.AppForm>
                <form.SubmitButton className='w-full' disabled={isOtpPending}>
                  {isOtpPending ? 'در حال بررسی...' : 'تایید'}
                </form.SubmitButton>
              </form.AppForm>
              {canResend ? (
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    className='flex-1'
                    onClick={handleResend}
                    disabled={isPending}
                  >
                    ارسال مجدد
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    className='flex-1'
                    onClick={() => {
                      setIsOtpStep(false);
                      form.setFieldValue('otp', '');
                    }}
                  >
                    بازگشت
                  </Button>
                </div>
              ) : (
                <div className='flex flex-col items-center gap-2'>
                  <p className='text-sm text-muted-foreground text-center'>
                    ارسال مجدد در{' '}
                    <span dir='ltr' className='inline-block tabular-nums'>
                      {formatCountdown(countdown)}
                    </span>
                  </p>
                  <Button
                    type='button'
                    variant='link'
                    className='text-sm h-auto p-0'
                    onClick={() => setIsOtpStep(false)}
                  >
                    ویرایش شماره همراه
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className='flex flex-col gap-4'>
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
              <div className='flex justify-between items-end gap-x-3'>
                <div className='flex-1'>
                  <form.AppField
                    name='X_CaptchaCode'
                    children={(field: any) => (
                      <field.TextField
                        placeholder='کد کپچا'
                        inputMode='numeric'
                        autoComplete='one-time-code'
                      />
                    )}
                  />
                </div>
                {!captchaLoading ? (
                  <div className='flex items-center gap-x-2 h-9 shrink-0'>
                    <img
                      src={base64ToDataUrl(captchaData?.captchaImage ?? '')}
                      className='h-9 rounded-md'
                    />
                    <RefreshCcw
                      onClick={() => refetchCaptcha()}
                      className='cursor-pointer size-5'
                    />
                  </div>
                ) : (
                  <Skeleton className='h-9 w-24' />
                )}
              </div>
              <form.AppForm>
                <form.SubmitButton className='w-full' disabled={isPending}>
                  {isPending ? 'در حال ارسال...' : 'دریافت کد تایید'}
                </form.SubmitButton>
              </form.AppForm>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
