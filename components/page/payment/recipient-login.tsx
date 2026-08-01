'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { useAppForm } from '@/components/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { confirmOtp } from '@/api/wallet';

type Props = {
  orderId: string;
  onLoginSuccess: (userToken: string) => void;
};

export function RecipientLogin({ orderId, onLoginSuccess }: Props) {
  const [isPending, setIsPending] = useState(false);

  const form = useAppForm<{ otp: string }>({
    defaultValues: { otp: '' },
    onSubmit: async ({ value }) => {
      const otp = value.otp?.trim();
      if (!otp || otp.length < 4) {
        toast.error('کد تایید را وارد کنید');
        return;
      }
      if (!orderId) {
        toast.error('شناسه سفارش نامعتبر است');
        return;
      }

      setIsPending(true);
      try {
        const result = await confirmOtp({
          otp,
          orderId: Number(orderId),
          inOnline: true,
        });

        if (result?.isAccepted && result.userToken) {
          toast.success('ورود با موفقیت انجام شد');
          onLoginSuccess(result.userToken);
        } else {
          toast.error('کد تایید نامعتبر است');
        }
      } catch {
        toast.error('خطا در تایید کد');
      } finally {
        setIsPending(false);
      }
    },
  });

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle>تایید هویت</CardTitle>
        <CardDescription>کد تایید ارسال‌شده را وارد کنید</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={e => {
            e.preventDefault();
            form.handleSubmit();
          }}
          noValidate
          className='flex flex-col gap-4'
        >
          <form.AppField
            name='otp'
            children={(field: any) => (
              <field.TextField
                className='text-center tracking-[1em] text-xl font-semibold'
                dir='ltr'
                label='کد تایید'
                placeholder='- - - -'
                maxLength={6}
                inputMode='numeric'
                autoComplete='one-time-code'
              />
            )}
          />
          <form.AppForm>
            <form.SubmitButton className='w-full' disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className='size-4 animate-spin me-2' />
                  در حال بررسی...
                </>
              ) : (
                'تایید و ادامه'
              )}
            </form.SubmitButton>
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  );
}
