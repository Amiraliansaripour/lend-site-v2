'use client';

import { Breadcrumbs, PageContainer } from '@/components/page-container';
import { PageContent } from '@/components/page-content';
import { MessagesPageContent } from '@/components/page/messages/messages-page-content';

export default function MessagesPage() {
  const breadcrumbs: Breadcrumbs = [
    { label: 'کیف پول های من', href: '/wallets' },
    { label: 'صندوق پیام', href: '/messages' },
  ];

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <PageContent title='صندوق پیام'>
        <MessagesPageContent />
      </PageContent>
    </PageContainer>
  );
}
