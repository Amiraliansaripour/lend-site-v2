'use client';

import {
  Store,
  User,
  Wallet,
  FileText,
  MessagesSquare,
  CalendarClock,
  CircleQuestionMark,
  LogOut,
} from 'lucide-react';

import {
  Sidebar,
  SidebarMenu,
  SidebarGroup,
  SidebarContent,
  SidebarFooter,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { AUTH_LOGOUT_EVENT } from '@/lib/auth/events';
import { useSiteTemplate } from '@/providers/site-template';
import { useUnreadMessageCount } from '@/queries/message';

const items = [
  { title: 'کیف پول‌های من', url: '/wallets', icon: Wallet, badgeKey: null },
  // { title: 'سبد خرید', url: '/cart', icon: ShoppingBasket, badgeKey: null },
  { title: 'درخواست های من', url: '/requests', icon: FileText, badgeKey: null },
  { title: 'اقساط من', url: '/installments', icon: CalendarClock, badgeKey: null },
  { title: 'اطلاعات من', url: '/profile', icon: User, badgeKey: null },
  // { title: 'کارت‌ها
  // ی بانکی', url: '/cards', icon: CreditCard, badgeKey: null },
  { title: 'راهنما و پشتیبانی', url: '/help', icon: CircleQuestionMark, badgeKey: null },
  { title: 'فروشگاه‌ها', url: '/shops', icon: Store, badgeKey: null },
  { title: 'صندوق پیام', url: '/messages', icon: MessagesSquare, badgeKey: 'messages' as const },
];

export function AppSidebar() {
  const { brandName, getImageUrl } = useSiteTemplate();
  const logoUrl = getImageUrl('logo');
  const { data: unreadCount = 0 } = useUnreadMessageCount();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <Link
            href='/'
            className='flex justify-center items-center mb-3 border-b border-gray-200 w-full py-4'
          >
            {logoUrl ? <img src={logoUrl} alt={brandName} className='w-44 mx-auto' /> : null}
          </Link>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => {
                const badge = item.badgeKey === 'messages' ? unreadCount : 0;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url} className='flex items-center justify-between w-full'>
                        <span className='flex items-center gap-2'>
                          <item.icon />
                          <span>{item.title}</span>
                        </span>
                        {badge > 0 && (
                          <span className='inline-flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold'>
                            {badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => dispatchEvent(AUTH_LOGOUT_EVENT)}
              className='text-red-500 hover:text-red-600 data-[active=true]:bg-red-50 data-[active=true]:text-red-600'
            >
              <LogOut />
              <span>خروج</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
