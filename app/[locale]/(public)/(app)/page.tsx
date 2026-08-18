'use client';

import { Lightbulb, MapPin, CreditCard, ShoppingCart, Calendar, FileSearch } from 'lucide-react';
import { JSX } from 'react';

import { Faq } from '@/components/faq';
import { Banner } from '@/components/page/landing/banner';
import { WhyUs } from '@/components/page/landing/why-us';
import { LoanRequestSteps } from '@/components/page/landing/loan-request-steps';
import { WalletsDescription } from '@/components/page/landing/wallets-description';
import { Calculator } from '@/components/page/landing';
import { useSiteTemplate } from '@/providers/site-template';

export default function IndexPage() {
  const { withBrand } = useSiteTemplate();

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
      question: withBrand('سقف مبلغ وام در کارالند چقدر است؟'),
      answer: withBrand(
        'سقف مبلغ وامی که می‌توانید از طریق کارالند دریافت کنید براساس رتبه‌ی اعتباری شما متفاوت خواهد بود اما در حال حاضر بالاترین سقف 100 میلیون تومان است.',
      ),
      icon: <CreditCard />,
    },
    {
      question: 'چه کالاهایی را می توان با تسهیلات خریداری کرد؟',
      answer: withBrand(
        'شما می توانید با مراجعه به سایت هر یک از فروشگاه‌های آنلاین طرف قرارداد با کارالند، هر کالایی را خریداری کنید و در هنگام پرداخت، گزینه پرداخت با کارالند را انتخاب کنید.',
      ),
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
