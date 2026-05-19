import {
  Home,
  Store,
  User,
  Wallet,
  FileText,
  CalendarClock,
  CircleQuestionMark,
} from 'lucide-react';

import {
  Sidebar,
  SidebarMenu,
  SidebarGroup,
  SidebarContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import Link from 'next/link';

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
    </Sidebar>
  );
}
