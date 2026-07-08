import type { PlanData, LoanCalculation } from '@/types/request-credit';

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
  const r = annualInterestRate / 100 / 12;

  const numerator = principal * r * Math.pow(1 + r, totalPayments);
  const denominator = Math.pow(1 + r, totalPayments) - 1;

  const installment = numerator / denominator;

  return {
    installment: installment,
    total: installment * totalPayments,
  };
}
