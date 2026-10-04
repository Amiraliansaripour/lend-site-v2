'use client';

import { InstallmentCard } from './installment-card';
import { InstallmentsListSkeleton } from './installment-skeleton';
import type { LoanHeader } from './installments-types';

type InstallmentsPageProps = {
  loans: LoanHeader[];
  isLoading?: boolean;
};

export function InstallmentsPage({ loans, isLoading }: InstallmentsPageProps) {
  if (isLoading) {
    return (
      <div className='w-full pt-10'>
        <div className='mb-10'>
          <h1 className='text-right text-2xl font-bold text-foreground'>اقساط من</h1>
        </div>
        <InstallmentsListSkeleton />
      </div>
    );
  }

  if (!loans || loans.length === 0) {
    return (
      <div className='w-full pt-10'>
        <div className='rounded-xl border border-border bg-card p-12 text-center shadow-sm'>
          <div className='flex flex-col items-center gap-4'>
            <div className='rounded-full bg-primary/10 p-4'>
              <svg
                className='h-16 w-16 text-primary/60'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <p className='text-xl font-semibold text-foreground'>درخواست تایید شده‌ای وجود ندارد</p>
            <p className='max-w-md text-sm text-muted-foreground'>
              پس از تایید درخواست وام شما، اقساط در اینجا نمایش داده می‌شود
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <div className='mb-10 flex items-center justify-between'>
        <div />
        <div className='text-sm text-muted-foreground'>
          تعداد: <span className='font-semibold text-foreground'>{loans.length}</span> اعتبار
        </div>
      </div>

      <div className='space-y-6'>
        {loans.map(loan => (
          <InstallmentCard key={loan.id} loan={loan} />
        ))}
      </div>
    </div>
  );
}
