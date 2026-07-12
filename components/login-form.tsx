'use client';

import { useState } from 'react';

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

// * components
import { useAppForm } from './form';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const [isOtpStep, setIsOtpStep] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const router = useRouter();

  const {
    data: captchaData,
    isLoading: captchaLoading,
    refetch: refetchCaptcha,
  } = useQuery(getCaptchaQueryOptions());

  const { mutate: loginUser, isPending } = useLoginByUsername();
  const { mutate: loginByOtp, isPending: isOtpPending } = useLoginByOtp();

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

        loginUser(
          {
            phoneNumber,
            isActive: true,
            X_CaptchaId: captchaData.id,
            X_CaptchaCode: X_CaptchaCode.toString(),
          },
          {
            onSuccess: response => {
              // if (!response.isSuccess) {
              //   refetchCaptcha();
              //   toast.error(response.message);
              //   return;
              // }
              setIsOtpStep(true);
              setPhoneNumber(phoneNumber);
              toast.success(response.message || 'ورود با موفقیت انجام شد');
            },
            onError: error => {},
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

  return (
    <Card className='lg:w-100'>
      <CardHeader>
        <div className='text-center mb-4'>
          <span className='text-2xl font-bold text-brand'>Nikaland</span>
        </div>
        <CardTitle>ورود به حساب کاربری</CardTitle>
        <CardDescription className='mt-2'>
          {isOtpStep
            ? 'برای ورود به حساب کاربری خود کد اعتبار سنجی را وارد نمایید.'
            : 'برای ورود به حساب کاربری خود شماره همراه را وارد نمایید.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          {isOtpStep ? (
            <>
              <form.AppField
                name='otp'
                children={(field: any) => (
                  <field.TextField
                    className='text-center tracking-[1em] text-xl font-semibold'
                    dir='ltr'
                    type='tel'
                    label='کد اعتبار سنجی'
                    inputMode='tel'
                    placeholder='1234'
                    autoComplete='tel'
                    maxLength={4}
                  />
                )}
              />

              <div className='flex flex-col gap-3'>
                <form.AppForm>
                  <form.SubmitButton className='w-full' disabled={isOtpPending}>
                    {isOtpPending ? 'در حال ارسال...' : 'تایید'}
                  </form.SubmitButton>
                </form.AppForm>
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
                        inputMode='tel'
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
                  <form.SubmitButton className='w-full' disabled={isPending}>
                    {isPending ? 'در حال ارسال...' : 'تایید'}
                  </form.SubmitButton>
                </form.AppForm>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
