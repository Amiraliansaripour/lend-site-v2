'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';

import { RecipientLogin } from '@/components/page/payment/recipient-login';
import { AcceptPayment } from '@/components/page/payment/accept-payment';

const SESSION_SECONDS = 300;

type Step = 'login' | 'payment';

export default function RecipientPage() {
  const params = useSearchParams();

  const amount = Number(params.get('amount') ?? 0);
  const merchantId = params.get('merchantId') ?? '';
  const orderId = params.get('orderId') ?? '';
  const nationalcode = params.get('nationalcode') ?? '';
  const description = params.get('description') ?? undefined;
  const returnUrl = params.get('returnUrl') ?? undefined;

  const [step, setStep] = useState<Step>('login');
  const [userToken, setUserToken] = useState('');
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS);
  const [hasWarnedTimeout, setHasWarnedTimeout] = useState(false);

  // Session countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      toast.error('زمان پرداخت به پایان رسید. در حال انتقال...');
      setTimeout(() => {
        window.location.href = returnUrl ? `${returnUrl}?status=timeout` : '/';
      }, 3000);
      return;
    }

    if (timeLeft === 60 && !hasWarnedTimeout) {
      toast.warning('یک دقیقه تا پایان زمان پرداخت باقی مانده است');
      setHasWarnedTimeout(true);
    }

    const id = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, hasWarnedTimeout, returnUrl]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const timerColor =
    timeLeft > 60
      ? 'text-muted-foreground'
      : timeLeft > 30
        ? 'text-yellow-500'
        : 'text-destructive';

  if (!merchantId || !amount || !orderId) {
    return (
      <div className='flex min-h-[70vh] items-center justify-center'>
        <p className='text-muted-foreground text-center'>اطلاعات پرداخت ناقص است.</p>
      </div>
    );
  }

  return (
    <div className='relative flex min-h-[70vh] items-center justify-center p-6'>
      {/* Session timer */}
      <div
        className={`fixed top-4 end-4 flex items-center gap-1.5 text-sm font-mono ${timerColor}`}
      >
        <Clock className='size-4' />
        <span dir='ltr'>{formatTime(timeLeft)}</span>
      </div>

      {step === 'login' ? (
        <RecipientLogin
          orderId={orderId}
          onLoginSuccess={token => {
            setUserToken(token);
            setStep('payment');
          }}
        />
      ) : (
        <AcceptPayment
          amount={amount}
          merchantId={merchantId}
          orderId={orderId}
          nationalcode={nationalcode}
          userToken={userToken}
          description={description}
          returnUrl={returnUrl}
        />
      )}
    </div>
  );
}
