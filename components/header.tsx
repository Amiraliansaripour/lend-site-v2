'use client';

import { useState, useEffect, useRef } from 'react';
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

const WITH_INVERTED_HEADERS = new Set<Href>(['/login']);

export function Header() {
  const pathname = usePathname() as Href;
  const { resolvedTheme } = useTheme();
  const inverted = WITH_INVERTED_HEADERS.has(pathname);
  const transparent = !inverted;
  const isDark = resolvedTheme === 'dark';
  const lightSurface = transparent && !isDark;
  const { brandName, getImageUrl } = useSiteTemplate();
  const logoUrl =
    getImageUrl(inverted || lightSurface ? 'darkLogo' : 'lightLogo') || getImageUrl('logo');

  const [visible, setVisible] = useState<boolean>(true);
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const deltaYRef = useRef<number>(0);
  const scrollYRef = useRef<number>(0);

  const userInfo = getUserInfo();
  const isAuthenticated = !!userInfo;

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;

      setHasScrolled(y !== 0);

      deltaYRef.current += y - scrollYRef.current;
      scrollYRef.current = y;

      const newDeltaY = deltaYRef.current;

      if (newDeltaY >= 150) {
        deltaYRef.current = 0;
        return setVisible(false);
      }

      if (newDeltaY <= -50) {
        deltaYRef.current = 0;
        setVisible(true);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const inkOnLight = mounted && lightSurface;

  return (
    <>
      <header
        className={cn(
          'sticky inset-x-0 top-0 z-10 flex h-[58px] w-full items-center justify-between px-4 transition-[color,background-color,translate,backdrop-filter] md:h-[78px] md:px-6 lg:px-10',
          inverted && 'bg-muted font-medium text-brand',
          transparent && 'absolute',
          transparent && (inkOnLight ? 'text-navy' : 'text-white'),
          !inverted &&
            hasScrolled &&
            (inkOnLight
              ? 'border-b border-navy/10 bg-[#f7f6f3]/90 backdrop-blur-xl'
              : 'border-b border-white/10 bg-navy/90 backdrop-blur-xl'),
          !visible && '-translate-y-full',
        )}
      >
        <div className='relative flex h-full w-full items-center justify-between'>
          <button
            className='z-50 p-2 transition-all duration-200 hover:opacity-80 lg:hidden'
            onClick={toggleMenu}
          >
            <div className='relative flex size-6 items-center justify-center'>
              <Menu
                size={20}
                className={cn(
                  'absolute transition-all duration-300',
                  isMenuOpen ? 'scale-75 rotate-180 opacity-0' : 'scale-100 rotate-0 opacity-100',
                  inkOnLight ? 'text-navy' : 'text-white',
                  !transparent && 'text-black dark:text-foreground',
                )}
              />
              <X
                size={20}
                className={cn(
                  'absolute text-navy transition-all duration-300 dark:text-foreground',
                  isMenuOpen ? 'scale-100 rotate-0 opacity-100' : 'scale-75 -rotate-180 opacity-0',
                )}
              />
            </div>
          </button>

          <Link href='/' className='h-6 flex-shrink-0 lg:order-first'>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={brandName}
                width={120}
                height={24}
                className='h-full w-auto'
                unoptimized
                priority
              />
            ) : null}
          </Link>

          <nav className='hidden gap-5 lg:flex'>
            {NAVBAR.map(item => (
              <NavLink key={item.href} {...item} transparent={transparent} lightInk={inkOnLight} />
            ))}
          </nav>

          <div className='hidden items-center gap-3 lg:flex'>
            <ThemeToggle
              className={cn(
                transparent &&
                  (inkOnLight
                    ? 'border-navy/20 bg-navy/5 text-navy hover:bg-navy/10 hover:text-navy'
                    : 'border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white'),
              )}
            />
            {!isAuthenticated ? (
              <Link
                href='/login'
                className='inline-flex items-center gap-2 rounded-2xl bg-gold px-4 py-2.5 text-sm font-semibold text-navy transition-all hover:bg-gold/90'
              >
                <User size={18} />
                <span>ورود / ثبت نام</span>
              </Link>
            ) : (
              <Link
                href='/wallets'
                className={cn(
                  'inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all',
                  inverted
                    ? 'bg-navy text-gold hover:bg-navy/90'
                    : inkOnLight
                      ? 'bg-navy text-gold hover:bg-navy/90'
                      : 'bg-gold/15 text-gold ring-1 ring-gold/35 hover:bg-gold/25',
                )}
              >
                <User size={18} />
                <span>پروفایل</span>
              </Link>
            )}
          </div>

          <div className='flex items-center gap-1 lg:hidden'>
            <ThemeToggle
              compact
              className={cn(
                transparent &&
                  (inkOnLight
                    ? 'border-navy/20 bg-navy/5 text-navy hover:bg-navy/10 hover:text-navy'
                    : 'border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white'),
              )}
            />
            {!isAuthenticated ? (
              <Link
                className={cn('p-2', inkOnLight ? 'text-navy' : 'text-white')}
                href='/login'
                aria-label='ورود / ثبت نام'
              >
                <LogIn size={20} />
              </Link>
            ) : (
              <Link
                className={cn('p-2', inkOnLight ? 'text-navy' : 'text-white')}
                href='/wallets'
                aria-label='پروفایل'
              >
                <User size={23} />
              </Link>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className='fixed inset-0 z-40 bg-black/50 lg:hidden' onClick={closeMenu}>
          <div
            className='fixed top-[58px] right-0 left-0 z-50 bg-white shadow-lg md:top-[78px] dark:border-b dark:border-border dark:bg-card'
            onClick={e => e.stopPropagation()}
          >
            <nav className='flex flex-col'>
              {NAVBAR.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    'border-b border-gray-200 px-6 py-4 transition-all dark:border-border',
                    pathname === item.href
                      ? 'bg-gold/15 font-medium text-navy'
                      : 'text-navy/80 hover:bg-navy/5 dark:text-foreground',
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

type NavLinkProps = NavItem & { transparent: boolean; lightInk: boolean };

function NavLink({ title, href, transparent, lightInk }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === pathname;

  return (
    <Link
      href={href}
      className={cn(
        'border-b-2 transition-all hover:font-medium',
        isActive ? 'border-current font-medium' : 'border-transparent hover:border-current',
        transparent
          ? lightInk
            ? isActive
              ? 'text-navy'
              : 'text-navy/60 hover:text-navy'
            : isActive
              ? 'text-gold'
              : 'text-white/70 hover:text-gold'
          : isActive
            ? 'text-gold'
            : 'text-gray-600 hover:text-navy dark:text-foreground dark:hover:text-gold',
      )}
    >
      {title}
    </Link>
  );
}
