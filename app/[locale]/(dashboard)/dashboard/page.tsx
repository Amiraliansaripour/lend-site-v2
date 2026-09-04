'use client';

import { Breadcrumbs, PageContainer } from '@/components/page-container';
import { PageContent } from '@/components/page-content';
import { Button } from '@/components/ui/button';
import { WalletCard } from '@/components/wallet-card';
import Link from 'next/link';
import { getUserId } from '@/lib/auth/client/user-info';
import { useUser, useUserClub, useUserWithStore } from '@/queries/users';
import { useWalletInfo } from '@/queries/wallet';
import { formatNumber } from '@/utils/format';
import { normalizeToPersianDigits } from '@/utils/normalize';
import { LoyaltyPointsCard } from '@/components/loyalty-points-card';

const PercentVector = () => (
  <svg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M19 5L5 19'
      stroke='white'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <circle cx='7.5' cy='7.5' r='2.5' stroke='white' strokeWidth='2' />
    <circle cx='16.5' cy='16.5' r='2.5' stroke='white' strokeWidth='2' />
  </svg>
);

export default function DashboardPage() {
  const breadcrumbs: Breadcrumbs = [{ label: 'داشبورد', href: '/dashboard' }];
  const userId = getUserId();

  useUserWithStore(userId || '');
  const { data: walletInfo } = useWalletInfo();
  const { data: user } = useUser(userId || '');
  const { data: userClub } = useUserClub(user?.personInfo?.nationalCode || '');

  const cardGradientStyle = {
    background: 'linear-gradient(135deg, #4c3ba8 0%, #292267 100%)',
  };

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <PageContent title='کیف پول های من'>
        <div className='grid w-full grid-cols-1 place-items-center gap-4 sm:grid-cols-2 sm:gap-6'>
          <WalletCard isFlippable>
            <WalletCard.Front style={cardGradientStyle} className='p-5 text-white border-0'>
              <div className='w-full flex justify-start items-start z-10' dir='ltr'>
                <PercentVector />
              </div>

              <div className='flex flex-col gap-1 z-10 text-right w-full mt-auto'>
                <span className='font-bold text-lg text-white'>کیف پول اعتباری</span>
                <div className='text-sm text-white/90'>
                  موجودی{' '}
                  {normalizeToPersianDigits(formatNumber(walletInfo?.credit ?? 0, { int: true }))}{' '}
                  ریال
                </div>
              </div>
            </WalletCard.Front>

            <WalletCard.Back style={cardGradientStyle} className='text-white border-0'>
              <WalletCard.MagStripe />
              <div className='flex items-center justify-end h-full pt-14 px-5 z-10 relative'>
                <p className='text-xs leading-6 text-white/90 text-right dir-rtl'>
                  کیف پول اعتباری به شما امکان می‌دهد بدون پرداخت نقدی فوری، با استفاده از اعتبار
                  تخصیص‌داده‌شده خرید و پرداخت انجام دهید و هزینه‌ها را در زمان مقرر یا به‌صورت
                  اقساط تسویه کنید.
                </p>
              </div>
            </WalletCard.Back>
          </WalletCard>

          <WalletCard isFlippable>
            <WalletCard.Front style={cardGradientStyle} className='p-5 text-white border-0'>
              <div className='w-full flex justify-start items-start z-10' dir='ltr'>
                <PercentVector />
              </div>

              <div className='flex flex-col gap-1 z-10 text-right w-full mt-auto'>
                <span className='font-bold text-lg text-white'>کیف پول نقدی</span>
                <div className='text-sm text-white/90'>
                  موجودی{' '}
                  {normalizeToPersianDigits(
                    formatNumber(walletInfo?.cachRemain ?? 0, { int: true }),
                  )}{' '}
                  ریال
                </div>
              </div>
            </WalletCard.Front>

            <WalletCard.Back style={cardGradientStyle} className='text-white border-0'>
              <WalletCard.MagStripe />
              <div className='flex items-center justify-end h-full pt-14 px-5 z-10 relative'>
                <p className='text-xs leading-6 text-white/90 text-right dir-rtl'>
                  کیف پول نقدی به شما امکان می‌دهد مبلغی را از قبل شارژ کرده و تنها به اندازه موجودی
                  خود، سریع و آسان پرداخت‌های روزمره را انجام دهید.
                </p>
              </div>
            </WalletCard.Back>
          </WalletCard>
        </div>
      </PageContent>

      {userClub && userClub.available_points != null && (
        <PageContent title='باشگاه مشتریان'>
          <div className='flex w-full justify-center'>
            <LoyaltyPointsCard
              points={Number(userClub.available_points)}
              className='w-full max-w-md'
            />
          </div>
        </PageContent>
      )}

      <PageContent title='خلاصه فعالیت'>
        <div className='flex flex-col items-center justify-center gap-y-5'>
          <img src='/images/folderIcon.png' alt='Folder Icon' />
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
