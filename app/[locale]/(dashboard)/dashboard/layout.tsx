import { redirect } from '@/i18n/navigation';
import { isAuthenticated } from '@/lib/auth/server';

export default async function DashboardLayout({
  params,
  children,
}: LayoutProps<'/[locale]/dashboard'>) {
  const { locale } = await params;

  const authenticated = await isAuthenticated();
  if (!authenticated) redirect({ locale, href: '/login' });

  return children;
}
