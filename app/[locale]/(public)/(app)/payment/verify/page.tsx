'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
// import Link from 'next/link';

// import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { confirmOrder } from '@/api/wallet';

type Status = 'loading' | 'success' | 'failed' | 'error';

export default function PaymentVerifyPage() {
  const params = useSearchParams();
  const status = params.get('status');
  const orderId = Number(params.get('orderId') ?? 0);

  const [verifyStatus, setVerifyStatus] = useState<Status>('loading');

  useEffect(() => {
    if (status !== 'success' || !orderId) {
      setVerifyStatus('failed');
      return;
    }

    const merchantToken = localStorage.getItem('merchantToken');
    if (!merchantToken) {
      // No merchant token — this might be a direct customer redirect; just show success
      setVerifyStatus('success');
      return;
    }

    confirmOrder({ orderId }, merchantToken)
      .then(result => {
        const ok =
          result?.isSuccess === true ||
          (typeof result?.resultMessage === 'string' &&
            (result.resultMessage === 'Success' ||
              result.resultMessage === 'OK' ||
              result.resultMessage.includes('موفق')));

        if (ok) {
          toast.success(result?.resultMessage ?? 'پرداخت تایید شد');
          setVerifyStatus('success');
        } else {
          toast.error(result?.resultMessage ?? result?.message ?? 'خطا در تایید پرداخت');
          setVerifyStatus('error');
        }
      })
      .catch(() => {
        toast.error('خطا در ارتباط با سرور');
        setVerifyStatus('error');
      });
  }, [status, orderId]);

  return (
    <div className='flex min-h-[70vh] items-center justify-center p-6'>
      <Card className='w-full max-w-sm text-center'>
        <CardContent className='flex flex-col items-center gap-5 pt-10 pb-8'>
          {verifyStatus === 'loading' && (
            <>
              <Loader2 className='size-16 animate-spin text-muted-foreground' />
              <p className='text-muted-foreground'>در حال تایید پرداخت...</p>
            </>
          )}

          {verifyStatus === 'success' && (
            <>
              <CheckCircle2 className='size-16 text-green-500' />
              <div className='flex flex-col gap-1'>
                <p className='text-lg font-semibold'>پرداخت با موفقیت انجام شد</p>
                {orderId ? (
                  <p className='text-sm text-muted-foreground'>
                    شناسه سفارش:{' '}
                    <span dir='ltr' className='font-mono'>
                      {orderId}
                    </span>
                  </p>
                ) : null}
              </div>
              {/* <Button asChild variant='outline'>
                <Link href='/merchant-test'>بازگشت به پنل فروشنده</Link>
              </Button> */}
            </>
          )}

          {(verifyStatus === 'failed' || verifyStatus === 'error') && (
            <>
              <XCircle className='size-16 text-destructive' />
              <div className='flex flex-col gap-1'>
                <p className='text-lg font-semibold'>پرداخت ناموفق</p>
                <p className='text-sm text-muted-foreground'>
                  {verifyStatus === 'failed' ? 'اطلاعات پرداخت نادرست است' : 'خطا در تایید پرداخت'}
                </p>
              </div>
              {/* <Button asChild variant='outline'>
                <Link href='/merchant-test'>بازگشت به پنل فروشنده</Link>
              </Button> */}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
