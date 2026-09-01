'use client';

import { useMemo } from 'react';
import { Banknote, CalendarClock, Coins, Percent, Receipt, Wallet } from 'lucide-react';
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
  loanDetailAmount?: number | null;
  feeAmount?: number | null;
  totalRefundAmount?: number | null;
};

interface RequestSummaryBarProps {
  previewData?: RequestPreviewData | null;
  requestData?: RequestLike | null;
  planData?: PlanDetail | null;
  className?: string;
}

type SummaryItem = {
  key: 'amount' | 'installment' | 'received' | 'interest' | 'total' | 'period';
  label: string;
  value: string;
  featured?: boolean;
};

function firstPositiveAmount(...values: Array<number | null | undefined>): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  }
  return null;
}

function resolvePeriod(
  preview?: RequestPreviewData | null,
  request?: RequestLike | null,
  plan?: PlanDetail | null,
) {
  return firstPositiveAmount(
    preview?.period,
    request?.period,
    plan?.period,
    preview?.planPeriod ? Number(preview.planPeriod) : null,
    request?.planPeriod ? Number(request.planPeriod) : null,
  );
}

function formatRial(value: number) {
  return `${formatNumber(value)} ریال`;
}

const STAT_ICONS = {
  amount: Wallet,
  installment: Receipt,
  received: Banknote,
  interest: Percent,
  total: Coins,
  period: CalendarClock,
} as const;

export function RequestSummaryBar({
  previewData,
  requestData,
  planData,
  className,
}: RequestSummaryBarProps) {
  const summary = useMemo(() => {
    const planName = previewData?.planName || requestData?.planName || planData?.name || null;
    const creditAmount = firstPositiveAmount(previewData?.creditAmount, requestData?.creditAmount);
    const period = resolvePeriod(previewData, requestData, planData);

    // Same calculator as the previous step, only when full plan data exists
    const calc = creditAmount && planData ? calculateLoanSummary(creditAmount, planData) : null;

    const monthlyInstallment = firstPositiveAmount(
      calc?.monthlyInstallment,
      previewData?.loanDetailAmount,
      requestData?.loanDetailAmount,
    );
    const netReceived = firstPositiveAmount(calc?.netReceived);
    const totalInterest = firstPositiveAmount(
      calc?.totalInterest,
      previewData?.feeAmount,
      requestData?.feeAmount,
    );
    const totalRepayment = firstPositiveAmount(
      calc?.totalRepayment,
      previewData?.totalRefundAmount,
      requestData?.totalRefundAmount,
    );

    if (!planName && !creditAmount) return null;

    const stats: SummaryItem[] = [];

    if (creditAmount) {
      stats.push({
        key: 'amount',
        label: 'مبلغ درخواستی',
        value: formatRial(creditAmount),
      });
    }

    if (monthlyInstallment) {
      stats.push({
        key: 'installment',
        label: 'قسط ماهانه',
        value: formatRial(monthlyInstallment),
        featured: true,
      });
    }

    if (netReceived && netReceived !== creditAmount) {
      stats.push({
        key: 'received',
        label: 'اعتبار دریافتی',
        value: formatRial(netReceived),
      });
    }

    if (totalInterest) {
      stats.push({
        key: 'interest',
        label: 'سود پرداختی',
        value: formatRial(totalInterest),
      });
    }

    if (totalRepayment) {
      stats.push({
        key: 'total',
        label: 'جمع کل اقساط',
        value: formatRial(totalRepayment),
      });
    }

    if (period) {
      stats.push({
        key: 'period',
        label: 'مدت بازپرداخت',
        value: `${formatNumber(period)} ماه`,
      });
    }

    if (!planName && stats.length === 0) return null;

    return { planName, stats };
  }, [previewData, requestData, planData]);

  if (!summary) return null;

  return (
    <section
      aria-label='خلاصه درخواست'
      className={cn('relative mb-8 rounded-2xl border border-border/70 bg-muted/30', className)}
    >
      <div
        aria-hidden
        className='pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-foreground/4 blur-3xl'
      />

      <div className='relative flex items-center gap-4 overflow-x-auto p-4 sm:p-5'>
        <div className='flex shrink-0 items-center gap-3 pl-1'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-sm'>
            <span className='text-sm font-bold leading-none'>طرح</span>
          </div>
          <div className='max-w-44'>
            <div className='text-[11px] text-muted-foreground mb-0.5'>طرح انتخاب‌شده</div>
            <div
              className='truncate text-sm font-bold tracking-tight'
              title={summary.planName ?? undefined}
            >
              {summary.planName || '—'}
            </div>
          </div>
        </div>

        <div className='h-10 w-px shrink-0 bg-border/80' />

        <div className='flex flex-1 items-center justify-between'>
          {summary.stats.map((item, index) => {
            const Icon = STAT_ICONS[item.key];
            return (
              <div
                key={item.key}
                className={cn('min-w-0 flex-1 px-4', index > 0 && 'border-r border-border/70')}
              >
                <div className='mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground'>
                  <Icon className='size-3.5 shrink-0 opacity-70' />
                  <span className='truncate'>{item.label}</span>
                </div>
                <div
                  className={cn(
                    'text-sm leading-6 whitespace-nowrap',
                    item.featured ? 'font-bold text-foreground' : 'font-medium text-foreground/90',
                  )}
                >
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
