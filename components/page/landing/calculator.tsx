'use client';

import { useEffect, useState, useMemo, useRef, startTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  calculateLoanSummary,
  CREDIT_AMOUNT_STEP,
  clampAmountToStep,
  filterPlansByAmount,
  getPlansAmountBounds,
} from '@/utils/loan-calculator';
import { formatNumber } from '@/utils/format';
import { type PlanDetail } from '@/api/plan';
import { getFinancierPlansQueryOptions } from '@/queries/plan';
import { Slider } from '@/components/ui/slider';
import { CreditModal } from '@/components/page/landing/credit-modal';
import { ExternalLinkPlanPanel } from '@/components/external-link-plan-panel';
import { toast } from 'sonner';

import { useRouter } from '@/i18n/navigation';
import { useSiteTemplate } from '@/providers/site-template';

interface CalculatorProps {
  onRequestCredit?: (plan: PlanDetail | null, amount: number) => void;
}

export function Calculator({ onRequestCredit }: CalculatorProps) {
  const [value, setValue] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isInitializedRef = useRef(false);
  const { data: financierPlansData } = useQuery(getFinancierPlansQueryOptions());
  const router = useRouter();
  const { brandName, getImageUrl } = useSiteTemplate();
  const logoUrl = getImageUrl('logo');

  const allPlans = useMemo(() => {
    return (financierPlansData?.plans || []).filter(p => p.isActive);
  }, [financierPlansData?.plans]);

  const { min: sliderMin, max: sliderMax } = useMemo(
    () => getPlansAmountBounds(allPlans),
    [allPlans],
  );

  const availablePlans = useMemo(() => filterPlansByAmount(allPlans, value), [allPlans, value]);

  // Initialize amount + plan when data loads
  useEffect(() => {
    if (allPlans.length > 0 && !isInitializedRef.current) {
      const firstPlan = allPlans[allPlans.length - 1];
      const initialAmount = clampAmountToStep(firstPlan.minAmount, sliderMin, sliderMax);

      isInitializedRef.current = true;

      startTransition(() => {
        setValue(initialAmount);
        const matching = filterPlansByAmount(allPlans, initialAmount);
        setSelectedPlan(matching.find(p => p.id === firstPlan.id) ?? matching[0] ?? firstPlan);
      });
    }
  }, [allPlans, sliderMin, sliderMax]);

  // Keep selected plan inside the filtered set as amount changes
  useEffect(() => {
    if (!isInitializedRef.current || allPlans.length === 0) return;

    if (availablePlans.length === 0) {
      if (selectedPlan) setSelectedPlan(null);
      return;
    }

    const stillValid = selectedPlan && availablePlans.some(p => p.id === selectedPlan.id);
    if (!stillValid) {
      setSelectedPlan(availablePlans[0]);
    }
  }, [availablePlans, selectedPlan, allPlans.length]);

  const loanCalculation = useMemo(() => {
    if (!selectedPlan || !value) {
      return null;
    }
    return calculateLoanSummary(value, selectedPlan);
  }, [selectedPlan, value]);

  const setAmount = (next: number) => {
    setValue(clampAmountToStep(next, sliderMin, sliderMax));
  };

  const handleSliderChange = (values: number[]) => {
    setAmount(values[0]);
  };

  const handlePlanClick = (plan: PlanDetail) => {
    setSelectedPlan(plan);
  };

  const prevAmount = value - CREDIT_AMOUNT_STEP;
  const nextAmount = value + CREDIT_AMOUNT_STEP;
  const canDecrease = prevAmount >= sliderMin;
  const canIncrease = nextAmount <= sliderMax;

  const hasExternalLink = Boolean(selectedPlan?.hasLink && selectedPlan?.link);

  const handleExternalLinkRedirect = () => {
    const link = selectedPlan?.link;
    if (!link) {
      toast.error('لینک دریافت اعتبار موجود نیست');
      return;
    }
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleRequestCredit = () => {
    if (hasExternalLink) {
      handleExternalLinkRedirect();
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (onRequestCredit) {
      onRequestCredit(selectedPlan, value);
    }
    router.push('/requests');
  };

  const installmentAmount = loanCalculation?.monthlyInstallment ?? 0;
  const totalPayable = loanCalculation?.totalRepayment ?? 0;
  const totalInterest = loanCalculation?.totalInterest ?? 0;
  const totalRecived = loanCalculation?.netReceived ?? 0;

  return (
    <div className='flex flex-col lg:flex-row gap-6 lg:gap-10 px-4 sm:px-6 md:px-8 lg:px-10 xl:pl-20 xl:pr-10 mb-10 border-t border-gray-100 justify-center'>
      {/* Controls: amount slider + filtered plans */}
      <div className='w-full lg:w-3/5 pt-8 lg:pt-12'>
        <div className='font-bold text-lg sm:text-xl mb-3 sm:mb-5'>محاسبه‌گر اقساط</div>
        <div className='text-base sm:text-lg text-[#454545] mb-8 sm:mb-12 lg:mb-[75px]'>
          {hasExternalLink
            ? 'این طرح از طریق لینک اختصاصی ادامه پیدا می‌کند؛ مبلغ و اقساط در این صفحه نمایش داده نمی‌شود.'
            : 'مبلغ اعتبار درخواستی خود را مشخص کنید'}
        </div>

        {/* Amount Selector — always shown; plans filter by range */}
        {allPlans.length > 0 && (
          <div className='pr-4 sm:pr-6 md:pr-8 lg:pr-11 bg-pink-light p-3 sm:p-4 rounded-lg border border-[#F5F0FF]'>
            <div className='flex flex-col gap-6' dir='ltr'>
              <div className='flex items-center justify-between gap-2 sm:gap-4'>
                <button
                  type='button'
                  disabled={!canDecrease}
                  onClick={() => setAmount(prevAmount)}
                  className={cn(
                    'flex items-center gap-1 text-xs sm:text-sm text-light-text shrink-0 transition-opacity',
                    !canDecrease && 'opacity-40 pointer-events-none',
                  )}
                  aria-label='کاهش مبلغ'
                >
                  <ChevronLeft className='size-4' />
                  <span className='hidden sm:inline' dir='rtl'>
                    {formatNumber(Math.max(prevAmount, sliderMin).toString())} ریال
                  </span>
                </button>

                <div className='text-center min-w-0'>
                  <div
                    className='text-xl sm:text-2xl lg:text-3xl font-bold text-[#3F455D] truncate'
                    dir='rtl'
                  >
                    {formatNumber(value.toString())}
                  </div>
                  <div className='text-xs sm:text-sm text-light-text mt-0.5' dir='rtl'>
                    ریال
                  </div>
                </div>

                <button
                  type='button'
                  disabled={!canIncrease}
                  onClick={() => setAmount(nextAmount)}
                  className={cn(
                    'flex items-center gap-1 text-xs sm:text-sm text-light-text shrink-0 transition-opacity',
                    !canIncrease && 'opacity-40 pointer-events-none',
                  )}
                  aria-label='افزایش مبلغ'
                >
                  <span className='hidden sm:inline' dir='rtl'>
                    {formatNumber(Math.min(nextAmount, sliderMax).toString())} ریال
                  </span>
                  <ChevronRight className='size-4' />
                </button>
              </div>

              <Slider
                min={sliderMin}
                max={sliderMax}
                step={CREDIT_AMOUNT_STEP}
                value={[value]}
                onValueChange={handleSliderChange}
                className='w-full'
              />
              <div className='text-sm sm:text-base lg:text-lg text-purple-darker flex justify-between w-full'>
                <div dir='rtl'>{formatNumber(sliderMin.toString())} ریال</div>
                <div dir='rtl'>{formatNumber(sliderMax.toString())} ریال</div>
              </div>
            </div>
          </div>
        )}

        <div
          className={cn(
            'pr-4 sm:pr-6 md:pr-8 lg:pr-11 bg-pink-light p-3 sm:p-4 rounded-lg border border-[#F5F0FF]',
            allPlans.length > 0 && 'mt-4 sm:mt-6 lg:mt-9',
          )}
        >
          <div className='text-light-text text-xs sm:text-sm mb-3'>طرح ها</div>
          <div className='flex flex-wrap gap-2'>
            {availablePlans.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                طرحی برای این مبلغ موجود نیست. مبلغ را تغییر دهید.
              </p>
            ) : (
              availablePlans.map(item => {
                const isLinked = Boolean(item.hasLink && item.link);
                return (
                  <button
                    key={item.id}
                    className={cn(
                      'text-xs px-2 py-2 flex-shrink-0 rounded transition-colors inline-flex items-center gap-1.5',
                      item?.id === selectedPlan?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                    )}
                    onClick={() => handlePlanClick(item)}
                  >
                    {item?.name}
                    {isLinked && <ExternalLink className='size-3 opacity-70' aria-hidden />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Results / external redirect panel */}
      <div className='w-full lg:w-2/3 max-w-[545px] mx-auto lg:mx-0 mt-8 lg:mt-[87px]'>
        {hasExternalLink ? (
          <ExternalLinkPlanPanel
            planName={selectedPlan?.name}
            onContinue={handleExternalLinkRedirect}
            variant='landing'
          />
        ) : (
          <div className='p-4 sm:p-5 lg:p-[17px] px-4 sm:px-5 calculator-shadow rounded-2xl h-full'>
            <div className='mb-8 sm:mb-12 lg:mb-[74px]'>
              {logoUrl ? (
                <Image
                  className='w-28 sm:w-36 lg:w-44'
                  src={logoUrl}
                  alt={brandName}
                  width={144}
                  height={48}
                  unoptimized
                />
              ) : null}
            </div>

            <div className='space-y-3 sm:space-y-4'>
              <div className='flex justify-between text-sm sm:text-base lg:text-lg mb-3'>
                <div>مبلغ قسط ماهانه</div>
                <div>{formatNumber(installmentAmount.toString())} ریال</div>
              </div>
              <div className='flex justify-between text-sm sm:text-base lg:text-lg mb-3 text-darker-text font-light'>
                <div>اعتبار دریافتی شما</div>
                <div>{formatNumber(totalRecived.toString())} ریال</div>
              </div>
              <div className='flex justify-between text-sm sm:text-base lg:text-lg pb-4 border-b border-[#F5F0FF] text-darker-text font-light'>
                <div>سود پرداختی</div>
                <div>{formatNumber(totalInterest.toString())} ریال</div>
              </div>
              <div className='flex justify-between text-sm sm:text-base lg:text-lg pt-4'>
                <div className=''>جمع کل اقساط</div>
                <div className=''>{formatNumber(totalPayable.toString())} ریال</div>
              </div>
            </div>

            <div className='w-full mt-8 sm:mt-12 lg:mt-16 flex items-end'>
              <button
                className='w-full bg-secondary-green text-white h-12 sm:h-14 rounded text-sm sm:text-base font-medium transition-colors bg-primary hover:bg-green-600'
                onClick={handleRequestCredit}
                disabled={!selectedPlan}
              >
                درخواست اعتبار
              </button>
            </div>
          </div>
        )}
      </div>

      <CreditModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        price={selectedPlan?.firstSystemFee}
        onConfirm={handleModalConfirm}
        isCheckRequired={selectedPlan?.guarantees?.includes('چک')}
      />
    </div>
  );
}
