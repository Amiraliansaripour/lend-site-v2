'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  CircleDashed,
  CreditCard,
  LoaderCircle,
  MessagesSquare,
  Minus,
  PackageCheck,
  Plus,
  ShoppingBasket,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type UserFlowStep = 'idle' | 'submitted' | 'under-review' | 'approved' | 'rejected';

type CartItem = {
  id: string;
  title: string;
  sku: string;
  brand: string;
  price: number;
  qty: number;
  image: string;
};

const SHIPPING_FEE = 1_450_000;
const SERVICE_FEE = 970_000;

const INITIAL_ITEMS: CartItem[] = [
  {
    id: 'i1',
    title: 'تلویزیون هوشمند ۵۵ اینچ UHD',
    sku: 'TV-55-UHD',
    brand: 'ParsVision',
    price: 148_000_000,
    qty: 1,
    image: '/images/folderIcon.png',
  },
  {
    id: 'i2',
    title: 'ماشین لباسشویی ۹ کیلویی',
    sku: 'WM-9KG-PLUS',
    brand: 'Ariana',
    price: 96_000_000,
    qty: 1,
    image: '/images/folderIcon.png',
  },
];

const TIMELINE_STEPS = [
  { key: 'submit', label: 'ثبت درخواست', description: 'تکمیل سبد و ارسال درخواست خرید اعتباری' },
  { key: 'review', label: 'بررسی فروشگاه', description: 'بررسی سبد خرید توسط فروشگاه' },
  { key: 'admin', label: 'بررسی نهایی', description: 'تایید درخواست و تعیین شرایط اعتبار' },
  { key: 'done', label: 'ادامه فرآیند', description: 'انتخاب طرح و تکمیل درخواست اعتبار' },
] as const;

function toToman(value: number) {
  return value.toLocaleString('fa-IR');
}

function UserStatusBadge({ step }: { step: UserFlowStep }) {
  if (step === 'approved') {
    return (
      <Badge className='bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'>
        <CheckCircle2 className='size-3.5' />
        تایید شد
      </Badge>
    );
  }
  if (step === 'rejected') {
    return (
      <Badge className='bg-rose-100 text-rose-700 border border-rose-300 hover:bg-rose-100'>
        <XCircle className='size-3.5' />
        رد شد
      </Badge>
    );
  }
  if (step === 'idle') {
    return (
      <Badge variant='outline'>
        <CircleDashed className='size-3.5' />
        ثبت نشده
      </Badge>
    );
  }
  return (
    <Badge className='bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-100'>
      <LoaderCircle className='size-3.5 animate-spin' />
      در حال بررسی
    </Badge>
  );
}

function timelineStepState(
  stepKey: (typeof TIMELINE_STEPS)[number]['key'],
  flow: UserFlowStep,
): 'done' | 'active' | 'pending' {
  const order = ['submit', 'review', 'admin', 'done'] as const;
  const flowIndex =
    flow === 'idle'
      ? -1
      : flow === 'submitted'
        ? 0
        : flow === 'under-review'
          ? 1
          : flow === 'approved' || flow === 'rejected'
            ? 3
            : 0;
  const stepIndex = order.indexOf(stepKey);

  if (flow === 'rejected' && stepKey === 'done') return 'pending';
  if (stepIndex < flowIndex) return 'done';
  if (stepIndex === flowIndex || (flow === 'under-review' && stepKey === 'review')) return 'active';
  if (flow === 'approved' && stepIndex <= 3) return 'done';
  return 'pending';
}

export function CartWorkflowPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
  const [flow, setFlow] = useState<UserFlowStep>('idle');
  const [rejectionReason, setRejectionReason] = useState('');

  const itemsTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );
  const grandTotal = itemsTotal + SHIPPING_FEE + SERVICE_FEE;
  const prepay = Math.round(grandTotal * 0.35);
  const monthlyInstallment = Math.round((grandTotal - prepay) / 12);

  const hasActiveRequest = flow !== 'idle';
  const canCancelRequest = flow === 'submitted' || flow === 'under-review';

  const changeQty = (id: string, delta: 1 | -1) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, qty: Math.max(1, Math.min(5, item.qty + delta)) } : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const submitCreditRequest = () => {
    if (!items.length) {
      toast.error('سبد خرید شما خالی است.');
      return;
    }
    setFlow('submitted');
    setRejectionReason('');
    toast.success('درخواست خرید اعتباری ثبت شد.');
  };

  const submitCashOrder = () => {
    if (!items.length) {
      toast.error('سبد خرید شما خالی است.');
      return;
    }
    toast.success('سفارش نقدی با موفقیت ثبت شد.');
  };

  const cancelRequest = () => {
    setFlow('idle');
    setRejectionReason('');
    toast.message('درخواست خرید اعتباری لغو شد.');
  };

  const progressPercent = useMemo(() => {
    if (flow === 'idle') return 0;
    if (flow === 'submitted') return 25;
    if (flow === 'under-review') return 55;
    if (flow === 'approved') return 100;
    if (flow === 'rejected') return 100;
    return 0;
  }, [flow]);

  const statusMessage = useMemo(() => {
    switch (flow) {
      case 'idle':
        return 'درخواستی برای خرید اعتباری ثبت نشده است.';
      case 'submitted':
        return 'درخواست شما ثبت شد و برای بررسی به فروشگاه ارسال شده است.';
      case 'under-review':
        return 'درخواست شما در حال بررسی است. پس از تعیین نتیجه، از طریق صندوق پیام مطلع می‌شوید.';
      case 'approved':
        return 'درخواست شما تایید شد. می‌توانید وارد مرحله انتخاب طرح و ثبت نهایی شوید.';
      case 'rejected':
        return rejectionReason || 'درخواست شما رد شد. جزئیات در صندوق پیام قابل مشاهده است.';
    }
  }, [flow, rejectionReason]);

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]'>
        <Card className='overflow-hidden'>
          <CardHeader className='border-b pb-4'>
            <div className='flex items-center justify-between gap-2'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <ShoppingBasket className='size-5 text-primary' />
                سبد خرید
              </CardTitle>
              <Badge variant='outline' className='text-xs'>
                {items.length.toLocaleString('fa-IR')} کالا
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            {items.length === 0 ? (
              <div className='py-14 text-center space-y-2'>
                <ShoppingBasket className='size-10 text-muted-foreground/40 mx-auto' />
                <p className='font-medium'>سبد خرید خالی است</p>
                <p className='text-sm text-muted-foreground'>برای ادامه، کالا به سبد اضافه کنید.</p>
              </div>
            ) : (
              <div className='divide-y'>
                {items.map(item => (
                  <div
                    key={item.id}
                    className='p-4 flex items-center gap-3 transition-colors hover:bg-muted/30'
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className='size-16 rounded-xl border bg-muted/20 object-cover shrink-0'
                    />
                    <div className='min-w-0 flex-1 space-y-1'>
                      <p className='font-semibold truncate'>{item.title}</p>
                      <p className='text-xs text-muted-foreground'>
                        {item.brand} • {item.sku}
                      </p>
                      <p className='text-sm font-medium text-primary'>{toToman(item.price)} ریال</p>
                    </div>
                    <div className='flex items-center gap-1 rounded-lg border bg-background p-1'>
                      <button
                        type='button'
                        onClick={() => changeQty(item.id, -1)}
                        disabled={hasActiveRequest}
                        className='size-7 grid place-items-center rounded-md hover:bg-muted transition-colors disabled:opacity-40'
                      >
                        <Minus className='size-3.5' />
                      </button>
                      <span className='w-7 text-center text-sm font-bold'>
                        {item.qty.toLocaleString('fa-IR')}
                      </span>
                      <button
                        type='button'
                        onClick={() => changeQty(item.id, 1)}
                        disabled={hasActiveRequest}
                        className='size-7 grid place-items-center rounded-md hover:bg-muted transition-colors disabled:opacity-40'
                      >
                        <Plus className='size-3.5' />
                      </button>
                    </div>
                    <button
                      type='button'
                      onClick={() => removeItem(item.id)}
                      disabled={hasActiveRequest}
                      className='size-8 grid place-items-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-40'
                    >
                      <Trash2 className='size-4' />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='h-fit sticky top-5'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>خلاصه سفارش</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>مبلغ کالاها</span>
              <span className='font-medium'>{toToman(itemsTotal)} ریال</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>هزینه ارسال</span>
              <span className='font-medium'>{toToman(SHIPPING_FEE)} ریال</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>کارمزد خدمات</span>
              <span className='font-medium'>{toToman(SERVICE_FEE)} ریال</span>
            </div>
            <div className='h-px bg-border my-2' />
            <div className='flex items-center justify-between text-base font-bold'>
              <span>جمع کل</span>
              <span>{toToman(grandTotal)} ریال</span>
            </div>

            <div className='rounded-xl bg-primary/5 border border-primary/20 p-3 mt-3'>
              <p className='text-xs text-muted-foreground mb-2'>برآورد خرید اعتباری</p>
              <div className='flex items-center justify-between text-sm'>
                <span>پیش‌پرداخت</span>
                <span className='font-semibold'>{toToman(prepay)} ریال</span>
              </div>
              <div className='flex items-center justify-between text-sm mt-1'>
                <span>قسط ماهانه ۱۲ ماهه</span>
                <span className='font-semibold'>{toToman(monthlyInstallment)} ریال</span>
              </div>
            </div>

            <div className='grid gap-2 mt-4'>
              <Button
                type='button'
                className='w-full'
                onClick={submitCashOrder}
                disabled={!items.length || hasActiveRequest}
              >
                <CreditCard className='size-4 ml-1' />
                ثبت سفارش نقدی
              </Button>
              <Button
                type='button'
                variant='outline'
                className='w-full'
                onClick={submitCreditRequest}
                disabled={!items.length || hasActiveRequest}
              >
                <Sparkles className='size-4 ml-1 text-primary' />
                درخواست خرید اعتباری
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='overflow-hidden'>
        <CardHeader className='border-b pb-4'>
          <CardTitle className='text-base'>وضعیت درخواست خرید اعتباری</CardTitle>
        </CardHeader>
        <CardContent className='p-4 space-y-5'>
          <div className='rounded-full h-2 bg-muted overflow-hidden'>
            <div
              className={cn(
                'h-full transition-all duration-500 ease-out',
                flow === 'rejected' ? 'bg-rose-500' : 'bg-primary',
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]'>
            <div className='rounded-xl border p-4 space-y-3'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2 font-medium'>
                  <PackageCheck className='size-4 text-primary' />
                  وضعیت جاری
                </div>
                <UserStatusBadge step={flow} />
              </div>

              <div
                className={cn(
                  'rounded-lg border p-3 text-sm leading-6 transition-all duration-300',
                  flow === 'approved'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : flow === 'rejected'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-muted/40 border-border text-muted-foreground',
                )}
              >
                {statusMessage}
              </div>

              {canCancelRequest && (
                <Button size='sm' variant='outline' onClick={cancelRequest}>
                  لغو درخواست
                </Button>
              )}

              {flow === 'approved' && (
                <Button size='sm' asChild>
                  <Link href='/requests/request-credit'>ادامه و ثبت درخواست اعتبار</Link>
                </Button>
              )}

              {flow === 'rejected' && (
                <Button size='sm' variant='outline' asChild>
                  <Link href='/messages'>
                    <MessagesSquare className='size-4 ml-1' />
                    مشاهده پیام‌ها
                  </Link>
                </Button>
              )}
            </div>

            <div className='rounded-xl border p-4 space-y-3 bg-muted/20'>
              <p className='text-sm font-medium'>مراحل پیگیری</p>
              <div className='space-y-3'>
                {TIMELINE_STEPS.map(step => {
                  const state = timelineStepState(step.key, flow);
                  return (
                    <div key={step.key} className='flex items-start gap-2.5'>
                      <div
                        className={cn(
                          'mt-0.5 size-5 rounded-full grid place-items-center shrink-0',
                          state === 'done' && 'bg-emerald-500 text-white',
                          state === 'active' && 'bg-primary text-primary-foreground',
                          state === 'pending' && 'bg-muted border border-border',
                        )}
                      >
                        {state === 'done' ? (
                          <CheckCircle2 className='size-3' />
                        ) : state === 'active' ? (
                          <LoaderCircle className='size-3 animate-spin' />
                        ) : (
                          <span className='size-1.5 rounded-full bg-muted-foreground/40' />
                        )}
                      </div>
                      <div className='min-w-0'>
                        <p
                          className={cn(
                            'text-xs font-medium',
                            state === 'pending' && 'text-muted-foreground',
                          )}
                        >
                          {step.label}
                        </p>
                        <p className='text-[11px] text-muted-foreground leading-5'>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
