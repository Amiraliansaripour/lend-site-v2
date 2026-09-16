'use client';

import { Menu, X } from 'lucide-react';

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

function ActiveLamp({ active }: { active: boolean }) {
  return (
    <>
      {/* Conical spotlight from the indicator line */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-full transition-opacity duration-300',
          active ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          background:
            'radial-gradient(ellipse 55% 85% at 50% -5%, color-mix(in srgb, var(--brand) 42%, transparent) 0%, color-mix(in srgb, var(--brand) 14%, transparent) 38%, transparent 72%)',
          clipPath: 'polygon(36% 0%, 64% 0%, 100% 100%, 0% 100%)',
        }}
      />

      {/* Brand line at top */}
      <span
        aria-hidden
        className={cn(
          'absolute top-1 z-[2] h-[2.5px] rounded-full bg-brand transition-all duration-300 ease-out',
          active
            ? 'w-5 opacity-100 shadow-[0_0_10px_2px_color-mix(in_srgb,var(--brand)_55%,transparent)]'
            : 'w-2 opacity-0',
        )}
      />
    </>
  );
}

export function DashboardBottomNav() {
  const pathname = usePathname();
  const { toggleSidebar, openMobile } = useSidebar();

  return (
    <nav
      aria-label='منوی داشبورد'
      className='fixed inset-x-4 bottom-4 z-40 md:hidden'
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul
        className={cn(
          'mx-auto flex h-[58px] max-w-md items-stretch gap-0.5 p-1',
          'rounded-full border border-black/[0.05] bg-white/85',
          'dark:border-white/10 dark:bg-card/90',
          'shadow-[0_10px_28px_-14px_rgba(0,0,0,0.22)]',
          'dark:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.55)]',
          'backdrop-blur-xl supports-[backdrop-filter]:bg-white/75',
          'dark:supports-[backdrop-filter]:bg-card/80',
        )}
      >
        {bottomItems.map(item => {
          const isActive = isDashboardNavActive(pathname, item.url);
          const Icon = item.icon;

          return (
            <li key={item.url} className='flex min-w-0 flex-1'>
              <Link
                href={item.url}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-full px-1',
                  'transition-colors duration-300 ease-out active:scale-[0.98]',
                  isActive ? 'text-brand' : 'text-muted-foreground/65 hover:text-foreground/75',
                )}
              >
                <ActiveLamp active={isActive} />
                <Icon className='relative z-[1] size-[17px]' strokeWidth={isActive ? 2.2 : 1.55} />
                <span
                  className={cn(
                    'relative z-[1] truncate text-[10px] leading-none tracking-tight',
                    isActive ? 'font-semibold' : 'font-medium',
                  )}
                >
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
            aria-label={openMobile ? 'بستن منو' : 'باز کردن منو'}
            aria-expanded={openMobile}
            className={cn(
              'relative flex w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-full px-1',
              'transition-colors duration-300 ease-out active:scale-[0.98]',
              openMobile ? 'text-brand' : 'text-muted-foreground/65 hover:text-foreground/75',
            )}
          >
            <ActiveLamp active={openMobile} />
            {openMobile ? (
              <X className='relative z-[1] size-[17px]' strokeWidth={2.2} />
            ) : (
              <Menu className='relative z-[1] size-[17px]' strokeWidth={1.55} />
            )}
            <span
              className={cn(
                'relative z-[1] text-[10px] leading-none tracking-tight',
                openMobile ? 'font-semibold' : 'font-medium',
              )}
            >
              منو
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
