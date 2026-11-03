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
  ShieldCheck,
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
import { Link, usePathname } from '@/i18n/navigation';
import { AUTH_LOGOUT_EVENT } from '@/lib/auth/events';
import { useSiteTemplate } from '@/providers/site-template';
import { useUnreadMessageCount } from '@/queries/message';
import { cn } from '@/lib/utils';

const items = [
  { title: 'کیف پول‌های من', url: '/wallets', icon: Wallet, badgeKey: null },
  // { title: 'سبد خرید', url: '/cart', icon: ShoppingBasket, badgeKey: null },
  { title: 'درخواست اعتبار', url: '/requests', icon: FileText, badgeKey: null },
  { title: 'اقساط من', url: '/installments', icon: CalendarClock, badgeKey: null },
  { title: 'اطلاعات من', url: '/profile', icon: User, badgeKey: null },
  { title: 'ضمانت', url: '/guarantor', icon: ShieldCheck, badgeKey: null },
  // { title: 'کارت‌ها
  // ی بانکی', url: '/cards', icon: CreditCard, badgeKey: null },
  { title: 'راهنما و پشتیبانی', url: '/help', icon: CircleQuestionMark, badgeKey: null },
  { title: 'فروشگاه‌ها', url: '/shops', icon: Store, badgeKey: null },
  { title: 'صندوق پیام', url: '/messages', icon: MessagesSquare, badgeKey: 'messages' as const },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { brandName, getImageUrl } = useSiteTemplate();
  const logoUrl = getImageUrl('logo');
  const { data: unreadCount = 0 } = useUnreadMessageCount();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <Link
            href='/'
            className='relative mb-3 flex w-full items-center justify-center border-b border-sidebar-border py-4 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-l before:from-transparent before:via-primary/35 before:to-transparent'
          >
            {logoUrl ? <img src={logoUrl} alt={brandName} className='mx-auto w-44' /> : null}
          </Link>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => {
                const badge = item.badgeKey === 'messages' ? unreadCount : 0;
                const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        isActive &&
                          'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary',
                      )}
                    >
                      <Link href={item.url} className='flex w-full items-center justify-between'>
                        <span className='flex items-center gap-2'>
                          <item.icon />
                          <span>{item.title}</span>
                        </span>
                        {badge > 0 && (
                          <span className='inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground'>
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
              className='text-red-500 hover:text-red-600 data-[active=true]:bg-red-50 data-[active=true]:text-red-600 dark:hover:text-red-400 dark:data-[active=true]:bg-red-500/15'
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
