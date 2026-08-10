'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getFinancierPlans, getPlan, type PlanDetail } from '@/api/plan';
import { createRequest, ExistingRequestError } from '@/api/facility';
import { getUserRequests, type Request } from '@/api/request';
import { toast } from 'sonner';
import { calculateLoanSummary } from '@/utils/loan-calculator';
import { formatNumber } from '@/utils/format';
import { getUserId } from '@/lib/auth/client/user-info';
import { CreditModal } from '@/components/page/landing/credit-modal';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { canSubmitNewRequest } from '@/utils/request-status';
import type { CreateRequestPayload } from '@/types/request-credit';

interface LoanCalcProps {
  onNext?: (data: { requestId: string; planId: string; creditAmount: number }) => void;
  isEditMode?: boolean;
  existingRequests?: Request[];
}

export function LoanCalc({ onNext, isEditMode, existingRequests = [] }: LoanCalcProps) {
  const router = useRouter();
  const userId = getUserId();

  const [selectedPlan, setSelectedPlan] = useState<PlanDetail | null>(null);
  const [creditAmount, setCreditAmount] = useState(30000000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isForceDialogOpen, setIsForceDialogOpen] = useState(false);
  const [forceDialogMessage, setForceDialogMessage] = useState('');
  const [isLinkConfirmOpen, setIsLinkConfirmOpen] = useState(false);

  const { data: financierData, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['financier-plans'],
    queryFn: getFinancierPlans,
  });

  const { data: planDetails } = useQuery({
    queryKey: ['plan-detail', selectedPlan?.id],
    queryFn: () => getPlan(selectedPlan!.id),
    enabled: !!selectedPlan?.id,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (payload: CreateRequestPayload) => {
      const requests = await getUserRequests(payload.userId);

      if (!canSubmitNewRequest(requests)) {
        throw new Error('BLOCKED_BY_STATUS');
      }

      return createRequest(payload);
    },
    onSuccess: response => {
      if (response && response.id) {
        setIsForceDialogOpen(false);
        toast.success('درخواست با موفقیت ایجاد شد');
        localStorage.setItem('requestId', response.id);
        localStorage.setItem('planId', selectedPlan!.id);
        if (isEditMode && onNext) {
          onNext({
            requestId: response.id,
            planId: selectedPlan!.id,
            creditAmount,
          });
        } else {
          router.push(`/requests/request-credit?id=${response.id}`);
        }
      }
    },
    onError: (error: Error) => {
      if (error.message === 'BLOCKED_BY_STATUS') {
        toast.error(
          'به‌دلیل وجود درخواست در حال بررسی، امکان ثبت درخواست جدید وجود ندارد. ابتدا درخواست فعلی را لغو کنید.',
        );
        return;
      }

      if (error instanceof ExistingRequestError) {
        setForceDialogMessage(error.message);
        setIsForceDialogOpen(true);
        return;
      }

      toast.error(error.message || 'خطا در ایجاد درخواست');
    },
  });

  const activePlans = useMemo(() => {
    return financierData?.plans.filter(p => p.isActive) || [];
  }, [financierData]);

  useEffect(() => {
    if (activePlans.length > 0 && !selectedPlan) {
      const firstPlan = activePlans[activePlans.length - 1];
      void setSelectedPlan(firstPlan);
      void setCreditAmount(firstPlan.minAmount);
    }
  }, [activePlans, selectedPlan]);

  const loanCalculation = useMemo(() => {
    // Prefer full plan details; fall back to list plan from GetPlanForLend
    const plan = planDetails ?? selectedPlan;
    if (!plan || !creditAmount) return null;
    return calculateLoanSummary(creditAmount, plan);
  }, [planDetails, selectedPlan, creditAmount]);

  const handlePlanSelect = (plan: PlanDetail) => {
    setSelectedPlan(plan);
    setCreditAmount(plan.minAmount);
  };

  const handleSubmit = () => {
    if (!selectedPlan) {
      toast.error('لطفا طرح را انتخاب کنید');
      return;
    }

    if (!userId) {
      toast.error('لطفا ابتدا وارد شوید');
      router.push('/login');
      return;
    }

    if (!canSubmitNewRequest(existingRequests)) {
      toast.error(
        'به‌دلیل وجود درخواست در حال بررسی، امکان ثبت درخواست جدید وجود ندارد. ابتدا درخواست فعلی را لغو کنید.',
      );
      return;
    }

    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    createRequestMutation.mutate({
      userId: userId!,
      planId: selectedPlan!.id,
      creditAmount,
      period: selectedPlan!.period,
      force: false,
    });
  };

  const handleForceConfirm = async () => {
    await createRequestMutation.mutateAsync({
      userId: userId!,
      planId: selectedPlan!.id,
      creditAmount,
      period: selectedPlan!.period,
      force: true,
    });
  };

  const planGuarantees = selectedPlan?.guarantees?.length
    ? selectedPlan.guarantees
    : planDetails?.guarantees;
  const hasExternalLink = Boolean(selectedPlan?.hasLink && selectedPlan?.link);

  const handleGetCreditConfirm = () => {
    const link = selectedPlan?.link;
    if (!link) {
      toast.error('لینک دریافت اعتبار موجود نیست');
      return;
    }
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  if (isLoadingPlans) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const minValue = selectedPlan?.minAmount || 20000000;
  const maxValue = selectedPlan?.maxAmount || 200000000;

  return (
    <div className='w-full max-w-6xl mx-auto'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='space-y-6'>
          <div>
            <h2 className='text-xl font-bold mb-2'>نمایشگر اقساط</h2>
            <p className='text-muted-foreground'>
              لطفا مبلغ درخواستی و مدت بازپرداخت را انتخاب کنید.
            </p>
          </div>

          <div className='bg-accent/50 rounded-lg p-6 space-y-6'>
            <div>
              <label className='text-sm text-muted-foreground mb-4 block'>مبلغ مورد نظر</label>
              <div className='space-y-4'>
                <div className='text-center'>
                  <span className='text-2xl font-bold text-primary'>
                    {formatNumber(creditAmount)} ریال
                  </span>
                </div>
                <Slider
                  dir='ltr'
                  value={[creditAmount]}
                  onValueChange={value => setCreditAmount(value[0])}
                  min={minValue}
                  max={maxValue}
                  step={1000000}
                  className='w-full'
                />
                <div className='flex justify-between text-sm text-muted-foreground'>
                  <span>{formatNumber(maxValue)}</span>
                  <span>{formatNumber(minValue)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-accent/50 rounded-lg p-6'>
            <label className='text-sm text-muted-foreground mb-3 block'>طرح ها</label>
            <div className='flex flex-wrap gap-2'>
              {activePlans.map(plan => (
                <Button
                  key={plan.id}
                  variant={selectedPlan?.id === plan.id ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => handlePlanSelect(plan)}
                >
                  {plan.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className='bg-card rounded-2xl shadow-lg p-6 h-fit'>
          <div className='mb-8 flex items-center gap-2'>
            <h3 className='text-lg font-bold'>جزئیات وام</h3>
            {!!planGuarantees?.length && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type='button'
                    className='inline-flex text-muted-foreground hover:text-primary transition-colors'
                    aria-label='اطلاعات تکمیلی طرح'
                  >
                    <HelpCircle className='size-4' />
                  </button>
                </TooltipTrigger>
                <TooltipContent side='bottom' className='max-w-xs text-right'>
                  <p className='mb-1 font-medium'>ضمانت‌های طرح</p>
                  <ul className='list-disc space-y-1 pr-4 text-xs'>
                    {planGuarantees.map(guarantee => (
                      <li key={guarantee}>{guarantee}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {loanCalculation && (
            <div className='space-y-4'>
              <div className='flex justify-between items-center py-3 border-b'>
                <span className='text-muted-foreground'>مبلغ قسط ماهانه</span>
                <span className='font-bold text-lg'>
                  {formatNumber(loanCalculation.monthlyInstallment)} ریال
                </span>
              </div>

              <div className='flex justify-between items-center py-3 border-b'>
                <span className='text-muted-foreground'>اعتبار دریافتی شما</span>
                <span className='font-medium'>
                  {formatNumber(loanCalculation.netReceived)} ریال
                </span>
              </div>

              <div className='flex justify-between items-center py-3 border-b'>
                <span className='text-muted-foreground'>سود پرداختی</span>
                <span className='font-medium'>
                  {formatNumber(loanCalculation.totalInterest)} ریال
                </span>
              </div>

              <div className='flex justify-between items-center py-3'>
                <span className='font-bold'>جمع کل اقساط</span>
                <span className='font-bold text-lg'>
                  {formatNumber(loanCalculation.totalRepayment)} ریال
                </span>
              </div>
            </div>
          )}

          {hasExternalLink && (
            <div className='mt-6'>
              <Button className='w-full' size='lg' onClick={() => setIsLinkConfirmOpen(true)}>
                دریافت اعتبار
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className='flex justify-center gap-4 mt-8'>
        {!hasExternalLink && (
          <Button
            onClick={handleSubmit}
            disabled={!selectedPlan || createRequestMutation.isPending}
            size='lg'
          >
            {createRequestMutation.isPending
              ? 'در حال ایجاد...'
              : isEditMode
                ? 'ویرایش'
                : 'مرحله بعد'}
          </Button>
        )}
        {!isEditMode && (
          <Button variant='outline' size='lg' onClick={() => router.back()}>
            بازگشت
          </Button>
        )}
      </div>

      {/* Credit Modal */}
      <CreditModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        price={planDetails?.firstSystemFee}
        onConfirm={handleModalConfirm}
        isCheckRequired={planDetails?.guarantees?.includes('چک')}
      />

      <ConfirmDialog
        open={isForceDialogOpen}
        setOpen={setIsForceDialogOpen}
        title='تایید درخواست جدید'
        description={forceDialogMessage}
        confirmText='ادامه'
        cancelText='انصراف'
        isPending={createRequestMutation.isPending}
        onConfirm={handleForceConfirm}
      />

      <ConfirmDialog
        open={isLinkConfirmOpen}
        setOpen={setIsLinkConfirmOpen}
        title='دریافت اعتبار'
        description='آیا مایل به انتقال به صفحه دریافت اعتبار هستید؟'
        confirmText='بله، ادامه'
        cancelText='انصراف'
        onConfirm={handleGetCreditConfirm}
      />
    </div>
  );
}
