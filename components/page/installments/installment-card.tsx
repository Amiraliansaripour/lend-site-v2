'use client';

import { useState } from 'react';
import { Check, X, Banknote, Calendar, DollarSign, Clock } from 'lucide-react';

import type { LoanHeader } from './installments-types';
import { usePaymentToken } from '@/queries/installments';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type InstallmentCardProps = {
  loan: LoanHeader;
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(amount);
}

function formatDate(dateString: string): string {
  if (!dateString || dateString === '0001-01-01T00:00:00') return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR').format(date);
}

export function InstallmentCard({ loan }: InstallmentCardProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const paymentMutation = usePaymentToken();

  const isAnyPaymentLoading = Object.values(loadingStates).some(Boolean);

  const handlePayment = async (loanDetailId: string) => {
    setLoadingStates(prev => ({ ...prev, [loanDetailId]: true }));

    try {
      const paymentData = await paymentMutation.mutateAsync({ loanDetailId, payType: 1 });
      redirectToPayment(paymentData.token, paymentData.terminalID, paymentData.merchantId);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [loanDetailId]: false }));
    }
  };

  const redirectToPayment = (token: string, terminalID: string, merchantId: string) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://rt.sizpay.ir/Route/Payment';
    // form.action = `https://panel.aqayepardakht.ir/startpay/${token}`;
    form.target = '_self';

    const fields = [
      { name: 'MerchantID', value: merchantId },
      { name: 'TerminalID', value: terminalID },
      { name: 'Token', value: token },
    ];

    fields.forEach(({ name, value }) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    form.remove();
  };

  const paidCount = loan.loanDetails.filter(d => d.loanDetailStatus === 1).length;
  const totalCount = loan.loanDetails.length;

  return (
    <Accordion type='single' collapsible className='w-full'>
      <AccordionItem
        value={`loan-${loan.id}`}
        className='overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md'
      >
        {/* Header Section as Accordion Trigger */}
        <AccordionTrigger className='hover:no-underline p-0 pl-3 [&[data-state=open]>div]:rounded-b-none [&>svg]:my-auto '>
          <div className='w-full border-b border-border bg-muted/50 p-4 md:p-6' dir='rtl'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='rounded-lg bg-primary/10 p-2'>
                  <svg
                    className='h-5 w-5 text-primary'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                </div>
                <div className='text-right'>
                  <p className='text-xs text-muted-foreground'>شماره درخواست</p>
                  <p className='text-sm font-bold text-foreground md:text-base'>
                    {loan.requestRequestNumber}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <div className='rounded-lg border border-border bg-card px-3 py-1.5 shadow-sm'>
                  <span className='text-xs text-muted-foreground'>پرداخت شده: </span>
                  <span className='text-sm font-bold text-primary'>{paidCount}</span>
                  <span className='text-xs text-muted-foreground'> از </span>
                  <span className='text-sm font-bold text-foreground'>{totalCount}</span>
                </div>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className='p-0'>
          {/* Stats Grid */}
          <div className='border-b border-border bg-card p-4 md:p-6' dir='rtl'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4'>
              {/* Credit Amount */}
              <div className='rounded-lg border border-border bg-muted/40 p-3 md:p-4'>
                <div className='mb-1 flex items-center gap-2'>
                  <DollarSign className='h-4 w-4 text-emerald-600' />
                  <h3 className='text-xs text-muted-foreground'>مبلغ اعتبار</h3>
                </div>
                <p className='text-sm font-bold text-foreground md:text-base'>
                  {formatPrice(loan.amount)} ریال
                </p>
              </div>

              {/* Last Payment */}
              <div className='rounded-lg border border-border bg-muted/40 p-3 md:p-4'>
                <div className='mb-1 flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-primary' />
                  <h3 className='text-xs text-muted-foreground'>تاریخ آخرین قسط</h3>
                </div>
                <p className='text-sm font-semibold text-foreground md:text-base'>
                  {formatDate(loan.lastInstallmentDate || '')}
                </p>
              </div>

              {/* Next Payment */}
              <div className='rounded-lg border border-border bg-muted/40 p-3 md:p-4'>
                <div className='mb-1 flex items-center gap-2'>
                  <Clock className='h-4 w-4 text-red-600' />
                  <h3 className='text-xs text-muted-foreground'>نزدیک‌ترین قسط</h3>
                </div>
                <p className='text-sm font-semibold text-foreground md:text-base'>
                  {formatDate(loan.nearInstallmentDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Installments Accordion */}
          <div className='bg-card p-4 md:p-6' dir='rtl'>
            <h3 className='mb-3 text-sm font-semibold text-foreground'>جزئیات اقساط</h3>
            <Accordion type='single' collapsible className='w-full space-y-3'>
              {loan.loanDetails.map((installment, idx) => (
                <AccordionItem
                  key={installment.id}
                  value={`installment-${installment.id}`}
                  className={cn(
                    'overflow-hidden rounded-lg border',
                    installment.loanDetailStatus === 1
                      ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                      : 'border-border bg-muted/50',
                  )}
                >
                  <AccordionTrigger className='px-3 py-3 hover:no-underline md:px-4'>
                    <div className='flex flex-1 items-center gap-3'>
                      {/* Number Badge */}
                      <div
                        className={cn(
                          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                          installment.loanDetailStatus === 1 ? 'bg-emerald-600' : 'bg-primary/70',
                        )}
                      >
                        {idx + 1}
                      </div>

                      {/* Title & Status */}
                      <div className='flex-1 text-right'>
                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                          <span className='text-sm font-semibold text-foreground md:text-base'>
                            قسط شماره {idx + 1}
                          </span>
                          <div
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                              installment.loanDetailStatus === 1
                                ? 'border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300'
                                : 'border border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300',
                            )}
                          >
                            {installment.loanDetailStatus === 1 ? (
                              <>
                                <Check className='h-3 w-3' />
                                پرداخت شده
                              </>
                            ) : (
                              <>
                                <X className='h-3 w-3' />
                                پرداخت نشده
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>{' '}
                  <AccordionContent className='px-3 pb-3 md:px-4'>
                    <div className='rounded-lg border border-border bg-card p-3 md:p-4'>
                      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4'>
                        {/* Amount */}
                        <div className='space-y-1'>
                          <p className='text-xs text-muted-foreground'>مبلغ قسط</p>
                          <p className='text-sm font-bold text-foreground md:text-base'>
                            {formatPrice(installment.amount)} ریال
                          </p>
                        </div>

                        {/* Due Date */}
                        <div className='space-y-1'>
                          <p className='text-xs text-muted-foreground'>تاریخ سررسید</p>
                          <p className='text-sm font-semibold text-foreground md:text-base'>
                            {formatDate(installment.dueDate)}
                          </p>
                        </div>

                        {/* Payment Date */}
                        <div className='space-y-1'>
                          <p className='text-xs text-muted-foreground'>تاریخ پرداخت</p>
                          <p className='text-sm font-semibold text-foreground md:text-base'>
                            {formatDate(installment.payedAt || '')}
                          </p>
                        </div>

                        {/* Payment Button */}
                        {installment.loanDetailStatus !== 1 && (
                          <div className='flex items-end'>
                            <button
                              onClick={() => handlePayment(installment.id)}
                              disabled={isAnyPaymentLoading && !loadingStates[installment.id]}
                              className='w-full bg-green-500 text-white px-4 py-2 md:py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg'
                            >
                              {loadingStates[installment.id] ? (
                                <div className='flex items-center justify-center gap-2'>
                                  <div className='animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full' />
                                  <span>در حال پردازش...</span>
                                </div>
                              ) : (
                                <div className='flex items-center justify-center gap-2'>
                                  <Banknote className='w-4 h-4' />
                                  <span>پرداخت آنلاین</span>
                                </div>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
