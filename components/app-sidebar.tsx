import {
  Home,
  Store,
  User,
  Wallet,
  FileText,
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

const items = [
  { title: 'داشبورد', url: '/dashboard', icon: Home },
  { title: 'کیف پول‌های من', url: '/wallets', icon: Wallet },
  { title: 'درخواست های من', url: '/requests', icon: FileText },
  { title: 'اقساط من', url: '/installments', icon: CalendarClock },
  { title: 'اطلاعات من', url: '/profile', icon: User },
  { title: 'راهنما و پشتیبانی', url: '/help', icon: CircleQuestionMark },
  { title: 'فروشگاه‌ها', url: '/shops', icon: Store },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <Link
            href='/'
            className='flex justify-center items-center mb-3 border-b border-gray-200 w-full py-4'
          >
            <img src='/logos/black-logo.png' className='w-44  mx-auto' />
          </Link>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
