'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Menu, User, LogIn } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Link, usePathname } from '@/i18n/navigation';
import { getUserInfo } from '@/lib/auth/client/user-info';
import { BoomLogo } from '@/components/brand/boom-logo';

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
  const transparent = false;

  const [visible, setVisible] = useState<boolean>(true);
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const deltaYRef = useRef<number>(0);
  const scrollYRef = useRef<number>(0);

  const userInfo = getUserInfo();
  const isAuthenticated = !!userInfo;

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

  return (
    <>
      <div className='sticky top-0 lg:top-3 inset-x-0 z-40 w-full flex justify-center px-0 lg:px-6 transition-transform duration-300'>
        <header
          className={cn(
            'w-full h-[52px] flex justify-between items-center px-4 transition-all duration-300',
            'lg:max-w-5xl lg:rounded-full lg:bg-white/95 lg:backdrop-blur-md lg:shadow-[0_8px_20px_rgba(0,0,0,0.05)] lg:border lg:border-gray-100',
            'max-lg:bg-white/90 max-lg:backdrop-blur-md max-lg:border-b max-lg:border-brand/10',
            hasScrolled && 'max-lg:shadow-md',
            !visible && '-translate-y-full lg:-translate-y-[calc(100%+2rem)]',
          )}
        >
          <div className='w-full h-full flex justify-between items-center relative'>
            {/* Mobile Menu Button */}
            <button
              className='lg:hidden p-2 text-gray-600 hover:text-black transition-all duration-200 !z-50'
              onClick={toggleMenu}
            >
              <div className='relative w-6 h-6 flex items-center justify-center'>
                <Menu
                  size={18}
                  className={cn(
                    'absolute transition-all duration-300',
                    isMenuOpen ? 'opacity-0 rotate-180 scale-75' : 'opacity-100 rotate-0 scale-100',
                    transparent ? 'text-white' : 'text-black',
                  )}
                />
                <X
                  size={18}
                  className={cn(
                    'absolute transition-all duration-300 text-black',
                    isMenuOpen
                      ? 'opacity-100 rotate-0 scale-100'
                      : 'opacity-0 -rotate-180 scale-75',
                  )}
                />
              </div>
            </button>

            <Link href='/' className='flex-shrink-0 pr-1' aria-label='BOOM UP'>
              <BoomLogo markClassName='size-6' wordmarkClassName='text-sm md:text-base' />
            </Link>

            <nav className='hidden lg:flex items-center gap-5 h-full'>
              {NAVBAR.map(item => (
                <NavLink key={item.href} {...item} transparent={transparent} />
              ))}
            </nav>

            <div className='hidden lg:flex items-center gap-2'>
              <a
                href='https://tcclub.ir/app'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center rounded-full border border-brand px-4 py-1.5 text-brand text-xs font-semibold transition-colors hover:bg-brand/5'
              >
                باشگاه مشتریان
              </a>
              {!isAuthenticated ? (
                <Link
                  href='/login'
                  className='inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-white text-xs font-semibold transition-all hover:bg-brand/90 hover:shadow-md hover:shadow-brand/20'
                >
                  <User size={15} />
                  <span>ورود</span>
                </Link>
              ) : (
                <Link
                  href='/wallets'
                  className='inline-flex items-center gap-1.5 rounded-full border border-brand px-4 py-1.5 text-brand text-xs font-semibold transition-colors hover:bg-brand/5'
                >
                  <User size={15} />
                  <span>پروفایل</span>
                </Link>
              )}
            </div>

            {/* Mobile Auth Button */}
            <div className='lg:hidden flex items-center gap-1'>
              <a
                href='https://tcclub.ir/app'
                target='_blank'
                rel='noopener noreferrer'
                className={cn(
                  'px-2 py-1 text-[11px] font-semibold text-brand',
                  transparent && 'text-white',
                )}
                aria-label='باشگاه مشتریان'
              >
                باشگاه
              </a>
              {!isAuthenticated ? (
                <Link
                  className={cn('p-2', transparent ? 'text-white' : 'text-black')}
                  href='/login'
                  aria-label='ورود'
                >
                  <LogIn size={18} />
                </Link>
              ) : (
                <Link
                  className={cn('p-2', transparent ? 'text-white' : 'text-black')}
                  href='/dashboard'
                  aria-label='پروفایل'
                >
                  <User size={20} />
                </Link>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='fixed inset-0 bg-black/50 z-40 lg:hidden' onClick={closeMenu}>
          <div
            className='fixed top-[52px] left-0 right-0 bg-white shadow-lg z-50'
            onClick={e => e.stopPropagation()}
          >
            <nav className='flex flex-col'>
              {NAVBAR.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    'px-6 py-3.5 border-b border-gray-200 transition-all text-sm',
                    pathname === item.href
                      ? 'text-brand font-bold bg-gray-50'
                      : 'text-gray-700 hover:bg-gray-50',
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

type NavLinkProps = NavItem & { transparent: boolean };

function NavLink({ title, href }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === pathname;

  return (
    <Link
      href={href}
      className={cn(
        'relative h-full flex items-center text-xs md:text-[13px] transition-colors px-1',
        isActive ? 'font-bold text-gray-900' : 'text-gray-600 hover:text-gray-900 font-medium',
      )}
    >
      <span>{title}</span>
      {isActive && <span className='absolute bottom-0 inset-x-0 h-[3px] bg-brand rounded-t-full' />}
    </Link>
  );
}
