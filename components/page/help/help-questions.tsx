'use client';

import { CheckCheck, ArrowLeftRight, Wallet } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { ReactNode } from 'react';

type QuestionItem = {
  category: string;
  title: string;
  desc: string;
};
type CategoryItem = {
  title: string;
  value: string;
  icon: ReactNode;
};
const CATEGORY: CategoryItem[] = [
  {
    value: 'loan-info',
    title: 'اطلاعات مربوط به وام',
    icon: <ArrowLeftRight className='text-base md:text-xl' />,
  },
  {
    value: 'repayment',
    title: 'بازپرداخت اقساط',
    icon: <CheckCheck className='text-base md:text-xl' />,
  },
  {
    value: 'loan-process',
    title: 'فرآیند دریافت وام',
    icon: <Wallet className='text-base md:text-xl' />,
  },
];
const QUESTIONS: QuestionItem[] = [
  {
    category: 'loan-info',
    title: 'سقف مبلغ وام در نوالند چقدر است؟',
    desc: 'سقف مبلغ وامی که می‌توانید از طریق نوالند دریافت کنید براساس رتبه‌ی اعتباری شما متفاوت خواهد بود اما در حال حاضر بالاترین سقف 100 میلیون تومان است.',
  },
  {
    category: 'loan-info',
    title: 'کارمزد و سود دریافتی سالانه وام چقدر است؟',
    desc: 'نرخ سود اقساط بر اساس نرخ مصوب بانک مرکزی معادل ۲۳٪ خواهد بود. به دلیل هزینه‌های مربوط به تشکیل پرونده و عملیات اجرایی، قیمت فروش نقدی و اقساطی کالا متفاوت خواهد بود.',
  },
  {
    category: 'loan-info',
    title: 'آیا امکان دریافت وام به صورت نقدی وجود دارد؟',
    desc: 'خیر. مبلغ وام در کیف پول شما شارژ می‌شود و فقط امکان خرید آنلاین وجود دارد.',
  },
  {
    category: 'loan-info',
    title: 'چه کالاهایی را می توانید با تسهیلات خریداری کرد؟',
    desc: 'شما می توانید با مراجعه به سایت هر یک از فروشگاه‌های آنلاین طرف قرارداد با نوالند، هر کالایی را خریداری کنید و در هنگام پرداخت، گزینه پرداخت با نوالند را انتخاب کنید.',
  },
  {
    category: 'loan-info',
    title: 'آیا برای دریافت وام به مراجعه حضوری نیاز است؟',
    desc: 'خیر. تمامی فرآیند به صورت آنلاین انجام می‌شود.',
  },
  {
    category: 'loan-info',
    title: 'آیا امکان دریافت وام برای افراد خارج از تهران وجود دارد؟',
    desc: 'از آنجا که مراحل دریافت وام به صورت کاملا آنلاین انجام می‌شود، می‌توانید از هر نقطه ایران برای دریافت وام اقدام کنید.',
  },
  {
    category: 'loan-process',
    title: 'برای دریافت وام چه مدارکی لازم است؟',
    desc: 'برای دریافت وام علاوه بر مدارک هویتی شخصی، تنها به یک برگ‌ چک صیادی بنفش رنگ به نام فرد متقاضی نیاز دارید.',
  },
  {
    category: 'loan-process',
    title: 'آیا برای دریافت وام نیاز به دسته چک دارم؟',
    desc: 'بله. برای دریافت وام در نوالند حتما به دسته چک صیادی بنفش به نام خودتان نیاز دارید.',
  },
  {
    category: 'loan-process',
    title: 'اعتبار‌سنجی بانکی به چه معناست؟',
    desc: 'این اعتبار‌سنجی با هدف بررسی میزان خوش حساب بودن افراد و براساس بررسی سوابق مالی و اعتباری شما در نظام بانکی صورت می‌گیرد.',
  },
  {
    category: 'loan-process',
    title: 'چطور می‌توان برای دریافت وام اقدام نمود؟',
    desc: 'مرحله اول، ثبت‌نام در سایت و درخواست وام و ارائه اطلاعات هویتی از طریق پنل کاربری است. مرحله دوم، اعتبارسنجی بانکی برای اطلاع از وضعیت اعتباری شما و امکان دریافت تسهیلات است. در مرحله سوم شما باید مدارک مورد نیاز (شامل مدارک هویتی و تصویر چک تضمین) را در پنل کاربری آپلود کنید و در آخرین مرحله نیز باید اصل چک ضمانت را برای ما ارسال کنید. پس از طری این مراحل، وام در مدت سه روز کاری به کیف پول اعتباری شما واریز می‌شود.',
  },
  {
    category: 'loan-process',
    title: 'آیا امکان لغو درخواست وام وجود دارد؟',
    desc: 'بله. تا پیش از ارسال و تحویل فیزیکی چک، می‌توانید درخواست وام خود را از طریق پنل کابری لغو کنید.',
  },
  {
    category: 'repayment',
    title: 'مدت زمان بازپرداخت وام چند ماهه است؟',
    desc: 'شما می‌توانید اقساط خود را به صورت ۱۲ ماهه پرداخت کنید.',
  },
  {
    category: 'repayment',
    title: 'نحوه‌ بازپرداخت اقساط وام به چه صورت است؟',
    desc: 'واریز اقساط وام از طریق اپلیکیشن بانکی صورت می‌گیرد.',
  },
  {
    category: 'repayment',
    title: 'اگر پرداخت اقساط به موقع انجام نشود، چه مشکلاتی ایجاد می‌شود؟',
    desc: 'در صورتی که اقساط خود را به موقع پرداخت نکنید علاوه‌ بر جریمه‌ی دیرکرد، رتبه‌ اعتباری شما در سیستم بانکی کشور کاهش خواهد یافت. در صورت تاخیر طولانی‌مدت در پرداخت اقساط، پرونده شما به تیم حقوقی ارجاع می‌شود و از تمامی خدمات بانکی محروم خواهید شد.',
  },
];

export function HelpQuestions() {
  const loanInfoQuestions = QUESTIONS.filter(q => q.category === 'loan-info');
  const loanProcessQuestions = QUESTIONS.filter(q => q.category === 'loan-process');
  const repaymentQuestions = QUESTIONS.filter(q => q.category === 'repayment');

  return (
    <div className='mb-10 pb-2 md:mb-36 mt-28 md:mt-28'>
      <div className='flex items-center justify-center text-center flex-col'>
        <div className='font-bold text-base md:text-[22px]'>سوالات متداول</div>
        <div className='text-darker-text text-sm md:text-xl'>
          پیش از تماس با ما، پرسش و پاسخ‌های زیر را ببینید.
        </div>
      </div>

      <Tabs defaultValue='loan-info' className='mt-10 md:mt-16 mx-5 md:mx-20'>
        <TabsList className='w-full h-auto flex-wrap gap-2 md:gap-5 justify-center bg-transparent p-0'>
          {CATEGORY.map((item, index) => (
            <TabsTrigger
              value={item.value}
              className='px-8 md:px-16 h-14 md:h-20 rounded-2xl border border-b-[4px] border-[#C2C5C6] data-[state=active]:bg-gray-200 data-[state=active]:border-brand'
              key={index}
            >
              {item.icon}
              <span className='text-[10px] md:text-lg mr-2 md:mr-3 whitespace-nowrap'>
                {item.title}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value='loan-info' className='mt-12 md:mt-16' dir='rtl'>
          <Accordion type='single' collapsible className='w-full space-y-4'>
            {loanInfoQuestions.map((item, index) => (
              <AccordionItem
                key={index}
                value={`loan-info-${index}`}
                className='border border-[#a9a9a9] rounded'
              >
                <AccordionTrigger className='px-3 py-4 hover:no-underline text-right'>
                  <span className='text-sm md:text-base flex-1'>{item.title}</span>
                </AccordionTrigger>
                <AccordionContent className='px-3 pb-4'>
                  <p className='text-xs md:text-base text-darker-text'>{item.desc}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value='loan-process' className='mt-12 md:mt-16' dir='rtl'>
          <Accordion type='single' collapsible className='w-full space-y-4'>
            {loanProcessQuestions.map((item, index) => (
              <AccordionItem
                key={index}
                value={`loan-process-${index}`}
                className='border border-[#a9a9a9] rounded'
              >
                <AccordionTrigger className='px-3 py-4 hover:no-underline text-right'>
                  <span className='text-sm md:text-base flex-1'>{item.title}</span>
                </AccordionTrigger>
                <AccordionContent className='px-3 pb-4'>
                  <p className='text-xs md:text-base text-darker-text'>{item.desc}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value='repayment' className='mt-12 md:mt-16' dir='rtl'>
          <Accordion type='single' collapsible className='w-full space-y-4'>
            {repaymentQuestions.map((item, index) => (
              <AccordionItem
                key={index}
                value={`repayment-${index}`}
                className='border border-[#a9a9a9] rounded'
              >
                <AccordionTrigger className='px-3 py-4 hover:no-underline text-right'>
                  <span className='text-sm md:text-base flex-1'>{item.title}</span>
                </AccordionTrigger>
                <AccordionContent className='px-3 pb-4'>
                  <p className='text-xs md:text-base text-darker-text'>{item.desc}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
}
