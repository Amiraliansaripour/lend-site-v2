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
    <div className='mb-6 hidden items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm md:flex'>
      <div className='flex items-center gap-3'>
        <div className='text-primary/70'>
          <User size={24} />
        </div>
        <div className='font-medium text-foreground'>{normalizeToPersianDigits(replaceMobile)}</div>
      </div>
      <div className='flex items-center gap-3'>
        <div className='text-primary/70'>
          <Calendar size={24} />
        </div>
        <div className='font-medium text-foreground'>{currentDate}</div>
      </div>
    </div>
  );
}
