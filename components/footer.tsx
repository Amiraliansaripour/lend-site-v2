import Image from 'next/image';

import Logo from '@/assets/logo.png';

import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';

export function Footer() {
  return (
    <footer>
      <section className='bg-muted py-12'>
        <div className='container flex flex-col md:flex-row justify-between gap-x-6 gap-y-10'>
          <section className='basis-1/3 min-w-67.5 grid gap-4'>
            <Link href='/'>
              <Image src={Logo} alt='logo' width={200} height={100} className='w-52' />
            </Link>

            <p className='leading-7 text-balance'>
              نیکالِند به دنبال آن است تا با بهره‌گیری از روندهای نوظهور در حوزه فناوری مالی و با
              اتکاء به تیمی مجرب، تجربه‌ای متفاوت از ارائه خدمات مالی برخط را برای کاربران خود رقم
              بزند. رسالت ما توانمندسازی افراد و کسب‌وکارها از طریق ارائه راه‌حل‌های وام‌دهی شفاف،
              سریع و امن، با تمرکز بر تسهیل دسترسی همگانی به خدمات مالی است.
            </p>
          </section>

          <section className='basis-7/12'>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-6 gap-y-8'>
              <section>
                <h5 className='font-bold'>نیکالند</h5>
                <nav className='text-sm'>
                  <ul className='space-y-2 mt-3'>
                    <li>
                      <Link href='#about-us'>درباره ما</Link>
                    </li>
                    <li>
                      <Link href='#blog'>مجله نیکا</Link>
                    </li>
                  </ul>
                </nav>
              </section>
              <section>
                <h5 className='font-bold'>راهنمای مشتریان</h5>
                <nav className='text-sm'>
                  <ul className='space-y-2 mt-3'>
                    <li>
                      <a href='tel:#'>راهنما و پشتیبانی</a>
                    </li>
                    <li>
                      <a href='mailto:#'>خرید اقساطی</a>
                    </li>
                  </ul>
                </nav>
              </section>
              <section>
                <h5 className='font-bold'>ارتباط با ما</h5>
                <nav className='text-sm'>
                  <ul className='space-y-2 mt-3'>
                    <li>
                      <a href='tel:#'>تلفن: 91200528-021</a>
                    </li>
                    <li>
                      <a href='mailto:#'>ایمیل: info@nikalend.ir</a>
                    </li>
                  </ul>
                </nav>
              </section>
            </div>
            <div className='flex justify-end mt-12'>
              <Card className='py-0'>
                <CardContent className='grid place-items-center p-3'>
                  <img src='#' alt='trust seal' className='size-20' />
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </section>

      <section className='bg-brand text-sm text-background py-3'>
        <div className='container flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
          <div className='flex items-center gap-x-2'>
            <span className='text-lg -mb-1'>&copy;</span>
            <span>{new Date().getFullYear()}</span>
            <p className='text-left rtl:text-right'>کلیه حقوق این سایت متعلق به نیکالند می باشد.</p>
          </div>

          <a href='mailto:#' className='-mb-1'>
            mail@nikalend.ir
          </a>
        </div>
      </section>
    </footer>
  );
}
