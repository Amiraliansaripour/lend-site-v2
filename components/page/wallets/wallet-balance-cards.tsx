'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { WalletCard } from '@/components/wallet-card';
import { CashChargeDialog } from './cash-charge-dialog';
import { useSiteTemplate } from '@/providers/site-template';
import { formatNumber } from '@/utils/format';
import { normalizeToPersianDigits } from '@/utils/normalize';
import type { WalletInfo } from '@/api/wallet';

type WalletBalanceCardsProps = {
  walletInfo: WalletInfo | null;
  isLoading?: boolean;
  onWalletUpdate: () => void;
};

export function WalletBalanceCards({ walletInfo, onWalletUpdate }: WalletBalanceCardsProps) {
  const { brandName, getImageUrl } = useSiteTemplate();
  const lightLogoUrl = getImageUrl('lightLogo') || getImageUrl('logo');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className='grid w-full grid-cols-1 place-items-center gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3'>
        <WalletCard>
          <WalletCard.Front>
            <div className='absolute left-0 top-0 w-full flex items-center justify-end'>
              {lightLogoUrl ? (
                <Image
                  src={lightLogoUrl}
                  alt={brandName}
                  width={86}
                  height={86}
                  className='w-28'
                  unoptimized
                />
              ) : null}
            </div>

            <div className='mt-20 flex h-[calc(100%-80px)] flex-col justify-end gap-y-4 text-white'>
              <div className='flex flex-col gap-y-1'>
                <span className='font-bold text-white'>کیف پول اعتباری</span>
                <span className='text-sm text-white/85'>
                  موجودی{' '}
                  {normalizeToPersianDigits(formatNumber(walletInfo?.credit ?? 0, { int: true }))}{' '}
                  ریال
                </span>
              </div>
              <Link href='/requests/request-credit'>
                <Button
                  variant='outline'
                  className='mr-auto w-fit border-white/80 bg-white/10 text-white hover:bg-white hover:text-[#133c7a]'
                >
                  درخواست اعتبار
                </Button>
              </Link>
            </div>
          </WalletCard.Front>
        </WalletCard>

        <WalletCard>
          <WalletCard.Front>
            <div className='absolute left-0 top-0 w-full flex items-center justify-end'>
              {lightLogoUrl ? (
                <Image
                  src={lightLogoUrl}
                  alt={brandName}
                  width={86}
                  height={86}
                  className='w-28'
                  unoptimized
                />
              ) : null}
            </div>

            <div className='mt-20 flex h-[calc(100%-80px)] flex-col justify-end gap-y-4 text-white'>
              <div className='flex flex-col gap-y-1'>
                <span className='font-bold text-white'>کیف پول نقدی</span>
                <span className='text-sm text-white/85'>
                  موجودی{' '}
                  {normalizeToPersianDigits(
                    formatNumber(walletInfo?.cachRemain ?? 0, { int: true }),
                  )}{' '}
                  ریال
                </span>
              </div>

              <Button
                variant='outline'
                className='mr-auto w-fit cursor-pointer border-white/80 bg-white/10 text-white hover:bg-white hover:text-[#133c7a]'
                onClick={() => setModalOpen(true)}
              >
                شارژ کیف پول
              </Button>
            </div>
          </WalletCard.Front>
        </WalletCard>
      </div>

      <CashChargeDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        onWalletUpdate={onWalletUpdate}
      />
    </>
  );
}

export function WalletBalanceCardsSkeleton() {
  return (
    <div className='grid w-full grid-cols-1 place-items-center gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3'>
      {[1, 2].map(i => (
        <div
          key={i}
          className='h-64 w-full max-w-96 animate-pulse rounded-xl bg-gray-100 shadow-lg'
        />
      ))}
    </div>
  );
}
