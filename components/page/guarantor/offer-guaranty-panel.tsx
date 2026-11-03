'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Search, ShieldPlus, User } from 'lucide-react';
import { getGuarantorRequestedUser, type GuarantorRequestedUser } from '@/api/guarantor';
import { useAcceptGuarantorship } from '@/mutations/guarantor';
import { useQueryClient } from '@tanstack/react-query';
import { guarantorQueryKeys } from '@/queries/guarantor';

function formatAmount(amount?: number | null): string {
  if (amount === undefined || amount === null || !Number.isFinite(Number(amount))) {
    return 'نامشخص';
  }
  return `${Math.round(Number(amount)).toLocaleString('fa-IR')} ریال`;
}

/**
 * Scenario A — اعلام ضمانت (ضامن):
 * 1) GET requested-user/{borrowerNationalCode}
 * 2) POST accept/{borrowerNationalCode}
 */
export function OfferGuarantyPanel({ onAccepted }: { onAccepted?: () => void }) {
  const [nationalCode, setNationalCode] = useState('');
  const [borrower, setBorrower] = useState<GuarantorRequestedUser | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const acceptMutation = useAcceptGuarantorship();
  const queryClient = useQueryClient();

  const handleLookup = async () => {
    const code = nationalCode.trim();
    if (!/^\d{10}$/.test(code)) {
      toast.error('کد ملی باید ۱۰ رقم باشد');
      return;
    }

    setIsLookingUp(true);
    setBorrower(null);
    setSubmitted(false);
    toast.dismiss();

    try {
      const result = await getGuarantorRequestedUser(code);
      if (!result.ok) {
        setBorrower(null);
        toast.error(result.message);
        return;
      }

      setBorrower(result.data);
      toast.success(result.message || 'اطلاعات وام‌گیرنده دریافت شد');
    } catch {
      setBorrower(null);
      toast.error('دریافت اطلاعات وام‌گیرنده با خطا مواجه شد');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleAccept = () => {
    const code = nationalCode.trim();
    if (!/^\d{10}$/.test(code)) {
      toast.error('کد ملی باید ۱۰ رقم باشد');
      return;
    }
    if (!borrower) {
      toast.error('ابتدا اطلاعات وام‌گیرنده را دریافت کنید');
      return;
    }

    toast.dismiss();
    acceptMutation.mutate(code, {
      onSuccess: result => {
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        setSubmitted(true);
        toast.success(result.message || 'ضمانت با موفقیت اعلام شد');
        void queryClient.invalidateQueries({ queryKey: guarantorQueryKeys.all });
        onAccepted?.();
      },
      onError: () => toast.error('خطا در اعلام ضمانت'),
    });
  };

  const handleReset = () => {
    setNationalCode('');
    setBorrower(null);
    setSubmitted(false);
  };

  const borrowerName = [borrower?.firstName, borrower?.lastName].filter(Boolean).join(' ').trim();

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ShieldPlus className='size-5' />
            اعلام ضمانت
          </CardTitle>
          <CardDescription className='space-y-2 pt-1'>
            <p>
              برای اعلام ضمانت وام شخص دیگر، ابتدا کد ملی وام‌گیرنده را وارد و اطلاعات او را دریافت
              کنید؛ سپس ضمانت را اعلام نمایید.
            </p>
            <p className='text-amber-800'>
              پس از اعلام، وام‌گیرنده باید درخواست شما را تأیید کند تا ضمانت قطعی شود.
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='borrower-national-code'>کد ملی وام‌گیرنده</Label>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <Input
                id='borrower-national-code'
                inputMode='numeric'
                maxLength={10}
                value={nationalCode}
                onChange={e => {
                  setNationalCode(e.target.value.replace(/\D/g, '').slice(0, 10));
                  setBorrower(null);
                  setSubmitted(false);
                }}
                placeholder='کد ملی ۱۰ رقمی'
                disabled={acceptMutation.isPending}
              />
              <Button
                type='button'
                variant='outline'
                onClick={() => void handleLookup()}
                disabled={isLookingUp || acceptMutation.isPending}
              >
                {isLookingUp ? (
                  <Loader2 className='size-4 animate-spin ml-1' />
                ) : (
                  <Search className='size-4 ml-1' />
                )}
                دریافت اطلاعات وام‌گیرنده
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {borrower ? (
        <Card>
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <User className='size-4' />
              اطلاعات وام‌گیرنده
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <dl className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-2'>
              <div>
                <dt className='text-muted-foreground'>نام</dt>
                <dd className='font-medium'>{borrowerName || 'نامشخص'}</dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>کد ملی</dt>
                <dd className='font-medium'>{borrower.nationalCode || nationalCode}</dd>
              </div>
              {borrower.phoneNumber ? (
                <div>
                  <dt className='text-muted-foreground'>موبایل</dt>
                  <dd className='font-medium'>{borrower.phoneNumber}</dd>
                </div>
              ) : null}
              {borrower.planName ? (
                <div>
                  <dt className='text-muted-foreground'>طرح</dt>
                  <dd className='font-medium'>{borrower.planName}</dd>
                </div>
              ) : null}
              {borrower.creditAmount != null ? (
                <div>
                  <dt className='text-muted-foreground'>مبلغ اعتبار</dt>
                  <dd className='font-medium'>{formatAmount(borrower.creditAmount)}</dd>
                </div>
              ) : null}
              {borrower.period != null ? (
                <div>
                  <dt className='text-muted-foreground'>تعداد اقساط</dt>
                  <dd className='font-medium'>{Number(borrower.period).toLocaleString('fa-IR')}</dd>
                </div>
              ) : null}
            </dl>

            {submitted ? (
              <div className='rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 space-y-3'>
                <div className='flex items-start gap-2'>
                  <CheckCircle2 className='size-4 mt-0.5 shrink-0' />
                  <p>
                    ضمانت اعلام شد. وام‌گیرنده از تب «درخواست‌های ضمانت من» می‌تواند آن را تأیید یا
                    رد کند.
                  </p>
                </div>
                <Button type='button' variant='outline' size='sm' onClick={handleReset}>
                  اعلام ضمانت جدید
                </Button>
              </div>
            ) : (
              <>
                <div className='rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'>
                  با اعلام ضمانت، درخواست شما برای وام‌گیرنده ارسال می‌شود.
                </div>
                <Button
                  type='button'
                  size='lg'
                  className='w-full sm:w-auto'
                  onClick={handleAccept}
                  disabled={acceptMutation.isPending}
                >
                  {acceptMutation.isPending ? (
                    <Loader2 className='size-4 animate-spin ml-1' />
                  ) : (
                    <ShieldPlus className='size-4 ml-1' />
                  )}
                  اعلام ضمانت
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
