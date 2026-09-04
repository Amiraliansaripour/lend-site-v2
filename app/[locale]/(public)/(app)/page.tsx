'use client';

import { LandingHero } from '@/components/page/landing/landing-hero';
import { WhyUs } from '@/components/page/landing/why-us';
import { LoanRequestSteps } from '@/components/page/landing/loan-request-steps';
import { WalletsDescription } from '@/components/page/landing/wallets-description';
import { Calculator } from '@/components/page/landing';
import { Faq } from '@/components/faq';

export default function IndexPage() {
  return (
    <div className='bg-boom-surface'>
      <LandingHero />

      <div className='space-y-24 pb-20 md:space-y-32'>
        <WhyUs />

        <section className='container mx-auto'>
          <div className='overflow-hidden rounded-3xl border border-brand/10 bg-white boom-card-shadow'>
            <Calculator />
          </div>
        </section>

        <WalletsDescription />

        <LoanRequestSteps />

        <div className='container pb-8'>
          <Faq />
        </div>
      </div>
    </div>
  );
}
