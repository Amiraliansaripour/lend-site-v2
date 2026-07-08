<<<<<<< HEAD
import Image from 'next/image';
import Background from '@/assets/images/faqbanner.webp';
export function HelpBanner() {
  return (
    <div className=''>
      <div className='w-full relative flex items-center flex-col md:flex-row justify-between h-[400px] md:h-[530px]'>
        <div className='flex flex-col gap-3 md:gap-4 px-4 md:pr-28 h-full justify-center z-10 text-right'>
          <span className='text-xs md:text-sm text-[#282828] border-b-2 border-[#70FFB5] pb-1 inline-block w-fit text-right mx-0'>
            با ما همراه باشید.
          </span>
          <div className='font-bold text-xl md:text-2xl'>سریع، ساده و بی دردسر</div>
          <div className='text-base md:text-xl leading-relaxed'>
            هر جا هستی، خیلی راحت خرید و پرداخت کن
            <br />
            فقط با چند کلیک ساده
          </div>
        </div>
        <div className='px-4 md:pl-28 w-full md:w-auto flex justify-center'>
          <div
            className='w-full max-w-[300px] md:max-w-[750px] lg:w-[630px] rounded-2xl overflow-hidden'
            style={{ aspectRatio: '16/9' }}
          >
            <video
              className='w-full h-full object-cover object-center'
              autoPlay
              loop
              muted
              playsInline
              controls
            >
              <source src='/Niika.mp4' type='video/mp4' />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        <Image
          className='w-full h-[450px] md:h-[530px] rotate-180 object-cover absolute top-0 -z-10'
          alt='background image'
          src={Background}
          width={1920}
          height={530}
          priority
        />
      </div>
    </div>
  );
}
=======
import Image from 'next/image';
import Background from '@/assets/images/faqbanner.webp';
export function HelpBanner() {
  return (
    <div className=''>
      <div className='w-full relative flex items-center flex-col md:flex-row justify-between h-[400px] md:h-[530px]'>
        <div className='flex flex-col gap-3 md:gap-4 px-4 md:pr-28 h-full justify-center z-10 text-right'>
          <span className='text-xs md:text-sm text-[#282828] border-b-2 border-[#70FFB5] pb-1 inline-block w-fit text-right mx-0'>
            با ما همراه باشید.
          </span>
          <div className='font-bold text-xl md:text-2xl'>سریع، ساده و بی دردسر</div>
          <div className='text-base md:text-xl leading-relaxed'>
            هر جا هستی، خیلی راحت خرید و پرداخت کن
            <br />
            فقط با چند کلیک ساده
          </div>
        </div>
        <div className='px-4 md:pl-28 w-full md:w-auto flex justify-center'>
          <div
            className='w-full max-w-[300px] md:max-w-[750px] lg:w-[630px] rounded-2xl overflow-hidden'
            style={{ aspectRatio: '16/9' }}
          >
            <video
              className='w-full h-full object-cover object-center'
              autoPlay
              loop
              muted
              playsInline
              controls
            >
              <source src='/Niika.mp4' type='video/mp4' />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        <Image
          className='w-full h-[450px] md:h-[530px] rotate-180 object-cover absolute top-0 -z-10'
          alt='background image'
          src={Background}
          width={1920}
          height={530}
          priority
        />
      </div>
    </div>
  );
}
>>>>>>> a47b58a (pwa)
