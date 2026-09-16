'use client';

import { ArrowRight, LogOut } from 'lucide-react';

import {
  Sidebar,
  SidebarMenu,
  SidebarGroup,
  SidebarContent,
  SidebarFooter,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { Link, usePathname } from '@/i18n/navigation';
import { AUTH_LOGOUT_EVENT } from '@/lib/auth/events';
import { BoomLogo } from './brand/boom-logo';
import { DASHBOARD_NAV_ITEMS, isDashboardNavActive } from '@/components/dashboard-nav';
import { useUnreadMessageCount } from '@/queries/message';
// import { CUSTOMER_CLUB_URL } from '@/components/customer-club-back-button';

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const { data: unreadCount = 0 } = useUnreadMessageCount();

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <Link
            href='/'
            onClick={closeMobile}
            className='mb-3 flex w-full items-center justify-center border-b border-border py-4'
          >
            <BoomLogo markClassName='size-9' wordmarkClassName='text-xl' />
          </Link>
          <SidebarGroupContent>
            <SidebarMenu>
              {DASHBOARD_NAV_ITEMS.map(item => {
                const isActive = isDashboardNavActive(pathname, item.url);
                const badge = item.badgeKey === 'messages' ? unreadCount : 0;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={item.url}
                        onClick={closeMobile}
                        className='flex w-full items-center justify-between'
                      >
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
          {/* <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href={CUSTOMER_CLUB_URL} rel='noopener noreferrer' onClick={closeMobile}>
                <ArrowRight />
                <span>بازگشت به باشگاه مشتریان</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => dispatchEvent(AUTH_LOGOUT_EVENT)}
              className='text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 data-[active=true]:bg-red-50 data-[active=true]:text-red-600 dark:data-[active=true]:bg-red-500/10 dark:data-[active=true]:text-red-400'
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
