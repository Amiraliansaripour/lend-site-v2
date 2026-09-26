'use client';

import { Breadcrumbs, PageContainer } from '@/components/page-container';
import { PageContent } from '@/components/page-content';
import { CartWorkflowPage } from '@/components/page/cart/cart-workflow-page';

export default function CartPage() {
  const breadcrumbs: Breadcrumbs = [
    { label: 'کیف پول های من', href: '/wallets' },
    { label: 'سبد خرید', href: '/cart' },
  ];

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <PageContent title='سبد خرید کاربر'>
        <CartWorkflowPage />
      </PageContent>
    </PageContainer>
  );
}
