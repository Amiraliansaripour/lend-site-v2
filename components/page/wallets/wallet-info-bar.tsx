'use client';

import { User, Calendar } from 'lucide-react';
import { formatJalaliDate } from '@/utils/format';
import { normalizeToPersianDigits } from '@/utils/normalize';

export function WalletInfoBar() {
  // Get user info from localStorage
  const localUserInfo = typeof window !== 'undefined' ? localStorage.getItem('USER_INFO') : null;
  const parsedUserInfo = localUserInfo ? JSON.parse(localUserInfo) : null;

  const phone = parsedUserInfo?.personInfo?.phoneNumber || '';
  const replaceMobile = phone?.replace('+98', '0');

  const currentDate = formatJalaliDate(new Date(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className='hidden md:flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6'>
      <div className='flex items-center gap-3'>
        <div className='text-gray-600'>
          <User size={24} />
        </div>
        <div className='font-medium text-gray-800'>{normalizeToPersianDigits(replaceMobile)}</div>
      </div>
      <div className='flex items-center gap-3'>
        <div className='text-gray-600'>
          <Calendar size={24} />
        </div>
        <div className='font-medium text-gray-800'>{currentDate}</div>
      </div>
    </div>
  );
}
