'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Wallet,
  Clock,
  RefreshCw,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getMerchantInfo,
  freezRequest,
  createHasInstallment,
  getHasInstallmentPlans,
  getUserLoan,
  getPayToken,
  createInstallment,
  payInstallment,
  INSTALLMENT_PAY_TYPE,
  type MerchantInfo,
  type ValidWallet,
  type HasInstallmentPlan,
  type PaymentLoanHeader,
  type PaymentLoanDetail,
} from '@/api/wallet';
import { accessToken } from '@/lib/auth/client/cookies';

const RECIPIENT_RETURN_URL_KEY = 'recipientReturnUrl';

type Props = {
  amount: number;
  merchantId: string;
  orderId: string;
  merchantOrderId?: string;
  nationalcode: string;
  userToken: string;
  wallets: ValidWallet[];
  walletsLoading: boolean;
  onReloadWallets: () => Promise<ValidWallet[]>;
  description?: string;
  returnUrl?: string;
  timeLeft: number;
  installmentNumber?: number | null;
  rateValue?: number | null;
  mobile?: string;
  firstName?: string;
  lastName?: string;
};

const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

type Status = 'idle' | 'loading' | 'success' | 'error';
type View = 'payment' | 'select-plan' | 'installment-loading' | 'installment-review';

type WalletSelection = {
  selected: boolean;
  amount: string;
};

const formatAmount = (n: number) => new Intl.NumberFormat('fa-IR').format(n) + ' ریال';

const formatDate = (dateString?: string | null) => {
  if (!dateString || dateString.startsWith('0001-01-01')) return '—';
  return new Intl.DateTimeFormat('fa-IR').format(new Date(dateString));
};

export function AcceptPayment({
  amount,
  merchantId,
  orderId,
  merchantOrderId,
  nationalcode,
  userToken,
  wallets,
  walletsLoading,
  onReloadWallets,
  description,
  returnUrl,
  timeLeft,
  installmentNumber,
  rateValue,
  mobile,
  firstName,
  lastName,
}: Props) {
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);
  const [merchantLoading, setMerchantLoading] = useState(true);
  const [selections, setSelections] = useState<Record<string, WalletSelection>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [view, setView] = useState<View>('payment');
  const [plans, setPlans] = useState<HasInstallmentPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [loan, setLoan] = useState<PaymentLoanHeader | null>(null);
  const [installments, setInstallments] = useState<PaymentLoanDetail[]>([]);

  const needsPlanSelection = installmentNumber == null || Number.isNaN(installmentNumber);

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

  const redirectAfterSuccess = (resolvedOrderId?: number | string) => {
    const redirect = returnUrl
      ? `${returnUrl}?status=success&orderId=${resolvedOrderId ?? orderId}`
      : '/';
    setTimeout(() => {
      window.location.href = redirect;
    }, 2500);
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
        redirectAfterSuccess(result?.orderId ?? orderId);
      } else {
        setStatus('error');
        toast.error(result?.resultMessage ?? result?.message ?? 'خطا در انجام پرداخت');
      }
    } catch {
      setStatus('error');
      toast.error('خطا در انجام پرداخت');
    }
  };

  const loadInstallmentsForOrder = async () => {
    const loans = await getUserLoan(userToken);
    const orderNum = Number(orderId);
    const matched =
      loans.find(l => l.orderId === orderNum) ??
      loans.find(l => l.loanDetails?.some(d => d.orderId === orderNum));

    if (!matched) {
      throw new Error('NO_LOAN');
    }

    const details = (matched.loanDetails ?? [])
      .filter(d => d.orderId == null || d.orderId === orderNum)
      .sort((a, b) => a.loanIndex - b.loanIndex);

    setLoan(matched);
    setInstallments(details);
  };

  const convertToInstallment = async (planId: string | null) => {
    if (!nationalcode) {
      toast.error('کد ملی در اطلاعات پرداخت موجود نیست');
      return;
    }

    setView('installment-loading');
    try {
      const result = await createHasInstallment(
        {
          amount,
          planId,
          nationalcode,
          orderId: Number(orderId),
          isOnline: true,
        },
        userToken,
      );

      if (!result?.isSuccess) {
        toast.error(result?.message ?? 'خطا در تبدیل به اقساط');
        setView(planId ? 'select-plan' : 'payment');
        return;
      }

      await loadInstallmentsForOrder();
      toast.success(result.message ?? 'خرید به اقساط تبدیل شد');
      setView('installment-review');
    } catch (err) {
      if (err instanceof Error && err.message === 'NO_LOAN') {
        toast.error('اقساط این سفارش یافت نشد');
      } else {
        toast.error('خطا در تبدیل به اقساط');
      }
      setView(planId ? 'select-plan' : 'payment');
    }
  };

  const handlePayInInstallments = async () => {
    if (needsPlanSelection) {
      setView('select-plan');
      setPlansLoading(true);
      try {
        const list = await getHasInstallmentPlans(userToken);
        setPlans(list);
        if (list.length === 0) {
          toast.error('طرح اقساطی فعالی یافت نشد');
          setView('payment');
        }
      } catch {
        toast.error('خطا در دریافت لیست طرح‌ها');
        setView('payment');
      } finally {
        setPlansLoading(false);
      }
      return;
    }

    await convertToInstallment(null);
  };

  const handleSelectPlanAndConvert = async () => {
    if (!selectedPlanId) {
      toast.error('لطفاً یک طرح اقساطی انتخاب کنید');
      return;
    }
    await convertToInstallment(selectedPlanId);
  };

  const handleConfirmInstallment = async () => {
    const firstInstallment = installments[0];
    if (!firstInstallment?.id) {
      toast.error('قسط اول یافت نشد');
      return;
    }
    if (!merchantOrderId) {
      toast.error('شناسه فاکتور فروشنده (merchantOrderId) موجود نیست');
      return;
    }

    setStatus('loading');
    try {
      const tokenResult = await getPayToken(
        {
          payType: INSTALLMENT_PAY_TYPE,
          loanDetailId: firstInstallment.id,
          amount: firstInstallment.amount,
        },
        userToken,
      );

      if (!tokenResult?.isSuccess || !tokenResult.data?.access_token) {
        setStatus('error');
        toast.error(tokenResult?.message ?? 'خطا در دریافت توکن پرداخت');
        return;
      }

      const accessTok = tokenResult.data.access_token;
      const totalAmount =
        loan?.totalInstallmentAmount ||
        loan?.amount ||
        installments.reduce((sum, item) => sum + item.amount, 0) ||
        amount;

      const createResult = await createInstallment(
        {
          invoiceId: merchantOrderId,
          currency: 'IRR',
          accessToken: accessTok,
          totalAmount,
          installmentsCount: installments.length,
          customer: {
            nationalCode: nationalcode,
            firstName: firstName ?? '',
            lastName: lastName ?? '',
            mobileNumber: mobile ?? '',
            customerId: nationalcode,
          },
          installments: installments.map(item => ({
            number: item.loanIndex,
            amount: item.amount,
            dueDate: item.dueDate?.slice(0, 10) || item.dueDate,
          })),
        },
        userToken,
      );

      if (!createResult?.isSuccess || !createResult.data?.installmentId) {
        setStatus('error');
        toast.error(createResult?.message ?? 'خطا در ایجاد اقساط پرداخت');
        return;
      }

      const payResult = await payInstallment(
        {
          installmentId: createResult.data.installmentId,
          number: firstInstallment.loanIndex,
          accessToken: accessTok,
        },
        userToken,
      );

      if (!payResult?.isSuccess || !payResult.data?.url) {
        setStatus('error');
        toast.error(payResult?.message ?? 'خطا در شروع پرداخت قسط');
        return;
      }

      if (returnUrl) {
        localStorage.setItem(RECIPIENT_RETURN_URL_KEY, returnUrl);
      }
      localStorage.setItem('pendingPayType', String(INSTALLMENT_PAY_TYPE));
      // Allow /CallBack under dashboard-like auth checks if cookie is required elsewhere.
      accessToken.set(userToken);

      window.location.href = payResult.data.url;
    } catch {
      setStatus('error');
      toast.error('خطا در شروع پرداخت قسط اول');
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
          <Button
            variant='outline'
            onClick={() => {
              setStatus('idle');
              if (installments.length > 0) setView('installment-review');
            }}
          >
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (view === 'installment-loading') {
    return (
      <Card className='w-full max-w-md'>
        <CardContent className='flex flex-col items-center gap-4 py-12'>
          <Loader2 className='size-10 animate-spin text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>در حال تبدیل به اقساط...</p>
        </CardContent>
      </Card>
    );
  }

  if (view === 'select-plan') {
    return (
      <Card className='w-full max-w-md'>
        <CardHeader>
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0'>
              <CardTitle>انتخاب طرح اقساط</CardTitle>
              <CardDescription>طرح مورد نظر خود را انتخاب کنید</CardDescription>
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
          {plansLoading ? (
            <div className='flex flex-col gap-2'>
              <Skeleton className='h-20 w-full' />
              <Skeleton className='h-20 w-full' />
            </div>
          ) : (
            <div className='flex flex-col gap-2 max-h-80 overflow-y-auto'>
              {plans.map(plan => {
                const selected = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type='button'
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`rounded-lg border p-3 text-right transition-colors ${
                      selected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className='flex justify-between gap-2 text-sm font-medium'>
                      <span>{plan.name}</span>
                      <span className='text-muted-foreground shrink-0'>{plan.period} قسط</span>
                    </div>
                    <div className='mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                      <span>نرخ: {plan.percentage}٪</span>
                      <span dir='ltr'>
                        {formatAmount(plan.minAmount)} – {formatAmount(plan.maxAmount)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className='flex flex-col gap-2'>
            <Button
              className='w-full'
              size='lg'
              disabled={!selectedPlanId || plansLoading}
              onClick={() => void handleSelectPlanAndConvert()}
            >
              تبدیل به اقساط
            </Button>
            <Button
              variant='ghost'
              className='w-full'
              onClick={() => {
                setSelectedPlanId(null);
                setView('payment');
              }}
            >
              <ArrowRight className='size-4 me-1' />
              بازگشت
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (view === 'installment-review') {
    return (
      <Card className='w-full max-w-md'>
        <CardHeader>
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0'>
              <CardTitle>اقساط خرید</CardTitle>
              <CardDescription>جزئیات اقساط این سفارش را بررسی کنید</CardDescription>
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
              <span className='font-medium'>{merchant?.name ?? '—'}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>شناسه سفارش</span>
              <span className='font-medium font-mono' dir='ltr'>
                {orderId}
              </span>
            </div>
            {loan?.requestPlanFinancierName && (
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>تامین‌کننده</span>
                <span className='font-medium'>{loan.requestPlanFinancierName}</span>
              </div>
            )}
            {(loan?.requestPlanPeriod || installmentNumber) && (
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>تعداد اقساط</span>
                <span className='font-medium'>{loan?.requestPlanPeriod ?? installmentNumber}</span>
              </div>
            )}
            {rateValue != null && !Number.isNaN(rateValue) && (
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>کارمزد</span>
                <span className='font-medium'>{rateValue}٪</span>
              </div>
            )}
            <div className='flex justify-between border-t pt-3 mt-1'>
              <span className='text-muted-foreground font-semibold'>مبلغ کل</span>
              <span className='font-bold text-base'>
                {formatAmount(loan?.totalInstallmentAmount || loan?.amount || amount)}
              </span>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <CalendarDays className='size-4' />
              جدول اقساط
            </div>
            {installments.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-4'>
                قسطی برای این سفارش یافت نشد
              </p>
            ) : (
              <div className='flex flex-col gap-2 max-h-72 overflow-y-auto'>
                {installments.map((item, index) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-3 flex items-center justify-between gap-3 text-sm ${
                      index === 0 ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className='min-w-0'>
                      <p className='font-medium'>
                        قسط {item.loanIndex}
                        {index === 0 ? (
                          <span className='ms-2 text-xs text-primary font-normal'>
                            (قابل پرداخت اکنون)
                          </span>
                        ) : null}
                      </p>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        سررسید: {formatDate(item.dueDate)}
                      </p>
                    </div>
                    <span className='font-semibold shrink-0'>{formatAmount(item.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            className='w-full'
            size='lg'
            disabled={installments.length === 0 || status === 'loading'}
            onClick={() => void handleConfirmInstallment()}
          >
            {status === 'loading' ? (
              <>
                <Loader2 className='size-4 animate-spin me-2' />
                در حال انتقال به درگاه...
              </>
            ) : (
              'پرداخت قسط اول'
            )}
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
          {mobile && (
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>موبایل</span>
              <span className='font-medium font-mono' dir='ltr'>
                {mobile}
              </span>
            </div>
          )}
          {installmentNumber != null && !Number.isNaN(installmentNumber) && (
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>تعداد اقساط</span>
              <span className='font-medium'>{installmentNumber}</span>
            </div>
          )}
          {rateValue != null && !Number.isNaN(rateValue) && (
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>کارمزد</span>
              <span className='font-medium'>{rateValue}٪</span>
            </div>
          )}
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

        <div className='flex flex-col gap-2'>
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

          <Button
            className='w-full'
            size='lg'
            variant='outline'
            disabled={status === 'loading' || merchantLoading}
            onClick={() => void handlePayInInstallments()}
          >
            پرداخت اقساطی!
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
