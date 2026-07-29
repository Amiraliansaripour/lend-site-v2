'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getMerchantInfo, freezRequest, type MerchantInfo } from '@/api/wallet';

type Props = {
  amount: number;
  merchantId: string;
  orderId: string;
  description?: string;
  returnUrl?: string;
};

type Status = 'idle' | 'loading' | 'success' | 'error';

export function AcceptPayment({ amount, merchantId, orderId, description, returnUrl }: Props) {
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);
  const [merchantLoading, setMerchantLoading] = useState(true);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    getMerchantInfo(merchantId)
      .then(info => setMerchant(info))
      .finally(() => setMerchantLoading(false));
  }, [merchantId]);

  const handlePayment = async () => {
    setStatus('loading');
    try {
      const result = await freezRequest({ IsOnline: true, orderId, freezAmount: amount });

      if (result?.resultMessage === 'OK' || result?.isSuccess === true) {
        setStatus('success');
        toast.success('پرداخت با موفقیت انجام شد');
        const redirect = returnUrl ? `${returnUrl}?status=success&orderId=${orderId}` : '/';
        setTimeout(() => {
          window.location.href = redirect;
        }, 2500);
      } else {
        setStatus('error');
        toast.error((result as any)?.message ?? 'خطا در انجام پرداخت');
      }
    } catch {
      setStatus('error');
      toast.error('خطا در انجام پرداخت');
    }
  };

  const formatAmount = (n: number) => new Intl.NumberFormat('fa-IR').format(n) + ' ریال';

  if (status === 'success') {
    return (
      <Card className='w-full max-w-sm text-center'>
        <CardContent className='flex flex-col items-center gap-4 pt-8'>
          <CheckCircle2 className='size-16 text-green-500' />
          <p className='text-lg font-semibold'>پرداخت موفق</p>
          <p className='text-sm text-muted-foreground'>در حال انتقال به صفحه تایید...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className='w-full max-w-sm text-center'>
        <CardContent className='flex flex-col items-center gap-4 pt-8'>
          <XCircle className='size-16 text-destructive' />
          <p className='text-lg font-semibold'>پرداخت ناموفق</p>
          <Button variant='outline' onClick={() => setStatus('idle')}>
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle>تایید پرداخت</CardTitle>
        <CardDescription>{description ?? 'جزئیات پرداخت را بررسی کنید'}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='rounded-lg border p-4 flex flex-col gap-3 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>فروشگاه</span>
            {merchantLoading ? (
              <Skeleton className='h-4 w-24' />
            ) : (
              <span className='font-medium'>{merchant?.name ?? '—'}</span>
            )}
          </div>
          {description && (
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>توضیحات</span>
              <span className='font-medium'>{description}</span>
            </div>
          )}
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>شناسه سفارش</span>
            <span className='font-medium font-mono' dir='ltr'>
              {orderId}
            </span>
          </div>
          <div className='flex justify-between border-t pt-3 mt-1'>
            <span className='text-muted-foreground font-semibold'>مبلغ قابل پرداخت</span>
            <span className='font-bold text-base'>{formatAmount(amount)}</span>
          </div>
        </div>

        <Button
          className='w-full'
          size='lg'
          disabled={status === 'loading' || merchantLoading}
          onClick={handlePayment}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className='size-4 animate-spin me-2' />
              در حال پردازش...
            </>
          ) : (
            'پرداخت'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
