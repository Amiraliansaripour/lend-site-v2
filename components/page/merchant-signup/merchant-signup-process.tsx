<<<<<<< HEAD
import Image from 'next/image';
import type { ProcessStep } from './merchant-signup-types';
import StepHelpImage1 from '@/assets/images/illustrations/step1help.png';
import StepHelpImage2 from '@/assets/images/illustrations/step2help.png';
import StepHelpImage3 from '@/assets/images/illustrations/step3help.png';
import StepHelpImage4 from '@/assets/images/illustrations/step4help.png';
const PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    title: 'ثبت درخواست اولیه',
    img: StepHelpImage1,
    description: 'فرم ثبت فروشگاه را کامل کنید، تا در کوتاه ترین زمان ممکن با شما تماس بگیریم.',
  },
  {
    step: 2,
    title: 'انعقاد قرارداد',
    img: StepHelpImage2,
    description: 'پس از بررسی و امضای تفاهم نامه، فرآیند عملیاتی آغاز می‌شود.',
  },
  {
    step: 3,
    title: 'اتصال به درگاه پرداخت',
    img: StepHelpImage3,
    description:
      'کیف پول نوالند با استفاده از وب‌سرویس به سایت یا پایانه فروشگاهی شما متصل می‌شود.',
  },
  {
    step: 4,
    title: 'آغاز فروش اقساطی',
    img: StepHelpImage4,
    description: 'فروش اقساطی از طریق کیف پول نوالند اجرایی می‌شود.',
  },
];

export function MerchantSignupProcess() {
  return (
    <div className='w-full'>
      <div className='flex flex-col justify-center w-full items-center px-7 mb-[63px] pt-14'>
        <div className='font-bold text-base md:text-xl mb-4 text-center'>
          فرآیند همکاری و ثبت فروشگاه
        </div>
        <div
          className='text-sm md:text-lg text-[#454545] max-w-full md:max-w-[900px] text-justify'
          style={{ textAlignLast: 'center' }}
        >
          با طی کردن چند مرحله ساده، می‌توانید فروش اقساطی خود را آغاز نمایید.
        </div>
      </div>
      <div className='w-full px-4 lg:px-10 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {PROCESS_STEPS.map(step => (
            <div
              key={step.step}
              className='flex flex-col border-2 border-light-blue shadow-light-blue/40 items-center text-center shadow-lg px-10 py-8 relative rounded-[32px]'
            >
              <span className='absolute top-3 right-3 text-2xl font-medium border-2 border-light-blue w-12 h-14 rounded-2xl flex items-center justify-center text-dark-blue bg-white'>
                {step.step.toLocaleString('fa')}
              </span>
              <div className='relative w-36 h-40 mt-8 mb-4'>
                <Image
                  className='rounded object-cover'
                  src={step.img}
                  alt={step.title}
                  fill
                  sizes='(max-width: 768px) 144px, 144px'
                />
              </div>
              <h3 className='text-lg font-bold text-zinc-800'>{step.title}</h3>
              <p className='text-sm font-normal text-zinc-600 leading-loose tracking-tight mt-2 max-w-xs'>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
=======
import Image from 'next/image';
import type { ProcessStep } from './merchant-signup-types';
import StepHelpImage1 from '@/assets/images/illustrations/step1help.png';
import StepHelpImage2 from '@/assets/images/illustrations/step2help.png';
import StepHelpImage3 from '@/assets/images/illustrations/step3help.png';
import StepHelpImage4 from '@/assets/images/illustrations/step4help.png';
const PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    title: 'ثبت درخواست اولیه',
    img: StepHelpImage1,
    description: 'فرم ثبت فروشگاه را کامل کنید، تا در کوتاه ترین زمان ممکن با شما تماس بگیریم.',
  },
  {
    step: 2,
    title: 'انعقاد قرارداد',
    img: StepHelpImage2,
    description: 'پس از بررسی و امضای تفاهم نامه، فرآیند عملیاتی آغاز می‌شود.',
  },
  {
    step: 3,
    title: 'اتصال به درگاه پرداخت',
    img: StepHelpImage3,
    description:
      'کیف پول نوالند با استفاده از وب‌سرویس به سایت یا پایانه فروشگاهی شما متصل می‌شود.',
  },
  {
    step: 4,
    title: 'آغاز فروش اقساطی',
    img: StepHelpImage4,
    description: 'فروش اقساطی از طریق کیف پول نوالند اجرایی می‌شود.',
  },
];

export function MerchantSignupProcess() {
  return (
    <div className='w-full'>
      <div className='flex flex-col justify-center w-full items-center px-7 mb-[63px] pt-14'>
        <div className='font-bold text-base md:text-xl mb-4 text-center'>
          فرآیند همکاری و ثبت فروشگاه
        </div>
        <div
          className='text-sm md:text-lg text-[#454545] max-w-full md:max-w-[900px] text-justify'
          style={{ textAlignLast: 'center' }}
        >
          با طی کردن چند مرحله ساده، می‌توانید فروش اقساطی خود را آغاز نمایید.
        </div>
      </div>
      <div className='w-full px-4 lg:px-10 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {PROCESS_STEPS.map(step => (
            <div
              key={step.step}
              className='flex flex-col border-2 border-light-blue shadow-light-blue/40 items-center text-center shadow-lg px-10 py-8 relative rounded-[32px]'
            >
              <span className='absolute top-3 right-3 text-2xl font-medium border-2 border-light-blue w-12 h-14 rounded-2xl flex items-center justify-center text-dark-blue bg-white'>
                {step.step.toLocaleString('fa')}
              </span>
              <div className='relative w-36 h-40 mt-8 mb-4'>
                <Image
                  className='rounded object-cover'
                  src={step.img}
                  alt={step.title}
                  fill
                  sizes='(max-width: 768px) 144px, 144px'
                />
              </div>
              <h3 className='text-lg font-bold text-zinc-800'>{step.title}</h3>
              <p className='text-sm font-normal text-zinc-600 leading-loose tracking-tight mt-2 max-w-xs'>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
>>>>>>> a47b58a (pwa)
