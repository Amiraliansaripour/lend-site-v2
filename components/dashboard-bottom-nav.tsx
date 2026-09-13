'use client';

import { Menu } from 'lucide-react';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import {
  DASHBOARD_BOTTOM_NAV_URLS,
  DASHBOARD_NAV_ITEMS,
  isDashboardNavActive,
} from '@/components/dashboard-nav';

const bottomItems = DASHBOARD_NAV_ITEMS.filter(item =>
  (DASHBOARD_BOTTOM_NAV_URLS as readonly string[]).includes(item.url),
);

export function DashboardBottomNav() {
  const pathname = usePathname();
  const { toggleSidebar, openMobile } = useSidebar();

  return (
    <nav
      aria-label='منوی داشبورد'
      className='fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-white/95 backdrop-blur-md md:hidden'
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <ul className='mx-auto flex h-14 max-w-lg items-stretch justify-between px-1'>
        {bottomItems.map(item => {
          const isActive = isDashboardNavActive(pathname, item.url);
          const Icon = item.icon;

          return (
            <li key={item.url} className='flex min-w-0 flex-1'>
              <Link
                href={item.url}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex w-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] transition-colors',
                  isActive ? 'font-bold text-brand' : 'font-medium text-muted-foreground',
                )}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className='absolute inset-x-3 top-0 h-[3px] rounded-b-full bg-brand'
                  />
                )}
                <Icon className='size-5' strokeWidth={isActive ? 2.25 : 1.75} />
                <span className='truncate'>{item.shortTitle ?? item.title}</span>
              </Link>
            </li>
          );
        })}

        <li className='flex min-w-0 flex-1'>
          <button
            type='button'
            onClick={toggleSidebar}
            aria-label='باز کردن منو'
            aria-expanded={openMobile}
            className={cn(
              'relative flex w-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] transition-colors',
              openMobile ? 'font-bold text-brand' : 'font-medium text-muted-foreground',
            )}
          >
            {openMobile && (
              <span
                aria-hidden
                className='absolute inset-x-3 top-0 h-[3px] rounded-b-full bg-brand'
              />
            )}
            <Menu className='size-5' strokeWidth={openMobile ? 2.25 : 1.75} />
            <span>منو</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
