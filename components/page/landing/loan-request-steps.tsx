import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/card';

import StepHelpImage1 from '@/assets/images/illustrations/step1help.png';
import StepHelpImage2 from '@/assets/images/illustrations/step2help.png';
import StepHelpImage3 from '@/assets/images/illustrations/step3help.png';
import StepHelpImage4 from '@/assets/images/illustrations/step4help.png';
import Image from 'next/image';

const STEPS = [
  {
    title: 'شارژ کیف پول اعتباری',
    description: 'با استفاده از اعتبار کیف پول خود از فروشگاه های طرف قرارداد خریدکنید.',
    image: StepHelpImage1,
  },
  {
    title: 'آپلود مدارک هویتی',
    description: 'پس از انجام اعتبارسنجی آنلاین مدارک شناسایی و تضامین خود رابارگذاری نمایید.',
    image: StepHelpImage2,
  },
  {
    title: 'ارسال نسخه فیزیکی چک',
    description: 'نسخه فیزیکی چک صیادی خود را در صورت لزوم برای ما ارسال نمایید.',
    image: StepHelpImage3,
  },
  {
    title: 'شارژ کیف پول اعتباری',
    description: 'با استفاده از اعتبار کیف پول خود از فروشگاه های طرف قرارداد خریدکنید.',
    image: StepHelpImage4,
  },
] as const;

export function LoanRequestSteps() {
  return (
    <section className='container'>
      <hgroup className='flex flex-col items-center gap-y-4 mb-10'>
        <h3 className='text-lg text-center font-semibold'>مراحل دریافت وام از کارالند</h3>
        <p className='max-w-md text-center leading-7 text-pretty'>
          با طی کردن چند مرحله ساده، می‌توانید وام مورد نیاز خود را به‌سرعت دریافت کنید و از مزایای
          خرید اعتباری بهره‌مند شوید.
        </p>
      </hgroup>

      <section className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {STEPS.map(({ title, image, description }, index) => (
          <Card
            key={index}
            className='border-brand shadow-md hover:shadow-none gap-y-0 py-4 transition-shadow'
          >
            <CardHeader className='px-3'>
              <div className='flex items-center size-10 rounded-sm text-brand font-semibold border border-brand/75 tabular-nums -mt-1'>
                <span className='mx-auto'>{index + 1}</span>
              </div>
            </CardHeader>
            <CardContent className='flex flex-col items-center gap-y-3 px-4'>
              <Image
                src={image}
                alt={title}
                width={200}
                height={200}
                className='w-33 aspect-square'
              />
              <CardTitle className='text-center mt-4'>{title}</CardTitle>
              <CardDescription className='text-center leading-6'>{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>
    </section>
  );
}
