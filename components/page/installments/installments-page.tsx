<<<<<<< HEAD
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
          <h1 className='text-2xl font-bold text-right text-gray-800'>اقساط من</h1>
        </div>
        <InstallmentsListSkeleton />
      </div>
    );
  }

  if (!loans || loans.length === 0) {
    return (
      <div className='w-full pt-10'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'>
          <div className='flex flex-col items-center gap-4'>
            <div className='p-4 bg-gray-100 rounded-full'>
              <svg
                className='w-16 h-16 text-gray-400'
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
            <p className='text-xl text-gray-700 font-semibold'>درخواست تایید شده‌ای وجود ندارد</p>
            <p className='text-gray-500 text-sm max-w-md'>
              پس از تایید درخواست وام شما، اقساط در اینجا نمایش داده می‌شود
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full '>
      <div className='mb-10 flex items-center justify-between'>
        <div></div>
        <div className='text-sm text-gray-600'>
          تعداد: <span className='font-semibold'>{loans.length}</span> اعتبار
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
=======
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
          <h1 className='text-2xl font-bold text-right text-gray-800'>اقساط من</h1>
        </div>
        <InstallmentsListSkeleton />
      </div>
    );
  }

  if (!loans || loans.length === 0) {
    return (
      <div className='w-full pt-10'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'>
          <div className='flex flex-col items-center gap-4'>
            <div className='p-4 bg-gray-100 rounded-full'>
              <svg
                className='w-16 h-16 text-gray-400'
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
            <p className='text-xl text-gray-700 font-semibold'>درخواست تایید شده‌ای وجود ندارد</p>
            <p className='text-gray-500 text-sm max-w-md'>
              پس از تایید درخواست وام شما، اقساط در اینجا نمایش داده می‌شود
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full '>
      <div className='mb-10 flex items-center justify-between'>
        <div></div>
        <div className='text-sm text-gray-600'>
          تعداد: <span className='font-semibold'>{loans.length}</span> اعتبار
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
>>>>>>> a47b58a (pwa)
