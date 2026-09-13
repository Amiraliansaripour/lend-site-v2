import {
  Store,
  User,
  Wallet,
  FileText,
  MessagesSquare,
  CalendarClock,
  CircleQuestionMark,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';

import { TOTAL_UNREAD } from '@/components/page/messages/messages-page-content';

export type DashboardNavItem = {
  title: string;
  shortTitle?: string;
  url: string;
  icon: LucideIcon;
  badge?: number;
};

/** Full dashboard navigation (sidebar). */
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { title: 'کیف پول‌های من', shortTitle: 'کیف پول', url: '/wallets', icon: Wallet },
  { title: 'درخواست های من', shortTitle: 'درخواست‌ها', url: '/requests', icon: FileText },
  { title: 'اقساط من', shortTitle: 'اقساط', url: '/installments', icon: CalendarClock },
  { title: 'اطلاعات من', shortTitle: 'پروفایل', url: '/profile', icon: User },
  { title: 'کارت‌های بانکی', shortTitle: 'کارت‌ها', url: '/cards', icon: CreditCard },
  { title: 'راهنما و پشتیبانی', shortTitle: 'راهنما', url: '/help', icon: CircleQuestionMark },
  { title: 'فروشگاه‌ها', shortTitle: 'فروشگاه', url: '/shops', icon: Store },
  {
    title: 'صندوق پیام',
    shortTitle: 'پیام‌ها',
    url: '/messages',
    icon: MessagesSquare,
    badge: TOTAL_UNREAD,
  },
];

/** Primary tabs shown in the mobile bottom bar (overflow lives in the side menu). */
export const DASHBOARD_BOTTOM_NAV_URLS = [
  '/wallets',
  '/requests',
  '/installments',
  '/profile',
] as const;

export function isDashboardNavActive(pathname: string, url: string) {
  if (pathname === url) return true;
  return pathname.startsWith(`${url}/`);
}
