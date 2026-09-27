'use client';

import { Banner } from '@/components/page/landing/banner';
import { FeaturesBar } from '@/components/page/landing/features-bar';
import { WhyUs } from '@/components/page/landing/why-us';
import { ShopsPreview } from '@/components/page/landing/shops-preview';
import { LoanRequestSteps } from '@/components/page/landing/loan-request-steps';
import { WalletsDescription } from '@/components/page/landing/wallets-description';
import { Calculator } from '@/components/page/landing';
import { LandingCta } from '@/components/page/landing/landing-cta';
import { Faq } from '@/components/faq';

export default function IndexPage() {
  return (
    <div className='landing-shell'>
      <Banner />

      <div className='relative space-y-20 pb-16 md:space-y-28 md:pb-24'>
        <FeaturesBar />
        <WhyUs />
        <ShopsPreview />
        <Calculator />
        <WalletsDescription />
        <LoanRequestSteps />

        <div className='mx-auto max-w-6xl px-4 md:px-6 lg:px-10'>
          <Faq variant='landing' />
        </div>

        <LandingCta />
      </div>
    </div>
  );
}
