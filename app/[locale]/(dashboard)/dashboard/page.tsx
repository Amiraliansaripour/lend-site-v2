import { redirect } from '@/i18n/navigation';

type DashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  redirect({ locale, href: '/wallets' });
}
