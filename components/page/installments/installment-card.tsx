<<<<<<< HEAD
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
    form.action = `https://panel.aqayepardakht.ir/startpay/${token}`;
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
    document.body.removeChild(form);
  };

  const paidCount = loan.loanDetails.filter(d => d.loanDetailStatus === 1).length;
  const totalCount = loan.loanDetails.length;

  return (
    <Accordion type='single' collapsible className='w-full'>
      <AccordionItem
        value={`loan-${loan.id}`}
        className='border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow'
      >
        {/* Header Section as Accordion Trigger */}
        <AccordionTrigger className='hover:no-underline p-0 pl-3 [&[data-state=open]>div]:rounded-b-none [&>svg]:my-auto '>
          <div className='w-full bg-gray-50 border-b border-gray-200 p-4 md:p-6' dir='rtl'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-brand rounded-lg'>
                  <svg
                    className='w-5 h-5 text-white'
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
                  <p className='text-xs text-gray-600'>شماره درخواست</p>
                  <p className='text-sm md:text-base font-bold text-gray-800'>
                    {loan.requestRequestNumber}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <div className='bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm'>
                  <span className='text-xs text-gray-600'>پرداخت شده: </span>
                  <span className='text-sm font-bold text-brand'>{paidCount}</span>
                  <span className='text-xs text-gray-500'> از </span>
                  <span className='text-sm font-bold text-gray-700'>{totalCount}</span>
                </div>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className='p-0'>
          {/* Stats Grid */}
          <div className='p-4 md:p-6 bg-white border-b border-gray-100' dir='rtl'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4'>
              {/* Credit Amount */}
              <div className='bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200'>
                <div className='flex items-center gap-2 mb-1'>
                  <DollarSign className='w-4 h-4 text-emerald-600' />
                  <h3 className='text-xs text-gray-600'>مبلغ اعتبار</h3>
                </div>
                <p className='text-sm md:text-base font-bold text-gray-900'>
                  {formatPrice(loan.amount)} ریال
                </p>
              </div>

              {/* Last Payment */}
              <div className='bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200'>
                <div className='flex items-center gap-2 mb-1'>
                  <Calendar className='w-4 h-4 text-blue-600' />
                  <h3 className='text-xs text-gray-600'>تاریخ آخرین قسط</h3>
                </div>
                <p className='text-sm md:text-base font-semibold text-gray-900'>
                  {formatDate(loan.lastInstallmentDate || '')}
                </p>
              </div>

              {/* Next Payment */}
              <div className='bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200'>
                <div className='flex items-center gap-2 mb-1'>
                  <Clock className='w-4 h-4 text-red-600' />
                  <h3 className='text-xs text-gray-600'>نزدیک‌ترین قسط</h3>
                </div>
                <p className='text-sm md:text-base font-semibold text-gray-900'>
                  {formatDate(loan.nearInstallmentDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Installments Accordion */}
          <div className='p-4 md:p-6 bg-white' dir='rtl'>
            <h3 className='text-sm font-semibold text-gray-700 mb-3'>جزئیات اقساط</h3>
            <Accordion type='single' collapsible className='w-full space-y-3'>
              {loan.loanDetails.map((installment, idx) => (
                <AccordionItem
                  key={installment.id}
                  value={`installment-${installment.id}`}
                  className={cn(
                    'border rounded-lg overflow-hidden',
                    installment.loanDetailStatus === 1
                      ? 'border-green-300 bg-green-50'
                      : 'bg-gray-100',
                  )}
                >
                  <AccordionTrigger className='px-3 md:px-4 py-3 hover:no-underline'>
                    <div className='flex items-center gap-3 flex-1'>
                      {/* Number Badge */}
                      <div
                        className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white flex-shrink-0',
                          installment.loanDetailStatus === 1 ? 'bg-green-600' : 'bg-yellow-400',
                        )}
                      >
                        {idx + 1}
                      </div>

                      {/* Title & Status */}
                      <div className='flex-1 text-right'>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                          <span className='text-sm md:text-base font-semibold text-gray-800'>
                            قسط شماره {idx + 1}
                          </span>
                          <div
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                              installment.loanDetailStatus === 1
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-orange-100 text-orange-700 border border-orange-200',
                            )}
                          >
                            {installment.loanDetailStatus === 1 ? (
                              <>
                                <Check className='w-3 h-3' />
                                پرداخت شده
                              </>
                            ) : (
                              <>
                                <X className='w-3 h-3' />
                                پرداخت نشده
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>{' '}
                  <AccordionContent className='px-3 md:px-4 pb-3'>
                    <div className='bg-white rounded-lg p-3 md:p-4 border border-gray-200'>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4'>
                        {/* Amount */}
                        <div className='space-y-1'>
                          <p className='text-xs text-gray-600'>مبلغ قسط</p>
                          <p className='text-sm md:text-base font-bold text-gray-900'>
                            {formatPrice(installment.amount)} ریال
                          </p>
                        </div>

                        {/* Due Date */}
                        <div className='space-y-1'>
                          <p className='text-xs text-gray-600'>تاریخ سررسید</p>
                          <p className='text-sm md:text-base font-semibold text-gray-800'>
                            {formatDate(installment.dueDate)}
                          </p>
                        </div>

                        {/* Payment Date */}
                        <div className='space-y-1'>
                          <p className='text-xs text-gray-600'>تاریخ پرداخت</p>
                          <p className='text-sm md:text-base font-semibold text-gray-800'>
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
=======
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
    form.action = `https://panel.aqayepardakht.ir/startpay/${token}`;
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
    document.body.removeChild(form);
  };

  const paidCount = loan.loanDetails.filter(d => d.loanDetailStatus === 1).length;
  const totalCount = loan.loanDetails.length;

  return (
    <Accordion type='single' collapsible className='w-full'>
      <AccordionItem
        value={`loan-${loan.id}`}
        className='border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow'
      >
        {/* Header Section as Accordion Trigger */}
        <AccordionTrigger className='hover:no-underline p-0 pl-3 [&[data-state=open]>div]:rounded-b-none [&>svg]:my-auto '>
          <div className='w-full bg-gray-50 border-b border-gray-200 p-4 md:p-6' dir='rtl'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-brand rounded-lg'>
                  <svg
                    className='w-5 h-5 text-white'
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
                  <p className='text-xs text-gray-600'>شماره درخواست</p>
                  <p className='text-sm md:text-base font-bold text-gray-800'>
                    {loan.requestRequestNumber}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <div className='bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm'>
                  <span className='text-xs text-gray-600'>پرداخت شده: </span>
                  <span className='text-sm font-bold text-brand'>{paidCount}</span>
                  <span className='text-xs text-gray-500'> از </span>
                  <span className='text-sm font-bold text-gray-700'>{totalCount}</span>
                </div>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className='p-0'>
          {/* Stats Grid */}
          <div className='p-4 md:p-6 bg-white border-b border-gray-100' dir='rtl'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4'>
              {/* Credit Amount */}
              <div className='bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200'>
                <div className='flex items-center gap-2 mb-1'>
                  <DollarSign className='w-4 h-4 text-emerald-600' />
                  <h3 className='text-xs text-gray-600'>مبلغ اعتبار</h3>
                </div>
                <p className='text-sm md:text-base font-bold text-gray-900'>
                  {formatPrice(loan.amount)} ریال
                </p>
              </div>

              {/* Last Payment */}
              <div className='bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200'>
                <div className='flex items-center gap-2 mb-1'>
                  <Calendar className='w-4 h-4 text-blue-600' />
                  <h3 className='text-xs text-gray-600'>تاریخ آخرین قسط</h3>
                </div>
                <p className='text-sm md:text-base font-semibold text-gray-900'>
                  {formatDate(loan.lastInstallmentDate || '')}
                </p>
              </div>

              {/* Next Payment */}
              <div className='bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200'>
                <div className='flex items-center gap-2 mb-1'>
                  <Clock className='w-4 h-4 text-red-600' />
                  <h3 className='text-xs text-gray-600'>نزدیک‌ترین قسط</h3>
                </div>
                <p className='text-sm md:text-base font-semibold text-gray-900'>
                  {formatDate(loan.nearInstallmentDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Installments Accordion */}
          <div className='p-4 md:p-6 bg-white' dir='rtl'>
            <h3 className='text-sm font-semibold text-gray-700 mb-3'>جزئیات اقساط</h3>
            <Accordion type='single' collapsible className='w-full space-y-3'>
              {loan.loanDetails.map((installment, idx) => (
                <AccordionItem
                  key={installment.id}
                  value={`installment-${installment.id}`}
                  className={cn(
                    'border rounded-lg overflow-hidden',
                    installment.loanDetailStatus === 1
                      ? 'border-green-300 bg-green-50'
                      : 'bg-gray-100',
                  )}
                >
                  <AccordionTrigger className='px-3 md:px-4 py-3 hover:no-underline'>
                    <div className='flex items-center gap-3 flex-1'>
                      {/* Number Badge */}
                      <div
                        className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white flex-shrink-0',
                          installment.loanDetailStatus === 1 ? 'bg-green-600' : 'bg-yellow-400',
                        )}
                      >
                        {idx + 1}
                      </div>

                      {/* Title & Status */}
                      <div className='flex-1 text-right'>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                          <span className='text-sm md:text-base font-semibold text-gray-800'>
                            قسط شماره {idx + 1}
                          </span>
                          <div
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                              installment.loanDetailStatus === 1
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-orange-100 text-orange-700 border border-orange-200',
                            )}
                          >
                            {installment.loanDetailStatus === 1 ? (
                              <>
                                <Check className='w-3 h-3' />
                                پرداخت شده
                              </>
                            ) : (
                              <>
                                <X className='w-3 h-3' />
                                پرداخت نشده
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>{' '}
                  <AccordionContent className='px-3 md:px-4 pb-3'>
                    <div className='bg-white rounded-lg p-3 md:p-4 border border-gray-200'>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4'>
                        {/* Amount */}
                        <div className='space-y-1'>
                          <p className='text-xs text-gray-600'>مبلغ قسط</p>
                          <p className='text-sm md:text-base font-bold text-gray-900'>
                            {formatPrice(installment.amount)} ریال
                          </p>
                        </div>

                        {/* Due Date */}
                        <div className='space-y-1'>
                          <p className='text-xs text-gray-600'>تاریخ سررسید</p>
                          <p className='text-sm md:text-base font-semibold text-gray-800'>
                            {formatDate(installment.dueDate)}
                          </p>
                        </div>

                        {/* Payment Date */}
                        <div className='space-y-1'>
                          <p className='text-xs text-gray-600'>تاریخ پرداخت</p>
                          <p className='text-sm md:text-base font-semibold text-gray-800'>
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
>>>>>>> a47b58a (pwa)
