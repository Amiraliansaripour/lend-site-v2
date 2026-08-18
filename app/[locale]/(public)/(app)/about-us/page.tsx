import Image from 'next/image';

import { Globe, Sparkles, ShieldCheck, MessagesSquare } from 'lucide-react';

import { Banner } from '@/components/page/landing/banner';
import { BrandText } from '@/components/brand-text';
import { Marquee } from '@/components/marquee';
import { ScrollIcon } from '@/components/scroll-icon';
import { MembershipBanner } from '@/components/membership-banner';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

import Building from '@/assets/images/building.png';

import MO7Partner from '@/assets/images/partners/mo7.png';
import SabzPartner from '@/assets/images/partners/sabz.png';
import TaqKasraGasht from '@/assets/images/partners/taq-kasra-gasht.png';
import AghsatMarketPartner from '@/assets/images/partners/aghsat-market.png';

const STEPS = [
  {
    title: 'اعتماد',
    description: 'تضمین کامل امنیت اطلاعات و تراکنش‌ ها',
    icon: <ShieldCheck />,
  },
  {
    title: 'فناوری',
    description: 'توسعه خدمات براساس فناوری‌های روز دنیا',
    icon: <Globe />,
  },
  {
    title: 'شفافیت',
    description: 'شفافیت کلیه فرآیندها و هزینه‌ها',
    icon: <MessagesSquare />,
  },
  {
    title: 'سرعت',
    description: 'سرعت و سهولت در دسترسی به اعتبار',
    icon: <Sparkles />,
  },
] as const;

export default async function IndexPage() {
  return (
    <div className='space-y-32'>
      <Banner imageKey='merchantBanner' mobileImageKey='merchantBanner_Res'>
        <section className='container relative text-white'>
          <div className='absolute inset-x-4 bottom-82'>
            <hgroup className='space-y-4'>
              <BrandText as='h1' className='text-2xl font-bold'>
                خریدهای سریع و آســـــــان زندگی با کارالند
              </BrandText>
              <p className='text-sm lg:text-base max-w-lg text-balance leading-7'>
                با ارائه تسهیلات خرید به‌ صورت شفاف، سریع و بدون نیاز به ضامن، کمک می‌کنیم تا با
                سرعت و سهولت، کالاهای ضروری و مورد علاقه خود را تهیه کنید.
              </p>
            </hgroup>
          </div>
        </section>
        <ScrollIcon />
      </Banner>

      <section className='container overflow-hidden pb-2'>
        <hgroup className='flex flex-col items-center gap-y-4 mb-10'>
          <h3 className='text-lg text-center font-semibold'>ماموریت ما</h3>
          <p className='max-w-3xl text-center leading-7 text-pretty'>
            کارا با هدف توانمندسازی افراد و کسب‌وکارها، نوآوری‌های مالی را به شکلی شفاف، ساده و
            قابل‌دسترس ارائه می‌دهد. ما با تکیه بر دانش روز، امکان رفع نیازهای مالی را در کوتاه‌ترین
            زمان فراهم کرده‌ایم. هدف ما ارائه تجربه‌ای متفاوت و کارآمد در خدمات مالی آنلاین برای
            مدیریت آسان امور شخصی و تجاری است.
          </p>
        </hgroup>

        <section className='grid xs:grid-cols-2 lg:grid-cols-4 gap-4'>
          {STEPS.map(({ icon, title, description }, index) => (
            <Card
              key={index}
              className='border-brand shadow-[4px_4px_0_var(--brand)] hover:shadow-none gap-y-0 py-4 transition-shadow'
            >
              <CardContent className='flex flex-col items-center gap-y-3 px-4 py-2'>
                <div className='bg-brand rounded-full text-white p-5'>{icon}</div>
                <CardTitle className='text-center mt-4'>{title}</CardTitle>
                <CardDescription className='text-center leading-6'>{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>
      </section>

      <section className='container grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] items-center justify-items-center gap-x-20 gap-y-8'>
        <div className='lg:col-span-2 leading-8 text-pretty'>
          <p>
            لندپی یک شرکت فعال در حوزه فناوری مالی (Fintech) و از زیرمجموعه‌های هلدینگ لندپی است.
            این شرکت با هدف ایجاد تحول در خدمات مالی، به‌ویژه در بخش‌های لندتک و پرداخت الکترونیک
            تأسیس شده است. تیم لندپی متشکل از متخصصان حوزه مالی، فناوری اطلاعات و هوش مصنوعی است که
            تلاش می‌کنند فرآیندهای سنتی مالی را به تجربه‌ای ساده، سریع و امن برای کاربران تبدیل
            کنند.
          </p>
          <p>
            با لندپی افراد حقیقی می‌توانند به‌راحتی به تسهیلات خرد دسترسی پیدا کنند و کسب‌وکارها نیز
            از راهکارهای نوآورانه ما برای رشد فعالیت‌های تجاری خود و مدیریت بهتر پرداخت‌ها بهره‌مند
            شوند.
          </p>
        </div>
        <Image
          alt='company building'
          src={Building}
          width={400}
          height={400}
          className='w-80 max-w-full object-cover shrink-0 order-first lg:order-last'
        />
      </section>

      <section className='container overflow-x-hidden pb-2'>
        <BrandText as='h3' className='text-lg text-center font-semibold mb-8 lg:mb-10'>
          شرکای تجاری کارالند
        </BrandText>

        <Marquee>
          <Image
            width={200}
            height={100}
            className='w-50 object-contain object-center pointer-events-none'
            src={AghsatMarketPartner}
            alt='business partner logo'
          />
          <Image
            width={200}
            height={100}
            className='w-50 object-contain object-center pointer-events-none'
            src={MO7Partner}
            alt='business partner logo'
          />
          <Image
            width={200}
            height={100}
            className='w-50 object-contain object-center pointer-events-none'
            src={SabzPartner}
            alt='business partner logo'
          />
          <Image
            width={200}
            height={100}
            className='w-50 object-contain object-center pointer-events-none'
            src={TaqKasraGasht}
            alt='business partner logo'
          />
        </Marquee>
      </section>

      <section className='container'>
        <MembershipBanner />
      </section>
    </div>
  );
}
