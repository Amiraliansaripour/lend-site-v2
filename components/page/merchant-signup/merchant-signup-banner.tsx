'use client';

import Image from 'next/image';
import ShopBanner from '@/assets/images/banners/signupMerchantBanner.png';
import ShopBannerMobile from '@/assets/images/banners/signupMerchantBanner-res.png';
export function MerchantSignupBanner() {
  const scrollToForm = () => {
    const formSection = document.getElementById('merchant-signup-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className='h-[300px] lg:h-[750px] relative overflow-hidden mb-11 md:mb-[70px]'>
      <div className='absolute text-white right-5 lg:right-24 bottom-1/3 z-10'>
        <div className='text-sm lg:text-2xl font-bold pb-3'>به جمع فروشگاه‌های ما بپیوندید.</div>
        <div className='text-xs lg:text-lg'>
          با ثبت نام در کارالند، فروشگاه خود را به هزاران مشتری معرفی کنید.
        </div>
        <button
          onClick={scrollToForm}
          className='bg-[#00C057] w-20 lg:w-56 h-10 text-xs lg:text-base lg:h-14 flex items-center justify-center rounded mt-3 lg:mt-16 cursor-pointer hover:bg-[#00A04B] transition-colors'
        >
          ثبت درخواست
        </button>
      </div>
      <Image
        className='w-full h-full object-cover hidden md:block'
        src={ShopBannerMobile}
        alt='Desktop Banner'
        fill
        priority
      />
      <Image
        className='w-full h-full block md:hidden object-cover'
        src={ShopBanner}
        alt='Mobile Banner'
        fill
        priority
      />
    </div>
  );
}
