import { CheckCircle2, XCircle } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs, PageContainer } from '@/components/page-container';
import { PageContent } from '@/components/page-content';

const FAILED_INVOICE_NO = 'Unkhown1';

const breadcrumbs: Breadcrumbs = [{ label: 'نتیجه پرداخت', href: '/CallBack' }];

type CallBackSearchParams = {
  InvoiceNo?: string;
  tid?: string;
  PayType?: string;
};

export default async function CallBackPage({
  searchParams,
}: {
  searchParams: Promise<CallBackSearchParams>;
}) {
  const { InvoiceNo } = await searchParams;
  const isSuccess = Boolean(InvoiceNo) && InvoiceNo !== FAILED_INVOICE_NO;

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
                  تراکنش شما با موفقیت ثبت شد. می‌توانید وضعیت درخواست خود را در بخش درخواست‌های من
                  پیگیری کنید.
                </p>
                {InvoiceNo && (
                  <p className='text-sm text-muted-foreground'>
                    شماره فاکتور: <span className='font-medium text-foreground'>{InvoiceNo}</span>
                  </p>
                )}
              </div>
              <Button asChild size='lg'>
                <Link href='/requests'>ارسال به صفحه درخواست‌های من</Link>
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
                  متأسفانه پرداخت شما انجام نشد. مبلغ کسرشده تا ۷۳ ساعت دیگر به حساب شما بازگشت داده
                  می‌شود.
                </p>
              </div>
              <Button asChild size='lg' variant='outline'>
                <Link href='/requests'>بازگشت به درخواست‌های من</Link>
              </Button>
            </>
          )}
        </div>
      </PageContent>
    </PageContainer>
  );
}
