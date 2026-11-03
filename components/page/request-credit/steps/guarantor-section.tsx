'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, Inbox, Loader2, RefreshCw } from 'lucide-react';
import { isGuarantorApproved, type Guarantor } from '@/api/guarantor';
import { useRequestGuarantors } from '@/queries/guarantor';
import { GuarantorReviewList } from '@/components/page/guarantor/guarantor-review-list';
import { Link } from '@/i18n/navigation';

interface GuarantorSectionProps {
  requestId: string;
  guarantorCount: number;
  borrowerNationalCode?: string | null;
  isReadOnly?: boolean;
  planNote?: string | null;
}

/**
 * Borrower-side section inside request-credit (ضمانت step):
 * Share national code so others can اعلام ضمانت, then approve/reject incoming applications.
 */
export function GuarantorSection({
  requestId,
  guarantorCount,
  borrowerNationalCode,
  isReadOnly = false,
  planNote,
}: GuarantorSectionProps) {
  const { data: guarantors = [], isLoading, isFetching, refetch } = useRequestGuarantors(requestId);

  const approvedCount = useMemo(() => guarantors.filter(isGuarantorApproved).length, [guarantors]);

  const remaining = Math.max(guarantorCount - approvedCount, 0);

  const handleCopyNationalCode = async () => {
    if (!borrowerNationalCode) {
      toast.error('کد ملی شما در دسترس نیست');
      return;
    }
    try {
      await navigator.clipboard.writeText(borrowerNationalCode);
      toast.success('کد ملی کپی شد — آن را برای ضامن ارسال کنید');
    } catch {
      toast.error('امکان کپی کد ملی وجود ندارد');
    }
  };

  if (guarantorCount <= 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Inbox className='size-5' />
              درخواست‌های ضمانت این درخواست
            </CardTitle>
            <CardDescription className='mt-2 space-y-1'>
              <p>
                این طرح به <strong>{guarantorCount.toLocaleString('fa-IR')}</strong> ضامن تأییدشده
                نیاز دارد.
              </p>
              <p>
                تأیید شده: <strong>{approvedCount.toLocaleString('fa-IR')}</strong>
                {remaining > 0 ? (
                  <>
                    {' '}
                    — باقی‌مانده: <strong>{remaining.toLocaleString('fa-IR')}</strong>
                  </>
                ) : (
                  <span className='text-green-700'> — تکمیل شده</span>
                )}
              </p>
            </CardDescription>
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <RefreshCw className='size-4' />
            )}
            <span className='mr-1'>بروزرسانی</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {planNote ? (
          <div className='rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900'>
            {planNote}
          </div>
        ) : null}

        <div className='rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-3'>
          <p className='font-medium'>چطور ضامن اضافه کنم؟</p>
          <ol className='list-decimal list-inside space-y-1'>
            <li>
              از تب{' '}
              <Link href='/guarantor' className='underline font-medium'>
                ضمانت ← درخواست‌های ضمانت من
              </Link>{' '}
              می‌توانید با وارد کردن کد ملی، ضامن را معرفی/بررسی کنید.
            </li>
            <li>یا کد ملی خود را به ضامن بدهید تا از تب «اعلام ضمانت» ضمانت را اعلام کند.</li>
            <li>سپس درخواست او را اینجا تأیید یا رد کنید.</li>
          </ol>
          {borrowerNationalCode ? (
            <div className='flex flex-wrap items-center gap-2 pt-1'>
              <span>
                کد ملی شما: <strong className='tracking-wider'>{borrowerNationalCode}</strong>
              </span>
              <Button type='button' variant='outline' size='sm' onClick={handleCopyNationalCode}>
                <Copy className='size-3.5 ml-1' />
                کپی
              </Button>
            </div>
          ) : null}
        </div>

        <GuarantorReviewList
          guarantors={guarantors}
          isLoading={isLoading}
          isReadOnly={isReadOnly}
          emptyMessage='هنوز کسی برای این درخواست اعلام ضمانت نکرده است.'
        />
      </CardContent>
    </Card>
  );
}

/** Shared helper for collateral / next-step gating */
export async function ensureRequiredGuarantorsApproved(
  guarantors: Guarantor[],
  guarantorCount: number,
): Promise<boolean> {
  if (guarantorCount <= 0) return true;
  const approved = guarantors.filter(isGuarantorApproved).length;
  if (approved < guarantorCount) {
    toast.error(
      `برای ادامه باید حداقل ${guarantorCount.toLocaleString('fa-IR')} ضامن تأییدشده داشته باشید`,
    );
    return false;
  }
  return true;
}
