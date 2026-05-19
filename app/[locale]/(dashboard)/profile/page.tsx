'use client';

import { Breadcrumbs, PageContainer } from '@/components/page-container';
import { PageContent } from '@/components/page-content';
import CombinedUserForm from '@/components/page/profile/CombinedUserForm';
// * auth
import { getUserId } from '@/lib/auth/client/user-info';

// * queries
import { useUserWithStore } from '@/queries/users';

export default function ProfilePage() {
  const userId = getUserId();

  const { data: user, isLoading } = useUserWithStore(userId || '');

  if (isLoading) {
    return <div>در حال بارگذاری...</div>;
  }

  if (!user) {
    return <div>کاربر یافت نشد</div>;
  }
  const breadcrumbs: Breadcrumbs = [
    { label: 'داشبورد', href: '/dashboard' },
    { label: 'پروفایل', href: '/profile' },
  ];
  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <PageContent title='پروفایل'>
        <CombinedUserForm user={user} />
      </PageContent>
    </PageContainer>
  );
}
