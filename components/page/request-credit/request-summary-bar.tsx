'use client';

import { useMemo, type ReactNode } from 'react';
import { CalendarClock, Landmark, Percent, Receipt, Wallet } from 'lucide-react';
import type { PlanDetail } from '@/api/plan';
import type { RequestPreviewData } from '@/api/request';
import { calculateLoanSummary } from '@/utils/loan-calculator';
import { formatNumber } from '@/utils/format';
import { cn } from '@/lib/utils';

type RequestLike = {
  creditAmount?: number | null;
  planName?: string | null;
  period?: number | null;
  planPeriod?: string | null;
  planFinancierName?: string | null;
  financierName?: string | null;
  planPercentage?: string | null;
  totalRefundAmount?: number | null;
  loanDetailAmount?: number | null;
  feeAmount?: number | null;
  planId?: string | null;
};

interface RequestSummaryBarProps {
  previewData?: RequestPreviewData | null;
  requestData?: RequestLike | null;
  planData?: PlanDetail | null;
  className?: string;
}

type SummaryItem = {
  key: string;
  label: string;
  value: string;
  icon: ReactNode;
  featured?: boolean;
};

function resolvePeriod(
  preview?: RequestPreviewData | null,
  request?: RequestLike | null,
  plan?: PlanDetail | null,
) {
  if (preview?.period) return preview.period;
  if (request?.period) return request.period;
  if (plan?.period) return plan.period;
  const fromPlanPeriod = preview?.planPeriod || request?.planPeriod;
  if (fromPlanPeriod) {
    const parsed = parseInt(String(fromPlanPeriod), 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

const iconClass = 'size-3.5 shrink-0';

export function RequestSummaryBar({
  previewData,
  requestData,
  planData,
  className,
}: RequestSummaryBarProps) {
  const summary = useMemo(() => {
    const creditAmount = previewData?.creditAmount ?? requestData?.creditAmount ?? null;
    const planName = previewData?.planName ?? requestData?.planName ?? planData?.name ?? null;
    const financierName =
      previewData?.planFinancierName ??
      previewData?.financierName ??
      requestData?.planFinancierName ??
      requestData?.financierName ??
      planData?.financierName ??
      null;
    const period = resolvePeriod(previewData, requestData, planData);

    if (!creditAmount || !planName) return null;

    const planForCalc = planData ?? {
      percentage: previewData?.planPercentage
        ? Number(previewData.planPercentage)
        : planData?.percentage,
      firstBankFee: previewData?.planFirstBankFee ?? planData?.firstBankFee,
      firstSystemFee: previewData?.planFirstSystemFee ?? planData?.firstSystemFee,
      period: period ?? planData?.period,
    };

    const calc = calculateLoanSummary(creditAmount, planForCalc);
    const monthlyInstallment =
      calc?.monthlyInstallment ??
      previewData?.loanDetailAmount ??
      requestData?.loanDetailAmount ??
      null;
    const totalInterest =
      calc?.totalInterest ?? previewData?.feeAmount ?? requestData?.feeAmount ?? null;

    const stats: SummaryItem[] = [
      {
        key: 'amount',
        label: 'مبلغ درخواستی',
        value: `${formatNumber(creditAmount)} ریال`,
        icon: <Wallet className={iconClass} />,
      },
    ];

    if (monthlyInstallment != null && monthlyInstallment > 0) {
      stats.push({
        key: 'installment',
        label: 'قسط ماهانه',
        value: `${formatNumber(monthlyInstallment)} ریال`,
        icon: <Receipt className={iconClass} />,
        featured: true,
      });
    }

    if (period) {
      stats.push({
        key: 'period',
        label: 'مدت بازپرداخت',
        value: `${formatNumber(period)} ماه`,
        icon: <CalendarClock className={iconClass} />,
      });
    }

    if (totalInterest != null && totalInterest > 0) {
      stats.push({
        key: 'interest',
        label: 'سود پرداختی',
        value: `${formatNumber(totalInterest)} ریال`,
        icon: <Percent className={iconClass} />,
      });
    }

    if (financierName) {
      stats.push({
        key: 'financier',
        label: 'تامین‌کننده',
        value: financierName,
        icon: <Landmark className={iconClass} />,
      });
    }

    return { planName, stats };
  }, [previewData, requestData, planData]);

  if (!summary) return null;

  return (
    <section
      aria-label='خلاصه درخواست'
      className={cn(
        'relative mb-8 overflow-hidden rounded-2xl border border-border/70 bg-muted/30',
        className,
      )}
    >
      <div
        aria-hidden
        className='pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-foreground/4 to-transparent'
      />
      <div
        aria-hidden
        className='pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-foreground/4 blur-3xl'
      />

      <div className='relative flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-stretch lg:gap-0'>
        <div className='flex min-w-0 items-center gap-3 lg:w-55 lg:shrink-0 lg:pl-1 lg:pr-6'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-sm'>
            <span className='text-sm font-bold leading-none'>طرح</span>
          </div>
          <div className='min-w-0'>
            <div className='text-[11px] text-muted-foreground mb-0.5'>طرح انتخاب‌شده</div>
            <div className='truncate text-base font-bold tracking-tight' title={summary.planName}>
              {summary.planName}
            </div>
          </div>
        </div>

        <div className='hidden w-px bg-border/80 lg:block' />
        <div className='h-px bg-border/80 lg:hidden' />

        <div className='grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-none lg:flex lg:items-stretch'>
          {summary.stats.map(item => (
            <div
              key={item.key}
              className={cn(
                'min-w-0 rounded-xl px-3 py-2.5 lg:flex-1 lg:rounded-none lg:px-4 lg:py-0 lg:flex lg:flex-col lg:justify-center',
                item.featured
                  ? 'bg-background/80 ring-1 ring-foreground/8 lg:bg-transparent lg:ring-0'
                  : 'bg-transparent',
              )}
            >
              <div className='mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground'>
                <span className='opacity-70'>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <div
                className={cn(
                  'truncate text-sm leading-6',
                  item.featured ? 'font-bold text-foreground' : 'font-medium text-foreground/90',
                )}
                title={item.value}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
