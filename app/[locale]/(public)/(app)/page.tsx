import { Lightbulb, MapPin, CreditCard, ShoppingCart, Calendar, FileSearch } from 'lucide-react';

import { Faq } from '@/components/faq';
import { Banner } from '@/components/page/landing/banner';
import { WhyUs } from '@/components/page/landing/why-us';
import { ScrollIcon } from '@/components/scroll-icon';
import { LoanRequestSteps } from '@/components/page/landing/loan-request-steps';
import { WalletsDescription } from '@/components/page/landing/wallets-description';

import LandingBanner from '@/assets/images/banners/landing.webp';

import { JSX } from 'react';
import { Calculator } from '@/components/page/landing';

export default async function IndexPage() {
  type QuestionItem = {
    question: string;
    answer: string;
    icon: JSX.Element;
  };
  const QUESTIONS: QuestionItem[] = [
    {
      question: 'برای دریافت وام چه مدارکی لازم است؟',
      answer:
        'برای دریافت وام علاوه بر مدارک هویتی شخصی، تنها به یک برگ‌ چک صیادی بنفش رنگ به نام فرد متقاضی نیاز دارید.',
      icon: <Lightbulb />,
    },
    {
      question: 'آیا امکان دریافت وام برای افراد خارج از تهران وجود دارد؟',
      answer:
        'از آنجا که مراحل دریافت وام به صورت کاملا آنلاین انجام می‌شود، می‌توانید از هر نقطه ایران برای دریافت وام اقدام کنید.',
      icon: <MapPin />,
    },
    {
      question: 'سقف مبلغ وام در نیکالند چقدر است؟',
      answer:
        'سقف مبلغ وامی که می‌توانید از طریق نیکالند دریافت کنید براساس رتبه‌ی اعتباری شما متفاوت خواهد بود اما در حال حاضر بالاترین سقف 100 میلیون تومان است.',
      icon: <CreditCard />,
    },
    {
      question: 'چه کالاهایی را می توان با تسهیلات خریداری کرد؟',
      answer:
        'شما می توانید با مراجعه به سایت هر یک از فروشگاه‌های آنلاین طرف قرارداد با نیکالند، هر کالایی را خریداری کنید و در هنگام پرداخت، گزینه پرداخت با نیکالند را انتخاب کنید.',
      icon: <ShoppingCart />,
    },
    {
      question: 'مدت زمان بازپرداخت چند ماهه است؟',
      answer: 'شما می‌توانید اقساط خود را به صورت ۱۲ ماهه پرداخت کنید.',
      icon: <Calendar />,
    },
    {
      question: 'اعتبار سنجی بانکی به چه معناست؟',
      answer:
        'این اعتبار‌سنجی با هدف بررسی میزان خوش حساب بودن افراد و براساس بررسی سوابق مالی و اعتباری شما در نظام بانکی صورت می‌گیرد.',
      icon: <FileSearch />,
    },
  ];
  return (
    <div className='space-y-32'>
      <Banner />

      <WhyUs />

      <div className='container mx-auto'>
        <Calculator />
      </div>

      <WalletsDescription />

      <LoanRequestSteps />

      <div className='container'>
        <Faq
          items={QUESTIONS.map((item, index) => ({
            icon: item.icon,
            id: `faq-${index}`,
            question: item.question,
            answer: item.answer,
          }))}
        />
      </div>
    </div>
  );
}
