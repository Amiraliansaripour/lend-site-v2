'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';

import { RecipientLogin } from '@/components/page/payment/recipient-login';
import { AcceptPayment } from '@/components/page/payment/accept-payment';
import { getValidWallets, type ValidWallet } from '@/api/wallet';
import { Button } from '@/components/ui/button';

const CUSTOMER_CLUB_URL = 'https://tcclub.ir/app';

const SESSION_SECONDS = 300;

type Step = 'login' | 'payment';

export default function RecipientPage() {
  const params = useSearchParams();

  const amount = Number(params.get('amount') ?? 0);
  const merchantId = params.get('merchantId') ?? '';
  const orderId = params.get('orderId') ?? '';
  const merchantOrderId = params.get('merchantOrderId') ?? '';
  const nationalcode = params.get('nationalcode') ?? '';
  const description = params.get('description') ?? undefined;
  const returnUrl = params.get('returnUrl') ?? undefined;
  const mobile = params.get('mobile') ?? undefined;
  const firstName = params.get('firstName') ?? '';
  const lastName = params.get('lastName') ?? '';
  const installmentNumberParam = params.get('installmentNumber');
  const installmentNumber =
    installmentNumberParam != null && installmentNumberParam !== ''
      ? Number(installmentNumberParam)
      : null;
  const rateValueParam = params.get('rateValue');
  const rateValue = rateValueParam != null && rateValueParam !== '' ? Number(rateValueParam) : null;

  const [step, setStep] = useState<Step>('login');
  const [userToken, setUserToken] = useState('');
  const [wallets, setWallets] = useState<ValidWallet[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(false);
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

  const loadWallets = async (token: string) => {
    if (!orderId || !token) return [];

    if (!nationalcode) {
      toast.error('کد ملی در اطلاعات پرداخت موجود نیست');
      return [];
    }

    setWalletsLoading(true);
    try {
      const list = await getValidWallets(
        {
          orderId: Number(orderId),
          nationalcode,
          isOnline: true,
        },
        token,
      );
      setWallets(list);
      return list;
    } catch {
      toast.error('خطا در دریافت لیست کیف پول‌ها');
      setWallets([]);
      return [];
    } finally {
      setWalletsLoading(false);
    }
  };

  const handleLoginSuccess = async (token: string) => {
    setUserToken(token);
    await loadWallets(token);
    setStep('payment');
  };

  if (!merchantId || !amount || !orderId) {
    return (
      <div className='flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6'>
        <p className='text-muted-foreground text-center'>اطلاعات پرداخت ناقص است.</p>
        <Button asChild variant='outline'>
          <a href={CUSTOMER_CLUB_URL}>
            <ArrowRight className='size-4 me-1' />
            بازگشت به باشگاه مشتریان
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className='flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6'>
      {step === 'login' ? (
        <RecipientLogin orderId={orderId} timeLeft={timeLeft} onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AcceptPayment
          amount={amount}
          merchantId={merchantId}
          orderId={orderId}
          merchantOrderId={merchantOrderId}
          nationalcode={nationalcode}
          userToken={userToken}
          wallets={wallets}
          walletsLoading={walletsLoading}
          onReloadWallets={() => loadWallets(userToken)}
          description={description}
          returnUrl={returnUrl}
          timeLeft={timeLeft}
          mobile={mobile}
          firstName={firstName}
          lastName={lastName}
          installmentNumber={installmentNumber}
          rateValue={rateValue}
        />
      )}
      <Button asChild variant='outline'>
        <a href={CUSTOMER_CLUB_URL}>
          <ArrowRight className='size-4 me-1' />
          بازگشت به باشگاه مشتریان
        </a>
      </Button>
    </div>
  );
}
