'use client';

import { User } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { useSiteTemplate } from '@/providers/site-template';

export function MembershipBanner() {
  const { withBrand } = useSiteTemplate();

  return (
    <div className='stack isolate rounded-lg overflow-hidden'>
      <div className='bg-linear-to-t from-[#9c27b0] via-[#4a148c] to-[#2c034b] relative z-0'>
        <div className='size-48 absolute top-0 left-0 -translate-1/2 rounded-full border-6 border-white/30'></div>
        <div className='size-48 absolute bottom-0 right-0 translate-1/2 rounded-full border-6 border-white/30'></div>
      </div>
      <div className='flex flex-col sm:flex-row items-center gap-x-12 gap-y-6 justify-around z-10 px-16 lg:px-24 py-22 lg:py-16'>
        <Button size='lg' asChild className='px-8! bg-success hover:bg-success-dark'>
          <Link href='/login'>
            <User strokeWidth={3} />
            عضویت
          </Link>
        </Button>

        <hgroup className='text-white space-y-4'>
          <h4 className='text-lg lg:text-xl font-bold'>
            {withBrand('شما هم بخشی از خانواده بزرگ بوم آپ باشید.')}
          </h4>
          <p className='text-sm lg:text-base leading-7'>
            بیش از ۶۰۰ کاربر فعال به ما اعتماد کرده اند، الان نوبت شماست.
          </p>
        </hgroup>
      </div>
    </div>
  );
}
