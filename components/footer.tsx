'use client';

import Image from 'next/image';

import { Link } from '@/i18n/navigation';
import { useSiteTemplate } from '@/providers/site-template';

export function Footer() {
  const { brandName, email, phone, address, getImageUrl, withBrand } = useSiteTemplate();
  const logoUrl = getImageUrl('darkLogo') || getImageUrl('logo');
  const mailto = email ? `mailto:${email}` : undefined;
  const tel = phone ? `tel:${phone}` : undefined;

  return (
    <footer>
      <section className='border-t border-navy/10 bg-[#f7f6f3] text-navy dark:border-white/10 dark:bg-navy dark:text-white'>
        <div className='container grid gap-10 py-12 md:grid-cols-[1.2fr_1fr] md:gap-12 md:py-16'>
          <div className='space-y-5'>
            <Link href='/' className='inline-block'>
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={brandName}
                  width={200}
                  height={100}
                  className='w-44 dark:brightness-0 dark:invert'
                  unoptimized
                />
              ) : (
                <span className='text-2xl font-bold text-navy dark:text-gold'>{brandName}</span>
              )}
            </Link>
            <p className='max-w-xl leading-8 text-navy/65 text-pretty dark:text-white/65'>
              {withBrand(
                'کارالند با تمرکز بر شفافیت و سرعت، خدمات مالی برخط را برای خرید اقساطی در دسترس قرار می‌دهد.',
              )}
            </p>
          </div>

          <div className='grid gap-8 sm:grid-cols-3'>
            <div>
              <h5 className='mb-3 font-bold text-navy dark:text-gold'>{brandName}</h5>
              <ul className='space-y-2 text-sm text-navy/65 dark:text-white/65'>
                <li>
                  <Link
                    href='/about-us'
                    className='transition-colors hover:text-navy dark:hover:text-gold'
                  >
                    درباره ما
                  </Link>
                </li>
                <li>
                  <Link
                    href='/shops'
                    className='transition-colors hover:text-navy dark:hover:text-gold'
                  >
                    فروشگاه‌ها
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className='mb-3 font-bold text-navy dark:text-gold'>راهنمای مشتریان</h5>
              <ul className='space-y-2 text-sm text-navy/65 dark:text-white/65'>
                <li>
                  <Link
                    href='/help'
                    className='transition-colors hover:text-navy dark:hover:text-gold'
                  >
                    راهنما و پشتیبانی
                  </Link>
                </li>
                <li>
                  <Link
                    href='/requests'
                    className='transition-colors hover:text-navy dark:hover:text-gold'
                  >
                    خرید اقساطی
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className='mb-3 font-bold text-navy dark:text-gold'>ارتباط با ما</h5>
              <ul className='space-y-2 text-sm text-navy/65 dark:text-white/65'>
                {phone ? (
                  <li>
                    <a
                      href={tel}
                      className='transition-colors hover:text-navy dark:hover:text-gold'
                    >
                      تلفن: {phone}
                    </a>
                  </li>
                ) : null}
                {email ? (
                  <li>
                    <a
                      href={mailto}
                      className='transition-colors hover:text-navy dark:hover:text-gold'
                    >
                      ایمیل: {email}
                    </a>
                  </li>
                ) : null}
                {address ? <li>آدرس: {address}</li> : null}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className='border-t border-navy/10 bg-[#f7f6f3] text-sm text-navy/50 dark:border-white/10 dark:bg-navy dark:text-white/50'>
        <div className='container flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4'>
          <div className='flex items-center gap-x-2'>
            <span className='-mb-1 text-lg'>&copy;</span>
            <span>{new Date().getFullYear()}</span>
            <p>{withBrand('کلیه حقوق این سایت متعلق به کارالند می باشد.')}</p>
          </div>
          {email ? (
            <a href={mailto} className='transition-colors hover:text-navy dark:hover:text-gold'>
              {email}
            </a>
          ) : null}
        </div>
      </section>
    </footer>
  );
}
