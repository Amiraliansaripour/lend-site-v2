'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import {
  GUARANTOR_STATUS,
  formatGuarantorCreatedAt,
  getBorrowerDisplayName,
  getGuarantorDisplayName,
  getGuarantorNationalCode,
  getGuarantorStatusLabel,
  isGuarantorApproved,
  isGuarantorRejected,
  type Guarantor,
} from '@/api/guarantor';
import { useApproveGuarantor, useRejectGuarantor } from '@/mutations/guarantor';

function statusBadgeVariant(
  status?: number | null,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (Number(status)) {
    case GUARANTOR_STATUS.Approved:
      return 'default';
    case GUARANTOR_STATUS.Rejected:
      return 'destructive';
    case GUARANTOR_STATUS.Requested:
    case GUARANTOR_STATUS.Pending:
      return 'secondary';
    default:
      return 'outline';
  }
}

export function canReviewGuarantor(guarantor: Guarantor, isReadOnly?: boolean): boolean {
  if (isReadOnly) return false;
  if (isGuarantorApproved(guarantor) || isGuarantorRejected(guarantor)) return false;
  const status = Number(guarantor.status);
  return (
    status === GUARANTOR_STATUS.Requested ||
    status === GUARANTOR_STATUS.Pending ||
    !Number.isFinite(status)
  );
}

interface GuarantorReviewListProps {
  guarantors: Guarantor[];
  isLoading?: boolean;
  isReadOnly?: boolean;
  emptyMessage?: string;
  /** When true, also show وام‌گیرنده name (useful for ضامن-side views) */
  showBorrower?: boolean;
}

export function GuarantorReviewList({
  guarantors,
  isLoading = false,
  isReadOnly = false,
  emptyMessage = 'هنوز درخواستی برای ضمانت شما ثبت نشده است.',
  showBorrower = false,
}: GuarantorReviewListProps) {
  const approveMutation = useApproveGuarantor();
  const rejectMutation = useRejectGuarantor();
  const [rejectTarget, setRejectTarget] = useState<Guarantor | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = (guarantor: Guarantor) => {
    if (isReadOnly) return;
    toast.dismiss();
    approveMutation.mutate(guarantor.id, {
      onSuccess: result => {
        if (result.ok) {
          toast.success(result.message || 'ضامن با موفقیت تأیید شد');
        } else {
          toast.error(result.message);
        }
      },
      onError: () => toast.error('خطا در تأیید ضامن'),
    });
  };

  const handleRejectSubmit = () => {
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (!reason) {
      toast.error('لطفاً دلیل رد را وارد کنید');
      return;
    }

    toast.dismiss();
    rejectMutation.mutate(
      { guarantorId: rejectTarget.id, reason },
      {
        onSuccess: result => {
          if (result.ok) {
            toast.success(result.message || 'ضامن رد شد');
            setRejectTarget(null);
            setRejectReason('');
          } else {
            toast.error(result.message);
          }
        },
        onError: () => toast.error('خطا در رد ضامن'),
      },
    );
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8 text-muted-foreground'>
        <Loader2 className='size-5 animate-spin ml-2' />
        در حال دریافت لیست ضامن‌ها...
      </div>
    );
  }

  if (guarantors.length === 0) {
    return (
      <div className='rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground'>
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <ul className='space-y-3'>
        {guarantors.map(guarantor => {
          const approved = isGuarantorApproved(guarantor);
          const rejected = isGuarantorRejected(guarantor);
          const reviewable = canReviewGuarantor(guarantor, isReadOnly);
          const nationalCode = getGuarantorNationalCode(guarantor);
          const createdAtLabel = formatGuarantorCreatedAt(guarantor.createdAt);
          const statusLabel = getGuarantorStatusLabel(guarantor.status, guarantor.statusDisplay);

          return (
            <li
              key={guarantor.id}
              className='flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between'
            >
              <div className='space-y-2 min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='font-medium text-base'>
                    {getGuarantorDisplayName(guarantor)}
                  </span>
                  <Badge variant={statusBadgeVariant(guarantor.status)}>{statusLabel}</Badge>
                  {approved ? <CheckCircle2 className='size-4 text-green-600' /> : null}
                  {rejected ? <XCircle className='size-4 text-destructive' /> : null}
                </div>

                <dl className='grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2'>
                  {nationalCode ? (
                    <div>
                      <dt className='text-muted-foreground inline'>کد ملی ضامن: </dt>
                      <dd className='inline font-medium tracking-wide'>{nationalCode}</dd>
                    </div>
                  ) : null}

                  {/* {showBorrower || guarantor.requestedUserFullName ? (
                    <div>
                      <dt className='text-muted-foreground inline'>وام‌گیرنده: </dt>
                      <dd className='inline font-medium'>{getBorrowerDisplayName(guarantor)}</dd>
                    </div>
                  ) : null} */}

                  {createdAtLabel ? (
                    <div>
                      <dt className='text-muted-foreground inline'>تاریخ اعلام: </dt>
                      <dd className='inline font-medium'>{createdAtLabel}</dd>
                    </div>
                  ) : null}

                  {guarantor.phoneNumber ? (
                    <div>
                      <dt className='text-muted-foreground inline'>موبایل: </dt>
                      <dd className='inline font-medium'>{String(guarantor.phoneNumber)}</dd>
                    </div>
                  ) : null}
                </dl>

                {guarantor.rejectReason ? (
                  <p className='text-sm text-destructive'>
                    دلیل رد: {String(guarantor.rejectReason)}
                  </p>
                ) : null}
              </div>

              {reviewable ? (
                <div className='flex gap-2 shrink-0'>
                  <Button
                    type='button'
                    size='sm'
                    onClick={() => handleApprove(guarantor)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className='size-4 animate-spin' />
                    ) : (
                      <CheckCircle2 className='size-4 ml-1' />
                    )}
                    تأیید
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      setRejectTarget(guarantor);
                      setRejectReason('');
                    }}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className='size-4 ml-1' />
                    رد
                  </Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <Dialog
        open={!!rejectTarget}
        onOpenChange={open => {
          if (!open) {
            setRejectTarget(null);
            setRejectReason('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رد ضامن</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <p className='text-sm text-muted-foreground'>
              {rejectTarget ? getGuarantorDisplayName(rejectTarget) : ''}
              {rejectTarget && getGuarantorNationalCode(rejectTarget)
                ? ` — ${getGuarantorNationalCode(rejectTarget)}`
                : ''}
            </p>
            <div className='space-y-2'>
              <Label htmlFor='reject-reason'>دلیل رد</Label>
              <Textarea
                id='reject-reason'
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder='مثلاً: اطلاعات ضامن تأیید نشد'
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className='gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setRejectTarget(null);
                setRejectReason('');
              }}
            >
              انصراف
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={handleRejectSubmit}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? <Loader2 className='size-4 animate-spin ml-1' /> : null}
              ثبت رد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
