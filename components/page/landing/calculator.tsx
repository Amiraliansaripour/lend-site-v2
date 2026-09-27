'use client';

import { useEffect, useState, useMemo, useRef, startTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Button } from '@/components/ui/button';
import { CreditModal } from '@/components/page/landing/credit-modal';
import { ExternalLinkPlanPanel } from '@/components/external-link-plan-panel';
import { GlassPanel } from '@/components/page/landing/glass-panel';
import { Reveal } from '@/components/page/landing/reveal';
import { Accent, SectionHeading } from '@/components/page/landing/section-heading';
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
  const { brandName, withBrand } = useSiteTemplate();

  const allPlans = useMemo(() => {
    return (financierPlansData?.plans || []).filter(p => p.isActive);
  }, [financierPlansData?.plans]);

  const { min: sliderMin, max: sliderMax } = useMemo(
    () => getPlansAmountBounds(allPlans),
    [allPlans],
  );

  const availablePlans = useMemo(() => filterPlansByAmount(allPlans, value), [allPlans, value]);

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

  const summaryRows: { label: string; value: number; emphasize?: boolean }[] = [
    { label: 'مبلغ قسط ماهانه', value: installmentAmount, emphasize: true },
    { label: 'اعتبار دریافتی شما', value: totalRecived },
    { label: 'سود پرداختی', value: totalInterest },
    { label: 'جمع کل اقساط', value: totalPayable, emphasize: true },
  ];

  return (
    <section id='calculator' className='scroll-mt-28 mx-auto max-w-6xl px-4 md:px-6 lg:px-10'>
      <Reveal>
        <SectionHeading
          title={
            <>
              محاسبه‌گر <Accent>اقساط</Accent>
            </>
          }
          description={
            hasExternalLink
              ? 'این طرح از طریق لینک اختصاصی ادامه پیدا می‌کند؛ مبلغ و اقساط در این صفحه نمایش داده نمی‌شود.'
              : withBrand('مبلغ اعتبار را تنظیم کنید و خلاصه اقساط را لحظه‌ای ببینید.')
          }
        />
      </Reveal>

      <Reveal delayMs={80}>
        <GlassPanel className='grid gap-6 p-4 md:p-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:p-8'>
          <div className='space-y-4'>
            {allPlans.length > 0 && (
              <div className='rounded-[1.5rem] border border-navy/10 bg-navy/5 p-4 sm:p-5 dark:border-white/10 dark:bg-white/5'>
                <p className='mb-4 text-sm font-medium text-navy dark:text-gold'>مبلغ تسهیلات</p>
                <div className='space-y-6' dir='ltr'>
                  <div className='flex items-center justify-between gap-2'>
                    <button
                      type='button'
                      disabled={!canDecrease}
                      onClick={() => setAmount(prevAmount)}
                      className={cn(
                        'inline-flex items-center gap-1 text-xs text-navy/45 transition-opacity sm:text-sm dark:text-white/50',
                        !canDecrease && 'pointer-events-none opacity-40',
                      )}
                      aria-label='کاهش مبلغ'
                    >
                      <ChevronLeft className='size-4' />
                      <span className='hidden sm:inline' dir='rtl'>
                        {formatNumber(Math.max(prevAmount, sliderMin).toString())} ریال
                      </span>
                    </button>

                    <div className='min-w-0 text-center'>
                      <div
                        className='truncate text-2xl font-bold text-navy sm:text-3xl dark:text-gold'
                        dir='rtl'
                      >
                        {formatNumber(value.toString())}
                      </div>
                      <div className='mt-0.5 text-sm text-navy/45 dark:text-white/45' dir='rtl'>
                        ریال
                      </div>
                    </div>

                    <button
                      type='button'
                      disabled={!canIncrease}
                      onClick={() => setAmount(nextAmount)}
                      className={cn(
                        'inline-flex items-center gap-1 text-xs text-navy/45 transition-opacity sm:text-sm dark:text-white/50',
                        !canIncrease && 'pointer-events-none opacity-40',
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
                    className='w-full **:[[role=slider]]:border-navy **:[[role=slider]]:bg-gold'
                  />
                  <div className='flex w-full justify-between text-sm text-navy/45 dark:text-white/45'>
                    <div dir='rtl'>{formatNumber(sliderMin.toString())} ریال</div>
                    <div dir='rtl'>{formatNumber(sliderMax.toString())} ریال</div>
                  </div>
                </div>
              </div>
            )}

            <div className='rounded-[1.5rem] border border-navy/10 bg-navy/5 p-4 sm:p-5 dark:border-white/10 dark:bg-white/5'>
              <p className='mb-3 text-sm font-medium text-navy dark:text-gold'>طرح‌ها</p>
              <div className='flex flex-wrap gap-2'>
                {availablePlans.length === 0 ? (
                  <p className='text-sm text-navy/50 dark:text-white/50'>
                    طرحی برای این مبلغ موجود نیست. مبلغ را تغییر دهید.
                  </p>
                ) : (
                  availablePlans.map(item => {
                    const isLinked = Boolean(item.hasLink && item.link);
                    const selected = item?.id === selectedPlan?.id;
                    return (
                      <button
                        key={item.id}
                        type='button'
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-all',
                          selected
                            ? 'bg-gold font-medium text-navy'
                            : 'border border-navy/15 bg-transparent text-navy/75 hover:bg-navy/5 dark:border-white/15 dark:text-white/75 dark:hover:bg-white/10',
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

          <div>
            {hasExternalLink ? (
              <ExternalLinkPlanPanel
                planName={selectedPlan?.name}
                onContinue={handleExternalLinkRedirect}
                variant='landing'
              />
            ) : (
              <div className='flex h-full flex-col gap-8 rounded-[1.5rem] bg-linear-to-br from-gold via-[#f0c961] to-[#e0b84a] p-5 text-navy sm:p-6'>
                <p className='text-lg font-bold tracking-wide'>{brandName.toUpperCase()}</p>

                <div className='space-y-3'>
                  {summaryRows.map((row, index) => (
                    <div
                      key={row.label}
                      className={cn(
                        'flex items-center justify-between gap-3 text-sm sm:text-base',
                        index === 2 && 'border-b border-navy/15 pb-4',
                        index === 3 && 'pt-1',
                        row.emphasize ? 'font-bold' : 'opacity-70',
                      )}
                    >
                      <span>{row.label}</span>
                      <span className='tabular-nums'>
                        {formatNumber(row.value.toString())} ریال
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className='mt-auto h-12 w-full rounded-2xl bg-navy text-gold hover:bg-navy/90'
                  onClick={handleRequestCredit}
                  disabled={!selectedPlan}
                >
                  درخواست اعتبار
                </Button>
              </div>
            )}
          </div>
        </GlassPanel>
      </Reveal>

      <CreditModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        price={selectedPlan?.firstSystemFee}
        onConfirm={handleModalConfirm}
        isCheckRequired={selectedPlan?.guarantees?.includes('چک')}
      />
    </section>
  );
}
