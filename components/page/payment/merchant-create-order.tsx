'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Copy, ExternalLink, LogOut } from 'lucide-react';

import { useAppForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrderId } from '@/api/wallet';

type Props = {
  merchantToken: string;
  onLogout: () => void;
};

export function MerchantCreateOrder({ merchantToken, onLogout }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  const form = useAppForm<{ nationalcode: string; amount: string }>({
    defaultValues: { nationalcode: '', amount: '' },
    onSubmit: async ({ value }) => {
      setIsPending(true);
      try {
        const result = await getOrderId(
          {
            nationalcode: value.nationalcode,
            amount: Number(value.amount),
            isOnline: true,
          },
          merchantToken,
        );

        if (result?.isSuccess && result.data) {
          const merchantId = result.data.id || result.data.merchantId;
          const { orderId } = result.data;
          if (!merchantId || !orderId) {
            toast.error('پاسخ سفارش ناقص است');
            return;
          }
          const origin = window.location.origin;
          const link = `${origin}/recipient?amount=${value.amount}&merchantId=${merchantId}&orderId=${orderId}&nationalcode=${value.nationalcode}&description=خریدکالا&returnUrl=${origin}/payment/verify`;
          setPaymentLink(link);
          toast.success('لینک پرداخت ایجاد شد');
        } else {
          toast.error(result?.message ?? 'خطا در ایجاد سفارش');
        }
      } finally {
        setIsPending(false);
      }
    },
  });

  const copyLink = () => {
    if (!paymentLink) return;
    navigator.clipboard.writeText(paymentLink);
    toast.success('لینک کپی شد');
  };

  const handleLogout = () => {
    localStorage.removeItem('merchantToken');
    onLogout();
  };

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>ایجاد سفارش</CardTitle>
          <Button variant='ghost' size='sm' onClick={handleLogout}>
            <LogOut className='size-4 me-1' />
            خروج
          </Button>
        </div>
        <CardDescription>اطلاعات خریدار و مبلغ را وارد کنید</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={e => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='flex flex-col gap-4'
        >
          <form.AppField
            name='nationalcode'
            children={(field: any) => (
              <field.TextField
                label='کد ملی خریدار'
                placeholder='1234567890'
                dir='ltr'
                inputMode='numeric'
                maxLength={10}
              />
            )}
          />

          <form.AppField
            name='amount'
            children={(field: any) => <field.NumField label='مبلغ (ریال)' placeholder='5000000' />}
          />

          <form.AppForm>
            <form.SubmitButton className='w-full' disabled={isPending}>
              {isPending ? <Loader2 className='size-4 animate-spin' /> : 'ایجاد لینک پرداخت'}
            </form.SubmitButton>
          </form.AppForm>
        </form>

        {paymentLink && (
          <div className='mt-6 flex flex-col gap-3'>
            <p className='text-sm font-medium'>لینک پرداخت:</p>
            <div className='rounded-md bg-muted p-3 text-xs break-all text-muted-foreground'>
              {paymentLink}
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' className='flex-1' onClick={copyLink}>
                <Copy className='size-4 me-1' />
                کپی
              </Button>
              <Button variant='outline' size='sm' className='flex-1' asChild>
                <a href={paymentLink} target='_blank' rel='noreferrer'>
                  <ExternalLink className='size-4 me-1' />
                  باز کردن
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
