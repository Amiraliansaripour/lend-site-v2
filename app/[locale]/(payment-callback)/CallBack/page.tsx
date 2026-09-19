'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { INSTALLMENT_PAY_TYPE } from '@/api/wallet';

/** Gateway failure sentinel (also accept legacy misspelling). */
const FAILED_INVOICE_NOS = new Set(['Unknown1', 'Unkhown1']);
/** Validation / credit-check payment (see pay-validation payType: 2). */
const PAY_TYPE_VALIDATION = '2';
/** First installment payment from /recipient (see pay-token payType: 4). */
const PAY_TYPE_INSTALLMENT = String(INSTALLMENT_PAY_TYPE);

const RECIPIENT_RETURN_URL_KEY = 'recipientReturnUrl';
const INSTALLMENT_REDIRECT_SECONDS = 4;

export default function CallBackPage() {
  const searchParams = useSearchParams();
  const InvoiceNo = searchParams.get('InvoiceNo') ?? undefined;
  const PayType = searchParams.get('PayType') ?? undefined;
  const refId = searchParams.get('refId') ?? undefined;
  const refCode = searchParams.get('refCode') ?? undefined;

  const isSuccess =
    InvoiceNo !== undefined && InvoiceNo.length > 0 && !FAILED_INVOICE_NOS.has(InvoiceNo);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [pendingPayType, setPendingPayType] = useState<string | null>(null);
  const [recipientReturnUrl, setRecipientReturnUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(INSTALLMENT_REDIRECT_SECONDS);

  useEffect(() => {
    const storedRequestId = localStorage.getItem('requestId');
    const storedPayType = localStorage.getItem('pendingPayType');
    const storedReturnUrl = localStorage.getItem(RECIPIENT_RETURN_URL_KEY);

    if (storedRequestId) {
      setRequestId(storedRequestId);
    }
    if (storedPayType) {
      setPendingPayType(storedPayType);
    }
    if (storedReturnUrl) {
      setRecipientReturnUrl(storedReturnUrl);
    }

    // Clear one-shot payment context after reading (failed callbacks may omit PayType).
    if (storedPayType === PAY_TYPE_VALIDATION || PayType === PAY_TYPE_VALIDATION) {
      localStorage.removeItem('pendingPayType');
    }
  }, [PayType]);

  const isValidationPayment =
    PayType === PAY_TYPE_VALIDATION || pendingPayType === PAY_TYPE_VALIDATION;
  const isInstallmentPayment =
    PayType === PAY_TYPE_INSTALLMENT || pendingPayType === PAY_TYPE_INSTALLMENT;

  useEffect(() => {
    if (!isInstallmentPayment) return;

    const returnUrl = recipientReturnUrl ?? localStorage.getItem(RECIPIENT_RETURN_URL_KEY);
    if (!returnUrl) return;

    if (countdown <= 0) {
      try {
        const url = new URL(returnUrl, window.location.origin);
        if (InvoiceNo) url.searchParams.set('InvoiceNo', InvoiceNo);
        if (refId) url.searchParams.set('refId', refId);
        if (refCode) url.searchParams.set('refCode', refCode);

        localStorage.removeItem(RECIPIENT_RETURN_URL_KEY);
        localStorage.removeItem('pendingPayType');
        window.location.href = url.toString();
      } catch {
        localStorage.removeItem(RECIPIENT_RETURN_URL_KEY);
        localStorage.removeItem('pendingPayType');
        window.location.href = returnUrl;
      }
      return;
    }

    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [isInstallmentPayment, recipientReturnUrl, countdown, InvoiceNo, refId, refCode]);

  const continueHref = useMemo(() => {
    if (isValidationPayment && requestId) {
      return `/requests/request-credit?id=${requestId}`;
    }
    return '/requests';
  }, [isValidationPayment, requestId]);

  const continueLabel =
    isValidationPayment && requestId
      ? isSuccess
        ? 'ادامه درخواست'
        : 'بازگشت به درخواست'
      : isSuccess
        ? 'ارسال به صفحه درخواست‌های من'
        : 'بازگشت به درخواست‌های من';

  if (isInstallmentPayment) {
    return (
      <div className='flex w-full max-w-md flex-col items-center justify-center gap-6 py-10 text-center'>
        {isSuccess ? (
          <>
            <div className='flex size-20 items-center justify-center rounded-full bg-green-50'>
              <CheckCircle2 className='size-12 text-green-600' />
            </div>
            <div className='space-y-2'>
              <h2 className='text-xl font-semibold text-green-700'>
                پرداخت قسط با موفقیت انجام شد
              </h2>
              <p className='text-sm text-muted-foreground'>
                در حال بازگشت به فروشگاه
                {countdown > 0 ? ` (${countdown})` : '...'}
              </p>
              {InvoiceNo && (
                <p className='text-sm text-muted-foreground'>
                  شماره فاکتور: <span className='font-medium text-foreground'>{InvoiceNo}</span>
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className='flex size-20 items-center justify-center rounded-full bg-red-50'>
              <XCircle className='size-12 text-red-600' />
            </div>
            <div className='space-y-2 max-w-md'>
              <h2 className='text-xl font-semibold text-red-700'>پرداخت قسط ناموفق بود</h2>
              <p className='text-sm text-muted-foreground leading-7'>
                متأسفانه پرداخت شما انجام نشد. در حال بازگشت به فروشگاه
                {countdown > 0 ? ` (${countdown})` : '...'}
              </p>
            </div>
          </>
        )}
        {recipientReturnUrl && (
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Loader2 className='size-4 animate-spin' />
            انتقال خودکار
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='flex w-full max-w-md flex-col items-center justify-center gap-6 py-10 text-center'>
      {isSuccess ? (
        <>
          <div className='flex size-20 items-center justify-center rounded-full bg-green-50'>
            <CheckCircle2 className='size-12 text-green-600' />
          </div>
          <div className='space-y-2'>
            <h2 className='text-xl font-semibold text-green-700'>پرداخت با موفقیت انجام شد</h2>
            <p className='text-sm text-muted-foreground'>
              {isValidationPayment
                ? 'تراکنش شما با موفقیت ثبت شد. برای ادامه فرآیند اعتبارسنجی به صفحه درخواست بازگردید.'
                : 'تراکنش شما با موفقیت ثبت شد. می‌توانید وضعیت درخواست خود را در بخش درخواست‌های من پیگیری کنید.'}
            </p>
            {InvoiceNo && (
              <p className='text-sm text-muted-foreground'>
                شماره فاکتور: <span className='font-medium text-foreground'>{InvoiceNo}</span>
              </p>
            )}
          </div>
          <Button asChild size='lg'>
            <Link href={continueHref}>{continueLabel}</Link>
          </Button>
        </>
      ) : (
        <>
          <div className='flex size-20 items-center justify-center rounded-full bg-red-50'>
            <XCircle className='size-12 text-red-600' />
          </div>
          <div className='space-y-2 max-w-md'>
            <h2 className='text-xl font-semibold text-red-700'>پرداخت ناموفق بود</h2>
            <p className='text-sm text-muted-foreground leading-7'>
              متأسفانه پرداخت شما انجام نشد. مبلغ کسرشده تا 72 ساعت دیگر به حساب شما بازگشت داده
              می‌شود.
            </p>
          </div>
          <Button asChild size='lg' variant='outline'>
            <Link href={continueHref}>{continueLabel}</Link>
          </Button>
        </>
      )}
    </div>
  );
}
