'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Menu, User, LogIn } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import { Link, usePathname } from '@/i18n/navigation';
import { getUserInfo } from '@/lib/auth/client/user-info';
import { useSiteTemplate } from '@/providers/site-template';
import { ThemeToggle } from '@/components/theme-toggle';

type Href = `/${string}`;

type NavItem = {
  title: string;
  href: Href;
};

const NAVBAR: NavItem[] = [
  { title: 'صفحه‌ اصلی', href: '/' },
  { title: 'دریافت اعتبار', href: '/requests' },
  { title: 'فروشگاه‌ها', href: '/shops' },
  { title: 'راهنما و پشتیبانی', href: '/help' },
  { title: 'ثبت نام فروشگاه‌ها', href: '/merchant-signup' },
];

export function Header() {
  const pathname = usePathname() as Href;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { brandName, getImageUrl } = useSiteTemplate();
  const logoUrl = getImageUrl(isDark ? 'lightLogo' : 'darkLogo') || getImageUrl('logo');

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userInfo = getUserInfo();
  const isAuthenticated = !!userInfo;

  const toggleMenu = () => {
    setIsMenuOpen(open => !open);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className='pointer-events-none fixed inset-x-0 top-0 z-50 flex w-full justify-center px-3 pt-3 md:px-6 md:pt-4 lg:px-10'>
        <div
          className={cn(
            'pointer-events-auto relative flex h-14 w-full max-w-6xl items-center justify-between gap-3 rounded-full px-3 md:h-16 md:gap-4 md:px-5',
            'border border-white/70 bg-white/75 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl',
            'dark:border-white/10 dark:bg-navy/70 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)]',
          )}
        >
          <button
            type='button'
            className='z-50 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/80 text-navy transition-all duration-200 hover:bg-muted lg:hidden dark:bg-white/10 dark:text-white'
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'بستن منو' : 'باز کردن منو'}
          >
            <div className='relative flex size-5 items-center justify-center'>
              <Menu
                size={18}
                className={cn(
                  'absolute transition-all duration-300',
                  isMenuOpen ? 'scale-75 rotate-180 opacity-0' : 'scale-100 rotate-0 opacity-100',
                )}
              />
              <X
                size={18}
                className={cn(
                  'absolute transition-all duration-300',
                  isMenuOpen ? 'scale-100 rotate-0 opacity-100' : 'scale-75 -rotate-180 opacity-0',
                )}
              />
            </div>
          </button>

          <Link href='/' className='h-7 shrink-0 lg:order-first'>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={brandName}
                width={120}
                height={28}
                className='h-full w-auto'
                unoptimized
                priority
              />
            ) : null}
          </Link>

          <nav className='hidden items-center gap-1 lg:flex xl:gap-2'>
            {NAVBAR.map(item => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          <div className='hidden items-center gap-2.5 lg:flex'>
            <ThemeToggle className='border-transparent bg-muted text-navy/70 hover:bg-muted/80 hover:text-navy dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15 dark:hover:text-white' />
            {!isAuthenticated ? (
              <Link
                href='/login'
                className='inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-gold/90'
              >
                <User size={16} />
                <span>ورود</span>
              </Link>
            ) : (
              <Link
                href='/wallets'
                className='inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-gold/90'
              >
                <User size={16} />
                <span>پروفایل</span>
              </Link>
            )}
          </div>

          <div className='flex items-center gap-1.5 lg:hidden'>
            <ThemeToggle
              compact
              className='border-transparent bg-muted text-navy/70 hover:bg-muted/80 hover:text-navy dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15 dark:hover:text-white'
            />
            {!isAuthenticated ? (
              <Link
                className='inline-flex size-9 items-center justify-center rounded-full bg-gold text-navy'
                href='/login'
                aria-label='ورود'
              >
                <LogIn size={18} />
              </Link>
            ) : (
              <Link
                className='inline-flex size-9 items-center justify-center rounded-full bg-gold text-navy'
                href='/wallets'
                aria-label='پروفایل'
              >
                <User size={18} />
              </Link>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className='fixed inset-0 z-40 bg-black/40 lg:hidden' onClick={closeMenu}>
          <div
            className='fixed top-19 right-3 left-3 z-50 overflow-hidden rounded-3xl border border-border/60 bg-white shadow-xl md:top-21 dark:border-white/10 dark:bg-card'
            onClick={e => e.stopPropagation()}
          >
            <nav className='flex flex-col'>
              {NAVBAR.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    'border-b border-border/60 px-5 py-3.5 text-sm transition-all last:border-b-0 dark:border-border',
                    pathname === item.href
                      ? 'bg-gold/20 font-semibold text-navy dark:bg-gold/15 dark:text-gold'
                      : 'text-navy/80 hover:bg-muted/60 dark:text-foreground',
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({ title, href }: NavItem) {
  const pathname = usePathname();
  const isActive = href === pathname;

  return (
    <Link
      href={href}
      className={cn(
        'relative px-2.5 py-1.5 text-sm transition-colors xl:px-3',
        isActive
          ? 'font-semibold text-navy dark:text-white'
          : 'text-navy/65 hover:text-navy dark:text-white/65 dark:hover:text-white',
      )}
    >
      {title}
      <span
        className={cn(
          'absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-gold transition-opacity xl:inset-x-3',
          isActive ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden
      />
    </Link>
  );
}
