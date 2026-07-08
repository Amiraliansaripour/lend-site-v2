<<<<<<< HEAD
import Image from 'next/image';
import { PhoneCall } from 'lucide-react';
import LandingBanner from '@/assets/images/bg-shape-contactus.png';
import { Button } from '@/components/ui/button';

export function HelpContactUs() {
  return (
    <div className='w-full flex items-center justify-center px-4 md:px-6'>
      <div className='relative bg-brand px-6 md:px-8 lg:px-32 mb-16 md:mb-24 w-full md:w-10/12 lg:w-9/12 min-h-[230px] md:h-52 rounded-2xl flex flex-col md:flex-row items-center justify-end md:justify-between gap-6 md:gap-4 py-6 pt-10 md:py-0'>
        <Image
          src={LandingBanner}
          className='absolute bottom-0 right-0 w-16 md:w-auto opacity-50 md:opacity-100'
          alt='decoration'
          width={200}
          height={200}
        />
        <Image
          src={LandingBanner}
          className='absolute top-0 left-0 rotate-180 w-16 md:w-auto opacity-50 md:opacity-100'
          alt='decoration'
          width={200}
          height={200}
        />
        <div className='flex flex-col justify-center gap-3 md:gap-5 text-white md:text-right z-10'>
          <div className='text-sm md:text-xl font-semibold'>نیاز به مشاوره بیشتر دارید؟</div>
          <div className='text-xs md:text-lg leading-relaxed'>
            همین حالا با کارشناسان ما در ارتباط باشید و پاسخ سوالات خود را دریافت کنید.
          </div>
        </div>
        <div className='w-full flex justify-end'>
          <Button className='bg-[#00C057] text-white border-transparent h-10 rounded md:rounded-lg md:h-12 px-4 md:px-7 hover:bg-[#00a64b] text-sm md:text-base flex-shrink-0 z-10'>
            <PhoneCall className='text-sm md:text-xl ml-2' />
            <span className='whitespace-nowrap text-xs md:text-base'>تماس با مشاوره</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
=======
import Image from 'next/image';
import { PhoneCall } from 'lucide-react';
import LandingBanner from '@/assets/images/bg-shape-contactus.png';
import { Button } from '@/components/ui/button';

export function HelpContactUs() {
  return (
    <div className='w-full flex items-center justify-center px-4 md:px-6'>
      <div className='relative bg-brand px-6 md:px-8 lg:px-32 mb-16 md:mb-24 w-full md:w-10/12 lg:w-9/12 min-h-[230px] md:h-52 rounded-2xl flex flex-col md:flex-row items-center justify-end md:justify-between gap-6 md:gap-4 py-6 pt-10 md:py-0'>
        <Image
          src={LandingBanner}
          className='absolute bottom-0 right-0 w-16 md:w-auto opacity-50 md:opacity-100'
          alt='decoration'
          width={200}
          height={200}
        />
        <Image
          src={LandingBanner}
          className='absolute top-0 left-0 rotate-180 w-16 md:w-auto opacity-50 md:opacity-100'
          alt='decoration'
          width={200}
          height={200}
        />
        <div className='flex flex-col justify-center gap-3 md:gap-5 text-white md:text-right z-10'>
          <div className='text-sm md:text-xl font-semibold'>نیاز به مشاوره بیشتر دارید؟</div>
          <div className='text-xs md:text-lg leading-relaxed'>
            همین حالا با کارشناسان ما در ارتباط باشید و پاسخ سوالات خود را دریافت کنید.
          </div>
        </div>
        <div className='w-full flex justify-end'>
          <Button className='bg-[#00C057] text-white border-transparent h-10 rounded md:rounded-lg md:h-12 px-4 md:px-7 hover:bg-[#00a64b] text-sm md:text-base flex-shrink-0 z-10'>
            <PhoneCall className='text-sm md:text-xl ml-2' />
            <span className='whitespace-nowrap text-xs md:text-base'>تماس با مشاوره</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
>>>>>>> a47b58a (pwa)
