'use client';

import { Banner } from '@/components/page/landing/banner';
import { WhyUs } from '@/components/page/landing/why-us';
import { LoanRequestSteps } from '@/components/page/landing/loan-request-steps';
import { WalletsDescription } from '@/components/page/landing/wallets-description';
import { Calculator } from '@/components/page/landing';
import { Faq } from '@/components/faq';

export default function IndexPage() {
  return (
    <div className='space-y-32'>
      <Banner />

      <WhyUs />

      <div className='container mx-auto'>
        <Calculator />
      </div>

      <WalletsDescription />

      <LoanRequestSteps />

      <div className='container pb-8'>
        <Faq />
      </div>
    </div>
  );
}
