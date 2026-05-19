import { redirect } from '@/i18n/navigation';
import { isAuthenticated } from '@/lib/auth/server';
import { DashboardLayoutClient } from './layout-client';

export default async function DashboardLayout({
  params,
  children,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;

  const authenticated = await isAuthenticated();
  if (!authenticated) redirect({ locale, href: '/login' });

  return <DashboardLayoutClient children={children} />;
}
