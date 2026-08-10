'use client';

import { useEffect, useState, useMemo, useRef, startTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { calculateLoanSummary } from '@/utils/loan-calculator';
import { formatNumber } from '@/utils/format';
import { type PlanDetail } from '@/api/plan';
import { getFinancierPlansQueryOptions } from '@/queries/plan';
import { Slider } from '@/components/ui/slider';
import { CreditModal } from '@/components/page/landing/credit-modal';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';

import { useRouter } from '@/i18n/navigation';

interface CalculatorProps {
  onRequestCredit?: (plan: PlanDetail | null, amount: number) => void;
}

export function Calculator({ onRequestCredit }: CalculatorProps) {
  const [value, setValue] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinkConfirmOpen, setIsLinkConfirmOpen] = useState(false);
  const isInitializedRef = useRef(false);
  const { data: financierPlansData } = useQuery(getFinancierPlansQueryOptions());
  const router = useRouter();
  const financiers = useMemo(() => {
    return financierPlansData?.plans || [];
  }, [financierPlansData?.plans]);

  // Initialize with first plan when data loads
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

  const handleRequestCredit = () => {
    if (hasExternalLink) {
      setIsLinkConfirmOpen(true);
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

  const handleGetCreditConfirm = () => {
    const link = selectedPlan?.link;
    if (!link) {
      toast.error('لینک دریافت اعتبار موجود نیست');
      return;
    }
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const installmentAmount = loanCalculation?.monthlyInstallment ?? 0;
  const totalPayable = loanCalculation?.totalRepayment ?? 0;
  const totalInterest = loanCalculation?.totalInterest ?? 0;
  const totalRecived = loanCalculation?.netReceived ?? 0;

  const minAmount = selectedPlan ? selectedPlan.minAmount : 0;
  const maxAmount = selectedPlan ? selectedPlan.maxAmount : 0;

  const sliderPercentage =
    maxAmount > minAmount ? ((value - minAmount) / (maxAmount - minAmount)) * 100 : 0;

  return (
    <div className='flex flex-col lg:flex-row gap-6 lg:gap-10 px-4 sm:px-6 md:px-8 lg:px-10 xl:pl-20 xl:pr-10 mb-10 border-t border-gray-100 justify-center'>
      {/* Left Section - Calculator Controls */}
      <div className='w-full lg:w-3/5 pt-8 lg:pt-12'>
        <div className='font-bold text-lg sm:text-xl mb-3 sm:mb-5'>نمایشگر اقساط</div>
        <div className='text-base sm:text-lg text-[#454545] mb-8 sm:mb-12 lg:mb-[75px]'>
          لطفا مبلغ درخواستی و مدت بازپرداخت را انتخاب کنید.
        </div>

        {/* Amount Selector */}
        {selectedPlan && (
          <div
            key={selectedPlan.id}
            className='pr-4 sm:pr-6 md:pr-8 lg:pr-11 bg-pink-light p-3 sm:p-4 rounded-lg border border-[#F5F0FF]'
          >
            <div className='mb-8 sm:mb-10 lg:mb-12 text-light-text text-sm sm:text-base'>
              مبلغ مورد نظر
            </div>
            <div className='flex flex-col'>
              <div className='relative mb-8'>
                <div
                  className='absolute transform -translate-x-1/2 -translate-y-full'
                  style={{
                    left: `calc(${sliderPercentage}%)`,
                    top: '-32px',
                  }}
                >
                  <div
                    className={cn(
                      'text-[#3F455D] bg-white px-3 py-1 rounded-lg text-xs sm:text-sm font-bold relative shadow-sm border border-gray-200',
                    )}
                  >
                    {formatNumber(value.toString())}
                  </div>
                </div>
              </div>
              <Slider
                dir='ltr'
                min={selectedPlan.minAmount}
                max={selectedPlan.maxAmount}
                step={10000000}
                value={[value]}
                onValueChange={handleSliderChange}
                className='w-full'
              />
              <div className='text-sm sm:text-base lg:text-lg text-purple-darker flex justify-between w-full pt-2'>
                <div>{formatNumber(selectedPlan.maxAmount.toString())}</div>
                <div>{formatNumber(selectedPlan.minAmount.toString())}</div>
              </div>
            </div>
          </div>
        )}

        <div className='pr-4 sm:pr-6 md:pr-8 lg:pr-11 bg-pink-light p-3 sm:p-4 rounded-lg border border-[#F5F0FF] mt-4 sm:mt-6 lg:mt-9'>
          <div className='text-light-text text-xs sm:text-sm mb-3'>طرح ها</div>
          <div className='flex flex-wrap gap-2'>
            {financiers.map(item => {
              return (
                item.isActive && (
                  <button
                    key={item.id}
                    className={cn(
                      'text-xs px-2 py-2 flex-shrink-0 rounded transition-colors',
                      item?.id === selectedPlan?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                    )}
                    onClick={() => handlePlanClick(item)}
                  >
                    {item?.name}
                  </button>
                )
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Section - Results */}
      <div className='w-full lg:w-2/3 max-w-[545px] mx-auto lg:mx-0 mt-8 lg:mt-[87px]'>
        <div className='p-4 sm:p-5 lg:p-[17px] px-4 sm:px-5 calculator-shadow rounded-2xl h-full'>
          {/* Logo */}
          <div className='mb-8 sm:mb-12 lg:mb-[74px]'>
            <Image
              className='w-28 sm:w-36 lg:w-44'
              src='/logos/logo.png'
              alt='Logo'
              width={144}
              height={48}
            />
          </div>

          {/* Calculation Results */}
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

          {/* CTA Button */}
          <div className='w-full mt-8 sm:mt-12 lg:mt-16 flex items-end'>
            <button
              className='w-full bg-secondary-green text-white h-12 sm:h-14 rounded text-sm sm:text-base font-medium transition-colors bg-primary hover:bg-green-600'
              onClick={handleRequestCredit}
            >
              {hasExternalLink ? 'دریافت اعتبار' : 'درخواست اعتبار'}
            </button>
          </div>
        </div>
      </div>

      {/* Credit Modal */}
      <CreditModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        price={selectedPlan?.firstSystemFee}
        onConfirm={handleModalConfirm}
        isCheckRequired={selectedPlan?.guarantees?.includes('چک')}
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
