'use client';

import { LogOut } from 'lucide-react';

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

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

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
            className='mb-3 flex w-full items-center justify-center border-b border-gray-200 py-4'
          >
            <BoomLogo markClassName='size-9' wordmarkClassName='text-xl' />
          </Link>
          <SidebarGroupContent>
            <SidebarMenu>
              {DASHBOARD_NAV_ITEMS.map(item => {
                const isActive = isDashboardNavActive(pathname, item.url);
                const badge = item.badge ?? 0;

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
