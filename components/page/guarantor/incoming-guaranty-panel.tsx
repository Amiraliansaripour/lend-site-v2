'use client';

import { useMemo, useState } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Inbox, FileText, Search, UserPlus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getUserId } from '@/lib/auth/client/user-info';
import {
  getRequestGuarantors,
  isGuarantorPendingReview,
  lookupGuarantorByNationalCode,
  type Guarantor,
} from '@/api/guarantor';
import { useUserRequests } from '@/queries/request';
import { guarantorQueryKeys } from '@/queries/guarantor';
import { GuarantorReviewList } from './guarantor-review-list';
import { REQUEST_STATE_CANCELLED } from '@/utils/request-status';
import type { Request } from '@/api/request';

function isActiveBorrowerRequest(request: Request): boolean {
  const state = request.requestState;
  if (state === REQUEST_STATE_CANCELLED) return false;
  return (state >= 1 && state <= 18) || (state >= 21 && state <= 28);
}

/**
 * وام‌گیرنده tab:
 * 1) معرفی ضامن با کد ملی → GET guarantor-user/{nationalCode}
 * 2) لیست ضامن‌های هر درخواست → GET request/{requestId} + approve/reject
 */
export function IncomingGuarantyPanel() {
  const userId = getUserId();
  const queryClient = useQueryClient();
  const {
    data: requests = [],
    isLoading: isLoadingRequests,
    refetch: refetchRequests,
  } = useUserRequests(userId || '');

  const [guarantorNationalCode, setGuarantorNationalCode] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookedUpGuarantors, setLookedUpGuarantors] = useState<Guarantor[] | null>(null);

  const activeRequests = useMemo(() => requests.filter(isActiveBorrowerRequest), [requests]);

  const guarantorQueries = useQueries({
    queries: activeRequests.map(request => ({
      queryKey: guarantorQueryKeys.byRequest(request.id),
      queryFn: () => getRequestGuarantors(request.id),
      enabled: !!request.id,
    })),
  });

  const isLoadingGuarantors = guarantorQueries.some(q => q.isLoading);
  const isFetchingGuarantors = guarantorQueries.some(q => q.isFetching);

  const groups = useMemo(() => {
    return activeRequests.map((request, index) => {
      const guarantors = guarantorQueries[index]?.data ?? [];
      const pendingCount = guarantors.filter(isGuarantorPendingReview).length;
      return { request, guarantors, pendingCount };
    });
  }, [activeRequests, guarantorQueries]);

  const groupsWithGuarantors = useMemo(() => groups.filter(g => g.guarantors.length > 0), [groups]);

  const totalPending = useMemo(() => groups.reduce((sum, g) => sum + g.pendingCount, 0), [groups]);

  const handleRefresh = async () => {
    await refetchRequests();
    await Promise.all(guarantorQueries.map(q => q.refetch()));
  };

  const handleLookupGuarantor = async () => {
    const code = guarantorNationalCode.trim();
    if (!/^\d{10}$/.test(code)) {
      toast.error('کد ملی ضامن باید ۱۰ رقم باشد');
      return;
    }

    setIsLookingUp(true);
    setLookedUpGuarantors(null);
    toast.dismiss();

    try {
      const result = await lookupGuarantorByNationalCode(code);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setLookedUpGuarantors(result.data);
      toast.success(result.message || 'اطلاعات ضامن دریافت شد');
      void queryClient.invalidateQueries({ queryKey: guarantorQueryKeys.all });
      await handleRefresh();
    } catch {
      toast.error('بررسی ضامن با خطا مواجه شد');
    } finally {
      setIsLookingUp(false);
    }
  };

  if (!userId) {
    return (
      <Card>
        <CardContent className='py-10 text-center text-sm text-muted-foreground'>
          برای مشاهده درخواست‌های ضمانت ابتدا وارد شوید.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* معرفی ضامن با کد ملی — guarantor-user/{nationalCode} */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <UserPlus className='size-5' />
            معرفی ضامن با کد ملی
          </CardTitle>
          <CardDescription>
            کد ملی فردی که می‌خواهید ضامن شما باشد را وارد کنید تا وضعیت او به‌عنوان ضامن بررسی شود.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='guarantor-national-code'>کد ملی ضامن</Label>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <Input
                id='guarantor-national-code'
                inputMode='numeric'
                maxLength={10}
                value={guarantorNationalCode}
                onChange={e => {
                  setGuarantorNationalCode(e.target.value.replace(/\D/g, '').slice(0, 10));
                  setLookedUpGuarantors(null);
                }}
                placeholder='کد ملی ۱۰ رقمی ضامن'
                disabled={isLookingUp}
              />
              <Button
                type='button'
                onClick={() => void handleLookupGuarantor()}
                disabled={isLookingUp}
              >
                {isLookingUp ? (
                  <Loader2 className='size-4 animate-spin ml-1' />
                ) : (
                  <Search className='size-4 ml-1' />
                )}
                بررسی ضامن
              </Button>
            </div>
          </div>

          {lookedUpGuarantors ? (
            lookedUpGuarantors.length > 0 ? (
              <GuarantorReviewList
                guarantors={lookedUpGuarantors}
                emptyMessage='نتیجه‌ای برای این کد ملی یافت نشد.'
              />
            ) : (
              <div className='rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground'>
                برای این کد ملی اطلاعات ضامنی یافت نشد. از فرد بخواهید از تب «اعلام ضمانت» با کد ملی
                شما ضمانت را اعلام کند، سپس اینجا او را تأیید کنید.
              </div>
            )
          ) : null}
        </CardContent>
      </Card>

      {/* لیست ضامن‌های درخواست‌ها — request/{requestId} */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Inbox className='size-5' />
                ضامن‌های درخواست‌های من
                {totalPending > 0 ? (
                  <Badge className='mr-1'>{totalPending.toLocaleString('fa-IR')}</Badge>
                ) : null}
              </CardTitle>
              <CardDescription className='mt-2'>
                افرادی که برای درخواست اعتبار شما اعلام ضمانت کرده‌اند؛ می‌توانید تأیید یا رد کنید.
              </CardDescription>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => void handleRefresh()}
              disabled={isFetchingGuarantors}
            >
              {isFetchingGuarantors ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <RefreshCw className='size-4' />
              )}
              <span className='mr-1'>بروزرسانی</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isLoadingRequests || isLoadingGuarantors ? (
        <div className='flex items-center justify-center py-12 text-muted-foreground'>
          <Loader2 className='size-5 animate-spin ml-2' />
          در حال بارگذاری لیست ضامن‌ها...
        </div>
      ) : activeRequests.length === 0 ? (
        <Card>
          <CardContent className='py-10 text-center space-y-3'>
            <p className='text-sm text-muted-foreground'>
              درخواست اعتبار فعالی ندارید. پس از ثبت درخواست می‌توانید ضامن معرفی کنید.
            </p>
            <Button type='button' asChild>
              <Link href='/requests/request-credit'>ثبت درخواست اعتبار</Link>
            </Button>
          </CardContent>
        </Card>
      ) : groupsWithGuarantors.length === 0 ? (
        <Card>
          <CardContent className='py-10 text-center space-y-3'>
            <p className='text-sm text-muted-foreground'>
              هنوز ضامنی برای درخواست‌های شما ثبت نشده است. کد ملی ضامن را بالا وارد کنید یا از او
              بخواهید از تب «اعلام ضمانت» اقدام کند.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {groupsWithGuarantors.map(({ request, guarantors, pendingCount }) => (
            <Card key={request.id}>
              <CardHeader className='pb-3'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <FileText className='size-4' />
                    درخواست شماره{' '}
                    {request.requestNumber?.toLocaleString('fa-IR') ?? request.id.slice(0, 8)}
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    {pendingCount > 0 ? (
                      <Badge variant='secondary'>
                        {pendingCount.toLocaleString('fa-IR')} در انتظار بررسی
                      </Badge>
                    ) : null}
                    <Button type='button' variant='outline' size='sm' asChild>
                      <Link href={`/requests/request-credit?id=${request.id}`}>مشاهده درخواست</Link>
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {request.planName ? `طرح: ${request.planName}` : null}
                  {request.creditAmount != null
                    ? ` — مبلغ: ${Math.round(request.creditAmount).toLocaleString('fa-IR')} ریال`
                    : null}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GuarantorReviewList
                  guarantors={guarantors}
                  emptyMessage='برای این درخواست هنوز ضامنی اعلام نکرده است.'
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
