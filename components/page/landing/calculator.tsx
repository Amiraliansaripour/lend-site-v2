'use client';

import { useEffect, useState, useMemo, useRef, startTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateLoanSummary } from '@/utils/loan-calculator';
import { formatNumber } from '@/utils/format';
import { normalizeToPersianDigits } from '@/utils/normalize';
import { type PlanDetail } from '@/api/plan';
import { getFinancierPlansQueryOptions } from '@/queries/plan';
import { Slider } from '@/components/ui/slider';
import { CreditModal } from '@/components/page/landing/credit-modal';
import { SectionAmbientGlow } from '@/components/page/landing/section-ambient-glow';
import { ExternalLinkPlanPanel } from '@/components/external-link-plan-panel';
import { toast } from 'sonner';

import { useRouter } from '@/i18n/navigation';

interface CalculatorProps {
  onRequestCredit?: (plan: PlanDetail | null, amount: number) => void;
}

function formatRial(amount: number) {
  return `${normalizeToPersianDigits(formatNumber(amount, { int: true }))} ریال`;
}

export function Calculator({ onRequestCredit }: CalculatorProps) {
  const [value, setValue] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isInitializedRef = useRef(false);
  const { data: financierPlansData } = useQuery(getFinancierPlansQueryOptions());
  const router = useRouter();
  const financiers = useMemo(() => {
    return financierPlansData?.plans || [];
  }, [financierPlansData?.plans]);

  useEffect(() => {
    if (financiers.length > 0 && !isInitializedRef.current) {
      const firstPlan = financiers[financiers.length - 1];

      isInitializedRef.current = true;

      startTransition(() => {
        setSelectedPlan(firstPlan);
        setValue(firstPlan.minAmount);
      });
    }
  }, [financiers]);

  const loanCalculation = useMemo(() => {
    if (!selectedPlan || !value) {
      return null;
    }
    return calculateLoanSummary(value, selectedPlan);
  }, [selectedPlan, value]);

  const handleSliderChange = (values: number[]) => {
    setValue(values[0]);
  };

  const handlePlanClick = (plan: PlanDetail) => {
    setSelectedPlan(plan);
    setValue(plan.minAmount);
  };

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
  const totalInterest = loanCalculation?.totalInterest ?? 0;

  const minAmount = selectedPlan ? selectedPlan.minAmount : 0;
  const maxAmount = selectedPlan ? selectedPlan.maxAmount : 0;

  const summaryRows = [
    { label: 'اعتبار درخواستی', value: formatRial(value) },
    { label: 'طرح بازپرداخت', value: selectedPlan?.name ?? '—' },
    { label: 'سود پرداختی', value: formatRial(totalInterest) },
    {
      label: 'مبلغ قسط ماهانه',
      value: formatRial(installmentAmount),
      emphasize: true,
    },
  ];

  return (
    <section className='px-4 py-10 dark:relative sm:py-12 lg:py-16'>
      <SectionAmbientGlow />

      <header className='mx-auto mb-8 max-w-2xl text-center sm:mb-10'>
        <h2 className='mb-3 text-2xl font-bold text-[#0f172a] sm:text-3xl'>نمایشگر اقساط</h2>
        <p className='text-sm leading-7 text-[#64748b] sm:text-base'>
          {hasExternalLink
            ? 'این طرح از طریق لینک اختصاصی ادامه پیدا می‌کند؛ مبلغ و اقساط در این صفحه نمایش داده نمی‌شود.'
            : 'مبلغ اعتبار درخواستی و طرح بازپرداخت را انتخاب کنید تا اقساط ماهانه محاسبه شود.'}
        </p>
      </header>

      <div dir='ltr' className='mx-auto grid max-w-5xl gap-5 lg:grid-cols-2 lg:gap-6'>
        {/* Input card */}
        <div
          dir='rtl'
          className='rounded-3xl border border-[#e8eef7] bg-white p-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] dark:border-white/8 sm:p-7'
        >
          {selectedPlan && !hasExternalLink && (
            <div className='mb-8'>
              <div className='mb-4 text-sm font-medium text-[#64748b]'>مبلغ اعتبار مورد نظر</div>
              <div className='mb-6 text-center text-2xl font-bold text-brand sm:text-3xl'>
                {formatRial(value)}
              </div>

              <Slider
                dir='ltr'
                min={minAmount}
                max={maxAmount}
                step={10000000}
                value={[value]}
                onValueChange={handleSliderChange}
                className={cn(
                  'w-full',
                  '**:data-[slot=slider-track]:h-1.5 **:data-[slot=slider-track]:rounded-full **:data-[slot=slider-track]:bg-[#e8eef7] **:data-[slot=slider-track]:shadow-none',
                  '**:data-[slot=slider-range]:bg-brand **:data-[slot=slider-range]:shadow-none',
                  '**:data-[slot=slider-thumb]:size-5 **:data-[slot=slider-thumb]:border-[3px] **:data-[slot=slider-thumb]:border-white **:data-[slot=slider-thumb]:bg-brand **:data-[slot=slider-thumb]:shadow-[0_2px_8px_rgba(0,85,255,0.35)] **:data-[slot=slider-thumb]:ring-0 **:data-[slot=slider-thumb]:hover:ring-0 **:data-[slot=slider-thumb]:focus-visible:ring-0',
                )}
              />

              <div className='mt-3 flex justify-between text-xs text-[#94a3b8] sm:text-sm'>
                <span>{formatRial(maxAmount)}</span>
                <span>{formatRial(minAmount)}</span>
              </div>
            </div>
          )}

          <div>
            <div className='mb-3 text-sm font-medium text-[#64748b]'>طرح‌های اعتباری</div>
            <div className='flex flex-wrap gap-2'>
              {financiers.map(item => {
                if (!item.isActive) return null;
                const isLinked = Boolean(item.hasLink && item.link);
                const isSelected = item.id === selectedPlan?.id;
                return (
                  <button
                    key={item.id}
                    type='button'
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm',
                      isSelected
                        ? 'border-brand/20 bg-brand/10 text-brand'
                        : 'border-[#e2e8f0] bg-white text-[#475569] hover:border-brand/30 hover:bg-brand/5',
                    )}
                    onClick={() => handlePlanClick(item)}
                  >
                    {item.name}
                    {isLinked && <ExternalLink className='size-3 opacity-70' aria-hidden />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary / external panel */}
        {hasExternalLink ? (
          <ExternalLinkPlanPanel
            planName={selectedPlan?.name}
            onContinue={handleExternalLinkRedirect}
            variant='landing'
            className='rounded-3xl border border-[#e8eef7] bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] dark:border-white/8'
          />
        ) : (
          <div
            dir='rtl'
            className='flex flex-col rounded-3xl border border-[#e8eef7] bg-white p-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] dark:border-white/8 sm:p-7'
          >
            <div className='flex-1'>
              {summaryRows.map((row, index) => (
                <div
                  key={row.label}
                  className={cn(
                    'flex items-center justify-between gap-4 py-4',
                    index < summaryRows.length - 1 &&
                      'border-b border-[#eef2f7] dark:border-white/6',
                  )}
                >
                  <span className='text-sm text-[#64748b] sm:text-base'>{row.label}</span>
                  <span
                    className={cn(
                      'text-left text-sm font-semibold text-[#0f172a] sm:text-base',
                      row.emphasize && 'text-base font-bold text-brand sm:text-lg',
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <button
              type='button'
              className='mt-8 w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90 sm:mt-10 sm:py-4 sm:text-base'
              onClick={handleRequestCredit}
            >
              درخواست اعتبار
            </button>
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
    </section>
  );
}
