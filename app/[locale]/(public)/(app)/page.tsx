'use client';

import { Banner } from '@/components/page/landing/banner';
import { FeaturesBar } from '@/components/page/landing/features-bar';
import { WhyUs } from '@/components/page/landing/why-us';
import { ShopsPreview } from '@/components/page/landing/shops-preview';
import { LoanRequestSteps } from '@/components/page/landing/loan-request-steps';
import { WalletsDescription } from '@/components/page/landing/wallets-description';
import { Calculator } from '@/components/page/landing';
import { Faq } from '@/components/faq';
import { LandingFeaturePills } from '@/components/page/landing/credit-showcase';
import { Reveal } from '@/components/page/landing/reveal';
import { SectionHeading } from '@/components/page/landing/section-heading';

export default function IndexPage() {
  return (
    <div className='landing-shell'>
      <div
        className='landing-shell-glow pointer-events-none absolute inset-x-0 top-0 h-[70vh]'
        aria-hidden
      />

      <Banner />
      <FeaturesBar className='mb-20 md:mb-28' />

      <div className='relative space-y-24 pb-20 md:space-y-32 md:pb-28'>
        <WhyUs />

        <section className='mx-auto max-w-6xl px-4 md:px-6 lg:px-10'>
          <Reveal>
            <SectionHeading
              eyebrow='وعده ما'
              title='شفاف، منعطف، متنوع'
              description='همان اصولی که روی کارت اعتبار می‌بینید، در همه تجربه خرید اقساطی جاری است.'
            />
          </Reveal>
          <Reveal delayMs={80}>
            <LandingFeaturePills />
          </Reveal>
        </section>

        <ShopsPreview />
        <Calculator />
        <WalletsDescription />
        <LoanRequestSteps />

        <div className='mx-auto max-w-6xl px-4 md:px-6 lg:px-10'>
          <Faq variant='landing' />
        </div>
      </div>
    </div>
  );
}
