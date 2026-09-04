'use client';

import { BoomLogo } from '@/components/brand/boom-logo';

export function LoginBrandPanel() {
  return (
    <div className='hidden flex-col items-center justify-center text-center lg:flex'>
      <div className='relative mb-8'>
        <div aria-hidden className='absolute -inset-8 rounded-full bg-brand/10 blur-2xl' />
        <BoomLogo
          className='relative flex-col gap-4'
          markClassName='size-20'
          wordmarkClassName='text-4xl xl:text-5xl'
        />
      </div>
      <p className='max-w-md text-base leading-8 text-[#64748b]'>
        برای ورود به حساب کاربری، شماره همراه خود را وارد کنید.
      </p>
    </div>
  );
}
