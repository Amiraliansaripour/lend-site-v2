'use client';

import { Breadcrumbs, PageContainer } from '@/components/page-container';
import { PageContent } from '@/components/page-content';
import { Button } from '@/components/ui/button';
import { WalletCard } from '@/components/wallet-card';
import Link from 'next/link';
import { getUserId } from '@/lib/auth/client/user-info';
import { useUserWithStore } from '@/queries/users';
import Image from 'next/image';

export default function DashboardPage() {
  const breadcrumbs: Breadcrumbs = [{ label: 'داشبورد', href: '/dashboard' }];
  const userId = getUserId();

  // Fetch and update user info on dashboard load
  useUserWithStore(userId || '');

  // * Api
  // * get wallets
  // * user transactions

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <PageContent title='کیف پول های من'>
        <div className='w-full flex items-center justify-center gap-10'>
          <div className='flex items-center justify-center gap-10 max-lg:flex-col'>
            <WalletCard isFlippable>
              <WalletCard.Front>
                <div className='absolute left-0 top-0 w-full flex items-center justify-end'>
                  <Image src='/logos/logo-white.png' width={64} height={20} alt='' />
                </div>

                <div className='absolute bottom-0'>
                  <div className='flex flex-col gap-4'>
                    <span>کیف پول اعتباری</span>
                    <div className='text-sm'>موجودی 0 ریال</div>
                  </div>
                </div>
              </WalletCard.Front>

              <WalletCard.Back>
                <WalletCard.MagStripe />
                <div className='flex items-center justify-end mt-20'>
                  <p className='text-sm leading-6'>
                    کیف پول اعتباری به شما امکان می‌دهد بدون پرداخت نقدی فوری، با استفاده از اعتبار
                    تخصیص‌داده‌شده خرید و پرداخت انجام دهید و هزینه‌ها را در زمان مقرر یا به‌صورت
                    اقساط تسویه کنید.
                  </p>
                </div>
              </WalletCard.Back>
            </WalletCard>

            <WalletCard isFlippable>
              <WalletCard.Front>
                <div className='absolute left-0 top-0 w-full flex items-center justify-end'>
                  <Image src='/logos/logo-white.png' width={64} height={20} alt='' />
                </div>

                <div className='absolute bottom-0'>
                  <div className='flex flex-col gap-4'>
                    <span>کیف پول نقدی</span>
                    <div className='text-sm'>موجودی 0 ریال</div>
                  </div>
                </div>
              </WalletCard.Front>

              <WalletCard.Back>
                <WalletCard.MagStripe />
                <div className='flex items-center justify-end mt-20'>
                  <p className='text-sm leading-6'>
                    کیف پول نقدی به شما امکان می‌دهد مبلغی را از قبل شارژ کرده و تنها به اندازه
                    موجودی خود، سریع و آسان پرداخت‌های روزمره را انجام دهید.
                  </p>
                </div>
              </WalletCard.Back>
            </WalletCard>
          </div>
        </div>
      </PageContent>

      <PageContent title='خلاصه فعالیت'>
        <div className='flex flex-col items-center justify-center gap-y-5'>
          <img src='/images/folderIcon.png' />
          <p className='text-sm font-medium text-center'>
            «اولین قدم رو بردار! همین حالا درخواست وام خودت رو ثبت کن و مسیرت رو شروع کن.»
          </p>

          <Link href='/requests'>
            <Button>دریافت اعتبار</Button>
          </Link>
        </div>
      </PageContent>
    </PageContainer>
  );
}
