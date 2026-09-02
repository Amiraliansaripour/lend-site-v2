'use client';

import { Breadcrumbs, PageContainer } from '@/components/page-container';
import { PageContent } from '@/components/page-content';
import { BankCardsPage } from '@/components/page/cards';

export default function CardsPage() {
  const breadcrumbs: Breadcrumbs = [
    { label: 'داشبورد', href: '/dashboard' },
    { label: 'کارت‌های بانکی', href: '/cards' },
  ];

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <PageContent title='کارت‌های بانکی'>
        <BankCardsPage />
      </PageContent>
    </PageContainer>
  );
}
