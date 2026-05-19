'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Menu, User, LogIn } from 'lucide-react';

import Logo from '@/assets/logo.png';
import LogoWhite from '@/assets/logo-white.png';

import { cn } from '@/lib/utils';
import { Link, usePathname } from '@/i18n/navigation';
import { getUserInfo } from '@/lib/auth/client/user-info';

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

const WITH_INVERTED_HEADERS = new Set<Href>([]);

export function Header() {
  const pathname = usePathname() as Href;
  const inverted = WITH_INVERTED_HEADERS.has(pathname);
  const transparent = !inverted;

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
      <header
        className={cn(
          'h-[58px] md:h-[78px] w-full flex justify-between items-center px-4 md:px-6 lg:px-10 sticky top-0 inset-x-0 z-10 transition-[color,background-color,translate]',
          inverted ? 'bg-muted text-brand font-medium' : 'bg-transparent text-white absolute',
          !inverted && hasScrolled && 'bg-brand',
          !visible && '-translate-y-full',
        )}
      >
        <div className='w-full h-full flex justify-between items-center relative'>
          {/* Mobile Menu Button */}
          <button
            className='lg:hidden p-2 text-gray-600 hover:text-black transition-all duration-200'
            onClick={toggleMenu}
          >
            <div className='relative w-6 h-6 flex items-center justify-center'>
              <Menu
                size={20}
                className={cn(
                  'absolute transition-all duration-300',
                  isMenuOpen ? 'opacity-0 rotate-180 scale-75' : 'opacity-100 rotate-0 scale-100',
                  transparent && 'text-white',
                  !transparent && 'text-black',
                )}
              />
              <X
                size={20}
                className={cn(
                  'absolute transition-all duration-300 text-black',
                  isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-75',
                )}
              />
            </div>
          </button>

          {/* Logo */}
          <Link href='/' className='h-6 flex-shrink-0 lg:order-first'>
            {inverted ? (
              <Image
                src='/logos/logo-white.png'
                alt='logo'
                width={120}
                height={24}
                className='h-full w-auto'
              />
            ) : (
              <Image
                src='/logos/logo-white.png'
                alt='logo'
                width={120}
                height={24}
                className='h-full w-auto'
              />
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden lg:flex gap-5'>
            {NAVBAR.map(item => (
              <NavLink key={item.href} {...item} transparent={transparent} />
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className='hidden lg:block'>
            {!isAuthenticated ? (
              <Link
                href='/login'
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all',
                  transparent
                    ? 'text-white border-white hover:bg-white/10'
                    : 'text-black border-black hover:bg-black/10',
                )}
              >
                <User size={18} />
                <span>ورود / ثبت نام</span>
              </Link>
            ) : (
              <Link
                href='/dashboard'
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all',
                  'text-white border-white hover:bg-white/10',
                )}
              >
                <User size={18} />
                <span>پروفایل</span>
              </Link>
            )}
          </div>

          {/* Mobile Auth Button */}
          {!isAuthenticated ? (
            <Link className='lg:hidden' href='/login'>
              <button className='p-2'>
                <LogIn className={cn('text-black', transparent && 'text-white')} size={20} />
              </button>
            </Link>
          ) : (
            <Link className='lg:hidden' href='/dashboard'>
              <button className='p-2'>
                <User className={cn('text-black', transparent && 'text-white')} size={23} />
              </button>
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='fixed inset-0 bg-black/50 z-40 lg:hidden' onClick={closeMenu}>
          <div
            className='fixed top-[58px] md:top-[78px] left-0 right-0 bg-white shadow-lg z-50'
            onClick={e => e.stopPropagation()}
          >
            <nav className='flex flex-col'>
              {NAVBAR.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    'px-6 py-4 border-b border-gray-200 transition-all',
                    pathname === item.href
                      ? 'text-brand font-medium bg-gray-50'
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

function NavLink({ title, href, transparent }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === pathname;

  return (
    <Link
      href={href}
      className={cn(
        'border-b-2 transition-all hover:font-medium',
        isActive ? 'font-medium border-current' : 'border-transparent hover:border-current',
        transparent
          ? isActive
            ? 'text-white'
            : 'text-gray-300 hover:text-white'
          : isActive
            ? 'text-brand'
            : 'text-gray-600 hover:text-brand',
      )}
    >
      {title}
    </Link>
  );
}
