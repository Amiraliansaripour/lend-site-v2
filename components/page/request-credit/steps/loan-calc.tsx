'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getFinancierPlans, getPlan, type PlanDetail } from '@/api/plan';
import { createRequest, optOutRequest } from '@/api/facility';
import { getUserRequests, type Request } from '@/api/request';
import { toast } from 'sonner';
import { calculatePMT } from '@/utils/loan-calculator';
import { formatNumber } from '@/utils/format';
import { getUserId } from '@/lib/auth/client/user-info';
import { CreditModal } from '@/components/page/landing/credit-modal';
import { canSubmitNewRequest, getIncompleteRequestsToCancel } from '@/utils/request-status';

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
    mutationFn: async (payload: {
      userId: string;
      planId: string;
      creditAmount: number;
      period: number;
    }) => {
      const requests = await getUserRequests(payload.userId);

      if (!canSubmitNewRequest(requests)) {
        throw new Error('BLOCKED_BY_STATUS');
      }

      const incomplete = getIncompleteRequestsToCancel(requests);
      await Promise.all(incomplete.map(req => optOutRequest(req.id)));

      return createRequest(payload);
    },
    onSuccess: response => {
      if (response && response.id) {
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
      toast.error('خطا در ایجاد درخواست');
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
    if (!planDetails || !creditAmount) return null;

    const totalFeeRate = planDetails.duringBankFee + planDetails.duringSystemFee;
    const firstFeeRate = planDetails.firstBankFee + planDetails.firstSystemFee;

    const result = calculatePMT(creditAmount, totalFeeRate, planDetails.period);
    const receivedAmount = creditAmount - (creditAmount * firstFeeRate) / 100;

    return {
      monthlyInstallment: Math.round(result.installment),
      totalRepayment: Math.round(result.total),
      totalInterest: Math.round(result.total - creditAmount),
      netReceived: Math.round(receivedAmount),
    };
  }, [planDetails, creditAmount]);

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
    // This is called when modal confirms
    createRequestMutation.mutate({
      userId: userId!,
      planId: selectedPlan!.id,
      creditAmount,
      period: selectedPlan!.period,
    });
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
          <div className='mb-8'>
            <h3 className='text-lg font-bold'>جزئیات وام</h3>
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
        </div>
      </div>

      <div className='flex justify-center gap-4 mt-8'>
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
    </div>
  );
}
