'use client';

import Image, { StaticImageData } from 'next/image';

import shopWallet from '@/assets/images/illustrations/shopWallet.png';
import shopStore from '@/assets/images/illustrations/shopStore.png';
import shopPayment from '@/assets/images/illustrations/shopPayment.png';
import { useSiteTemplate } from '@/providers/site-template';

type Step = {
  img: StaticImageData;
  text: string;
};

const STEPS: Step[] = [
  { img: shopWallet, text: 'دریافت آنلاین اعتبار' },
  { img: shopStore, text: 'بررسی فروشگاه‌ها' },
  { img: shopPayment, text: 'پرداخت با کیف پول کارالند' },
];

type StepItemProps = {
  step: Step;
};

function StepItem({ step }: StepItemProps) {
  const { withBrand } = useSiteTemplate();

  return (
    <div className='flex flex-col items-center justify-center'>
      <Image
        src={step.img}
        className='w-full h-full object-cover max-w-72'
        alt={withBrand(step.text)}
        width={288}
        height={288}
      />
      <p className='text-center text-xs lg:text-xl font-medium text-purple-primary pt-6'>
        {withBrand(step.text)}
      </p>
    </div>
  );
}

export function ShopSteps() {
  return (
    <div className='mb-20 lg:mb-36'>
      <div className='flex justify-center gap-10 lg:gap-24 px-2 lg:px-0 items-center'>
        {STEPS.map(step => (
          <StepItem key={step.text} step={step} />
        ))}
      </div>
    </div>
  );
}
