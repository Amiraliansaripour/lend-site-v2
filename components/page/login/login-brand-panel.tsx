'use client';

import Image from 'next/image';

import { BoomPercentMark } from '@/components/page/landing/landing-hero';
import { useSiteTemplate } from '@/providers/site-template';

export function LoginBrandPanel() {
  const { brandName, getImageUrl } = useSiteTemplate();
  const logoUrl = getImageUrl('logo') || getImageUrl('darkLogo');

  return (
    <div className='hidden flex-col items-center justify-center text-center lg:flex'>
      <div className='relative mb-8'>
        <div aria-hidden className='absolute -inset-8 rounded-full bg-brand/10 blur-2xl' />
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={brandName}
            width={120}
            height={120}
            unoptimized
            className='relative mx-auto mb-6 h-24 w-auto'
          />
        ) : (
          <BoomPercentMark className='relative mb-6' />
        )}
        <h2 className='text-4xl font-black tracking-tight text-brand xl:text-5xl'>{brandName}</h2>
      </div>
      <p className='max-w-md text-base leading-8 text-[#64748b]'>
        برای ورود به حساب کاربری، شماره همراه خود را وارد کنید.
      </p>
    </div>
  );
}
