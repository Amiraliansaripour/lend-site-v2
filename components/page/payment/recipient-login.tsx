'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Clock, Loader2 } from 'lucide-react';

import { useAppForm } from '@/components/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { confirmOtp } from '@/api/wallet';

type Props = {
  orderId: string;
  timeLeft: number;
  onLoginSuccess: (userToken: string) => void | Promise<void>;
};

const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

export function RecipientLogin({ orderId, timeLeft, onLoginSuccess }: Props) {
  const [isPending, setIsPending] = useState(false);

  const timerColor =
    timeLeft > 60
      ? 'text-muted-foreground'
      : timeLeft > 30
        ? 'text-yellow-500'
        : 'text-destructive';

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
          await onLoginSuccess(result.userToken);
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
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <CardTitle>تایید هویت</CardTitle>
            <CardDescription>کد تایید ارسال‌شده را وارد کنید</CardDescription>
          </div>
          <div
            className={`shrink-0 flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-mono ${timerColor}`}
            title='زمان باقی‌مانده'
          >
            <Clock className='size-4' />
            <span dir='ltr'>{formatTime(timeLeft)}</span>
          </div>
        </div>
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
