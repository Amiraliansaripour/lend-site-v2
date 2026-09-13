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
      className='fixed inset-x-3 bottom-3 z-40 overflow-hidden rounded-[24px] border border-border/60 bg-background/90 shadow-[0_12px_40px_-18px_hsl(var(--foreground)/0.45)] backdrop-blur-2xl md:hidden'
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className='mx-auto flex h-[62px] max-w-lg items-stretch gap-1 px-1.5'>
        {bottomItems.map(item => {
          const isActive = isDashboardNavActive(pathname, item.url);
          const Icon = item.icon;

          return (
            <li key={item.url} className='flex min-w-0 flex-1'>
              <Link
                href={item.url}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative flex w-full flex-col items-center justify-center gap-0.5 rounded-[18px] px-1 text-[11px] transition-all duration-300',
                  isActive
                    ? 'font-semibold text-brand'
                    : 'font-medium text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'relative flex size-9 items-center justify-center rounded-[15px] transition-all duration-300',
                    isActive
                      ? 'before:pointer-events-none before:absolute before:-inset-x-4 before:-bottom-3 before:-top-6 before:z-0 before:bg-[radial-gradient(ellipse_55%_65%_at_50%_0%,hsl(var(--brand)/0.28)_0%,hsl(var(--brand)/0.12)_38%,transparent_72%)] before:blur-[3px]'
                      : 'group-hover:bg-muted/60',
                  )}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className='absolute -top-[5px] left-1/2 z-10 h-[3px] w-7 -translate-x-1/2 rounded-full bg-brand shadow-[0_0_7px_2px_hsl(var(--brand)/0.65),0_0_18px_5px_hsl(var(--brand)/0.28)]'
                    />
                  )}

                  <Icon
                    className='relative z-[1] size-[19px] transition-all duration-300 group-active:scale-95'
                    strokeWidth={isActive ? 2.35 : 1.75}
                  />
                </span>

                <span className='relative z-[1] truncate leading-4'>
                  {item.shortTitle ?? item.title}
                </span>
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
              'group relative flex w-full flex-col items-center justify-center gap-0.5 rounded-[18px] px-1 text-[11px] transition-all duration-300',
              openMobile
                ? 'font-semibold text-brand'
                : 'font-medium text-muted-foreground hover:text-foreground',
            )}
          >
            <span
              className={cn(
                'relative flex size-9 items-center justify-center rounded-[15px] transition-all duration-300',
                openMobile
                  ? 'before:pointer-events-none before:absolute before:-inset-x-4 before:-bottom-3 before:-top-6 before:z-0 before:bg-[radial-gradient(ellipse_55%_65%_at_50%_0%,hsl(var(--brand)/0.28)_0%,hsl(var(--brand)/0.12)_38%,transparent_72%)] before:blur-[3px]'
                  : 'group-hover:bg-muted/60',
              )}
            >
              {openMobile && (
                <span
                  aria-hidden
                  className='absolute -top-[5px] left-1/2 z-10 h-[3px] w-7 -translate-x-1/2 rounded-full bg-brand shadow-[0_0_7px_2px_hsl(var(--brand)/0.65),0_0_18px_5px_hsl(var(--brand)/0.28)]'
                />
              )}

              <Menu
                className='relative z-[1] size-[19px] transition-all duration-300 group-active:scale-95'
                strokeWidth={openMobile ? 2.35 : 1.75}
              />
            </span>

            <span className='relative z-[1] leading-4'>منو</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
