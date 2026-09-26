import type { PlanData, LoanCalculation } from '@/types/request-credit';

/** Slider / nudge step for requested credit amount (Rial). */
export const CREDIT_AMOUNT_STEP = 100_000_000;

type AmountBounded = { minAmount: number; maxAmount: number };

/** Overall slider bounds from all plans (min of mins, max of maxes). */
export function getPlansAmountBounds(plans: AmountBounded[]): { min: number; max: number } {
  if (!plans.length) return { min: 0, max: 0 };
  return {
    min: Math.min(...plans.map(p => p.minAmount)),
    max: Math.max(...plans.map(p => p.maxAmount)),
  };
}

/** Plans whose [minAmount, maxAmount] includes the selected credit amount. */
export function filterPlansByAmount<T extends AmountBounded>(plans: T[], amount: number): T[] {
  return plans.filter(p => amount >= p.minAmount && amount <= p.maxAmount);
}

/** Clamp and snap an amount to the nearest step within [min, max]. */
export function clampAmountToStep(
  amount: number,
  min: number,
  max: number,
  step: number = CREDIT_AMOUNT_STEP,
): number {
  if (!Number.isFinite(amount) || !Number.isFinite(min) || !Number.isFinite(max)) return min;
  if (max <= min) return min;
  const clamped = Math.min(max, Math.max(min, amount));
  if (!step || step <= 0) return clamped;
  const snapped = min + Math.round((clamped - min) / step) * step;
  return Math.min(max, Math.max(min, snapped));
}

export function calculateLoanDetails(planData: PlanData, creditAmount: number): LoanCalculation {
  if (!planData || !creditAmount) {
    return {
      originalAmount: 0,
      netAmountReceived: 0,
      totalRepaymentAmount: 0,
      monthlyInstallment: 0,
      totalInterest: 0,
      fees: {
        firstSystemFeeAmount: 0,
        firstBankFeeAmount: 0,
        duringSystemFeeAmount: 0,
        duringBankFeeAmount: 0,
        systemFeePerInstallment: 0,
        bankFeePerInstallment: 0,
        couponMainAmount: 0,
        totalFees: 0,
      },
      period: 12,
    };
  }

  const firstSystemFee = planData.firstSystemFee || 0;
  const firstBankFee = planData.firstBankFee || 0;
  const duringSystemFee = planData.duringSystemFee || 0;
  const duringBankFee = planData.duringBankFee || 0;
  const period = parseInt(String(planData.period)) || 12;

  let mainAmountByFirst = creditAmount;
  let mainAmountByDuring = creditAmount;

  let firstSystemFeeAmount = 0;
  let firstBankFeeAmount = 0;
  let duringSystemFeeAmount = 0;
  let duringBankFeeAmount = 0;

  if (firstSystemFee > 0 || firstBankFee > 0) {
    firstSystemFeeAmount = Math.round((firstSystemFee * mainAmountByFirst * period) / 1200);
    firstBankFeeAmount = Math.round((firstBankFee * mainAmountByFirst * period) / 1200);
    mainAmountByFirst = mainAmountByFirst - firstSystemFeeAmount - firstBankFeeAmount;
  }

  if (duringSystemFee > 0 || duringBankFee > 0) {
    duringSystemFeeAmount = Math.round((duringSystemFee * mainAmountByDuring * period) / 1200);
    duringBankFeeAmount = Math.round((duringBankFee * mainAmountByDuring * period) / 1200);
    mainAmountByDuring = mainAmountByDuring + duringSystemFeeAmount + duringBankFeeAmount;
  }

  const couponAmount = Math.ceil(mainAmountByDuring / period);
  const couponMainAmount = Math.ceil(creditAmount / period);

  const netAmountReceived = mainAmountByFirst;
  const totalRepaymentAmount = mainAmountByDuring;
  const monthlyInstallment = couponAmount;

  const totalFees =
    firstSystemFeeAmount + firstBankFeeAmount + duringSystemFeeAmount + duringBankFeeAmount;

  return {
    originalAmount: creditAmount,
    netAmountReceived: Math.round(netAmountReceived),
    totalRepaymentAmount: Math.round(totalRepaymentAmount),
    monthlyInstallment: Math.round(monthlyInstallment),
    totalInterest: Math.round(totalFees),
    fees: {
      firstSystemFeeAmount: Math.round(firstSystemFeeAmount),
      firstBankFeeAmount: Math.round(firstBankFeeAmount),
      duringSystemFeeAmount: Math.round(duringSystemFeeAmount),
      duringBankFeeAmount: Math.round(duringBankFeeAmount),
      systemFeePerInstallment: Math.floor(duringSystemFeeAmount / period),
      bankFeePerInstallment: Math.floor(duringBankFeeAmount / period),
      couponMainAmount: Math.round(couponMainAmount),
      totalFees: Math.round(totalFees),
    },
    period: period,
  };
}

export function calculatePMT(
  principal: number,
  annualInterestRate: number,
  totalPayments: number,
): {
  installment: number;
  total: number;
} {
  if (
    !totalPayments ||
    totalPayments <= 0 ||
    !Number.isFinite(totalPayments) ||
    !Number.isFinite(principal) ||
    !Number.isFinite(annualInterestRate)
  ) {
    return { installment: 0, total: 0 };
  }

  const r = annualInterestRate / 100 / 12;

  // Zero interest: equal principal installments (avoid 0/0 → NaN)
  if (!r) {
    const installment = principal / totalPayments;
    return {
      installment,
      total: installment * totalPayments,
    };
  }

  const factor = Math.pow(1 + r, totalPayments);
  if (!Number.isFinite(factor)) {
    return { installment: 0, total: 0 };
  }

  const numerator = principal * r * factor;
  const denominator = factor - 1;

  if (!denominator) {
    return { installment: 0, total: 0 };
  }

  const installment = numerator / denominator;

  if (!Number.isFinite(installment)) {
    return { installment: 0, total: 0 };
  }

  return {
    installment,
    total: installment * totalPayments,
  };
}

export type LoanSummaryInput = {
  percentage?: number | null;
  firstBankFee?: number | null;
  firstSystemFee?: number | null;
  duringBankFee?: number | null;
  duringSystemFee?: number | null;
  period?: number | null;
};

export type LoanSummary = {
  monthlyInstallment: number;
  totalRepayment: number;
  totalInterest: number;
  netReceived: number;
};

/** Shared installment summary used by homepage + credit-request calculators. */
export function calculateLoanSummary(
  creditAmount: number,
  plan: LoanSummaryInput | null | undefined,
): LoanSummary | null {
  if (!plan || !creditAmount || !Number.isFinite(creditAmount)) {
    return null;
  }

  const interestRate = (plan?.duringBankFee ?? 0) + (plan?.duringSystemFee ?? 0);
  const firstFeeRate = (plan.firstBankFee ?? 0) + (plan.firstSystemFee ?? 0);
  const period = plan.period ?? 0;

  if (!period || period <= 0 || !Number.isFinite(period) || !Number.isFinite(firstFeeRate)) {
    return null;
  }

  const result = calculatePMT(creditAmount, interestRate, period);
  const receivedAmount = creditAmount - (creditAmount * firstFeeRate) / 100;

  const summary: LoanSummary = {
    monthlyInstallment: Math.round(result.installment),
    totalRepayment: Math.round(result.total),
    totalInterest: Math.round(result.total - creditAmount),
    netReceived: Math.round(receivedAmount),
  };

  if (
    !Number.isFinite(summary.monthlyInstallment) ||
    !Number.isFinite(summary.totalRepayment) ||
    !Number.isFinite(summary.totalInterest) ||
    !Number.isFinite(summary.netReceived)
  ) {
    return null;
  }

  return summary;
}
