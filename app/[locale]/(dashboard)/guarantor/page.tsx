'use client';

import { PageContent } from '@/components/page-content';
import { Breadcrumbs, PageContainer } from '@/components/page-container';
import { GuarantorHubPage } from '@/components/page/guarantor/guarantor-hub-page';

const breadcrumbs: Breadcrumbs = [{ label: 'ضمانت', href: '/guarantor' }];

export default function GuarantorPage() {
  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <PageContent title='ضمانت'>
        <div className='rounded-2xl bg-card p-6 shadow-lg'>
          <GuarantorHubPage />
        </div>
      </PageContent>
    </PageContainer>
  );
}
