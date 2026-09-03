'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs, PageContainer } from '@/components/page-container';
import { PageContent } from '@/components/page-content';

const FAILED_INVOICE_NO = 'Unkhown1';
/** Validation / credit-check payment (see pay-validation payType: 2). */
const PAY_TYPE_VALIDATION = '2';

const breadcrumbs: Breadcrumbs = [{ label: 'نتیجه پرداخت', href: '/CallBack' }];

export default function CallBackPage() {
  const searchParams = useSearchParams();
  const InvoiceNo = searchParams.get('InvoiceNo') ?? undefined;
  const PayType = searchParams.get('PayType') ?? undefined;

  const isSuccess = Boolean(InvoiceNo) && InvoiceNo !== FAILED_INVOICE_NO;
  const [requestId, setRequestId] = useState<string | null>(null);
  const [pendingPayType, setPendingPayType] = useState<string | null>(null);

  useEffect(() => {
    const storedRequestId = localStorage.getItem('requestId');
    const storedPayType = localStorage.getItem('pendingPayType');

    if (storedRequestId) {
      setRequestId(storedRequestId);
    }
    if (storedPayType) {
      setPendingPayType(storedPayType);
    }

    // Clear one-shot payment context after reading (failed callbacks may omit PayType).
    if (storedPayType === PAY_TYPE_VALIDATION || PayType === PAY_TYPE_VALIDATION) {
      localStorage.removeItem('pendingPayType');
    }
  }, [PayType]);

  const isValidationPayment =
    PayType === PAY_TYPE_VALIDATION || pendingPayType === PAY_TYPE_VALIDATION;
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

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <PageContent title='نتیجه پرداخت'>
        <div className='flex flex-col items-center justify-center gap-6 py-10 text-center'>
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
      </PageContent>
    </PageContainer>
  );
}
