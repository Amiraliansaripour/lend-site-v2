'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, Wallet, Clock, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getMerchantInfo, freezRequest, type MerchantInfo, type ValidWallet } from '@/api/wallet';

type Props = {
  amount: number;
  merchantId: string;
  orderId: string;
  userToken: string;
  wallets: ValidWallet[];
  walletsLoading: boolean;
  onReloadWallets: () => Promise<ValidWallet[]>;
  description?: string;
  returnUrl?: string;
  timeLeft: number;
};

const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

type Status = 'idle' | 'loading' | 'success' | 'error';

type WalletSelection = {
  selected: boolean;
  amount: string;
};

const formatAmount = (n: number) => new Intl.NumberFormat('fa-IR').format(n) + ' ریال';

export function AcceptPayment({
  amount,
  merchantId,
  orderId,
  userToken,
  wallets,
  walletsLoading,
  onReloadWallets,
  description,
  returnUrl,
  timeLeft,
}: Props) {
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);
  const [merchantLoading, setMerchantLoading] = useState(true);
  const [selections, setSelections] = useState<Record<string, WalletSelection>>({});
  const [status, setStatus] = useState<Status>('idle');

  const timerColor =
    timeLeft > 60
      ? 'text-muted-foreground'
      : timeLeft > 30
        ? 'text-yellow-500'
        : 'text-destructive';

  useEffect(() => {
    getMerchantInfo(merchantId)
      .then(info => setMerchant(info))
      .finally(() => setMerchantLoading(false));
  }, [merchantId]);

  useEffect(() => {
    setSelections(prev => {
      const next: Record<string, WalletSelection> = {};
      for (const w of wallets) {
        next[w.id] = prev[w.id] ?? { selected: false, amount: '' };
      }
      return next;
    });
  }, [wallets]);

  const allocatedTotal = useMemo(
    () =>
      Object.entries(selections).reduce((sum, [, sel]) => {
        if (!sel.selected) return sum;
        return sum + (Number(sel.amount) || 0);
      }, 0),
    [selections],
  );

  const remaining = amount - allocatedTotal;
  const canPay =
    allocatedTotal === amount &&
    Object.values(selections).some(s => s.selected && Number(s.amount) > 0);

  const toggleWallet = (wallet: ValidWallet, checked: boolean) => {
    setSelections(prev => {
      const next = { ...prev };
      if (!checked) {
        next[wallet.id] = { selected: false, amount: '' };
        return next;
      }

      const alreadyAllocated = Object.entries(prev).reduce((sum, [id, sel]) => {
        if (id === wallet.id || !sel.selected) return sum;
        return sum + (Number(sel.amount) || 0);
      }, 0);
      const needed = Math.max(0, amount - alreadyAllocated);
      const suggested = Math.min(needed, wallet.remain);

      next[wallet.id] = {
        selected: true,
        amount: suggested > 0 ? String(suggested) : '',
      };
      return next;
    });
  };

  const setWalletAmount = (wallet: ValidWallet, value: string) => {
    const cleaned = value.replace(/[^\d]/g, '');
    const num = Number(cleaned);
    if (cleaned && num > wallet.remain) {
      toast.error(`مبلغ نمی‌تواند بیشتر از موجودی (${formatAmount(wallet.remain)}) باشد`);
      return;
    }
    setSelections(prev => ({
      ...prev,
      [wallet.id]: { ...prev[wallet.id], selected: true, amount: cleaned },
    }));
  };

  const handlePayment = async () => {
    if (!canPay) {
      toast.error(
        remaining > 0
          ? `هنوز ${formatAmount(remaining)} باقی مانده است`
          : `مبلغ تخصیص‌یافته بیشتر از مبلغ پرداخت است`,
      );
      return;
    }

    const walletList = wallets
      .filter(w => selections[w.id]?.selected && Number(selections[w.id].amount) > 0)
      .map(w => ({
        id: w.id,
        walletType: w.walletType,
        amount: Number(selections[w.id].amount),
      }));

    setStatus('loading');
    try {
      const result = await freezRequest(
        {
          orderId: Number(orderId),
          freezAmount: amount,
          walletList,
        },
        userToken,
      );

      const ok =
        result?.success === 1 ||
        result?.isSuccess === true ||
        (typeof result?.resultMessage === 'string' &&
          (result.resultMessage === 'OK' || result.resultMessage.includes('موفق')));

      if (ok) {
        setStatus('success');
        toast.success(result?.resultMessage ?? 'پرداخت با موفقیت انجام شد');
        const redirect = returnUrl
          ? `${returnUrl}?status=success&orderId=${result?.orderId ?? orderId}`
          : '/';
        setTimeout(() => {
          window.location.href = redirect;
        }, 2500);
      } else {
        setStatus('error');
        toast.error(result?.resultMessage ?? result?.message ?? 'خطا در انجام پرداخت');
      }
    } catch {
      setStatus('error');
      toast.error('خطا در انجام پرداخت');
    }
  };

  if (status === 'success') {
    return (
      <Card className='w-full max-w-md text-center'>
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
      <Card className='w-full max-w-md text-center'>
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
    <Card className='w-full max-w-md'>
      <CardHeader>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <CardTitle>تایید پرداخت</CardTitle>
            <CardDescription>
              {description ?? 'کیف پول‌ها را انتخاب و مبلغ را تخصیص دهید'}
            </CardDescription>
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

        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <Wallet className='size-4' />
              انتخاب کیف پول
            </div>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              disabled={walletsLoading}
              onClick={() => void onReloadWallets()}
            >
              <RefreshCw className={`size-3.5 me-1 ${walletsLoading ? 'animate-spin' : ''}`} />
              دریافت کیف پول‌ها
            </Button>
          </div>

          {walletsLoading ? (
            <div className='flex flex-col gap-2'>
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
            </div>
          ) : wallets.length === 0 ? (
            <div className='flex flex-col items-center gap-3 py-4'>
              <p className='text-sm text-muted-foreground text-center'>کیف پول معتبری یافت نشد</p>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => void onReloadWallets()}
              >
                دریافت مجدد لیست کیف پول
              </Button>
            </div>
          ) : (
            <div className='flex flex-col gap-2 max-h-72 overflow-y-auto'>
              {wallets.map(wallet => {
                const sel = selections[wallet.id] ?? { selected: false, amount: '' };
                return (
                  <div
                    key={wallet.id}
                    className={`rounded-lg border p-3 flex flex-col gap-2 transition-colors ${
                      sel.selected ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <label className='flex items-start gap-3 cursor-pointer'>
                      <Checkbox
                        checked={sel.selected}
                        onCheckedChange={checked => toggleWallet(wallet, checked === true)}
                        className='mt-0.5'
                      />
                      <div className='flex-1 min-w-0'>
                        <div className='flex justify-between gap-2 text-sm'>
                          <span className='font-medium'>
                            {wallet.walletTypeDescription || 'کیف پول'}
                          </span>
                          <span className='text-muted-foreground shrink-0'>
                            موجودی: {formatAmount(wallet.remain)}
                          </span>
                        </div>
                        <p
                          className='text-xs text-muted-foreground font-mono truncate mt-0.5'
                          dir='ltr'
                        >
                          {/* {wallet.id} */}
                        </p>
                      </div>
                    </label>

                    {sel.selected && (
                      <Input
                        dir='ltr'
                        inputMode='numeric'
                        placeholder='مبلغ از این کیف پول'
                        value={sel.amount}
                        onChange={e => setWalletAmount(wallet, e.target.value)}
                        className='h-9'
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!walletsLoading && wallets.length > 0 && (
            <div className='flex justify-between text-sm pt-1'>
              <span className='text-muted-foreground'>تخصیص‌یافته</span>
              <span className={remaining === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                {formatAmount(allocatedTotal)}
                {remaining !== 0 && (
                  <span className={remaining > 0 ? ' text-muted-foreground' : ' text-destructive'}>
                    {' '}
                    (
                    {remaining > 0
                      ? `${formatAmount(remaining)} باقی‌مانده`
                      : `${formatAmount(Math.abs(remaining))} بیشتر`}
                    )
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        <Button
          className='w-full'
          size='lg'
          disabled={status === 'loading' || merchantLoading || walletsLoading || !canPay}
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
