'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WalletCard } from '@/components/wallet-card';
import { useSiteTemplate } from '@/providers/site-template';
import { formatNumber } from '@/utils/format';
import { normalizeToPersianDigits } from '@/utils/normalize';
import { createCashWallet, getPaymentToken, getWalletUser, type WalletInfo } from '@/api/wallet';

type WalletBalanceCardsProps = {
  walletInfo: WalletInfo | null;
  isLoading?: boolean;
  onWalletUpdate: () => void;
};

export function WalletBalanceCards({ walletInfo, onWalletUpdate }: WalletBalanceCardsProps) {
  const { brandName, getImageUrl } = useSiteTemplate();
  const lightLogoUrl = getImageUrl('lightLogo') || getImageUrl('logo');

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chargeAmount, setChargeAmount] = useState('');
  const [rawAmount, setRawAmount] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^\d]/g, '');
    setRawAmount(digitsOnly);
    setChargeAmount(digitsOnly ? digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '');
  };

  const navigateUserToPayment = (token: string, terminalID: string, merchantId: string) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://rt.sizpay.ir/Route/Payment';
    form.target = '_self';

    const fields = [
      { name: 'MerchantID', value: merchantId },
      { name: 'TerminalID', value: terminalID },
      { name: 'Token', value: token },
    ];

    fields.forEach(({ name, value }) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    form.remove();
  };

  const handleGeneralPayment = async (creditCachAccountId: string) => {
    try {
      const paymentData = await getPaymentToken({
        creditCachAccountId,
        amount: Number(rawAmount),
        payType: 3,
      });

      if (paymentData) {
        const { token, terminalID, merchantId } = paymentData;
        navigateUserToPayment(token, terminalID, merchantId);
      } else {
        toast.error('پاسخ معتبر از سرور پرداخت دریافت نشد.');
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error('خطا در شروع فرآیند پرداخت.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCashCard = async () => {
    if (Number(rawAmount) < 100000) {
      toast.error('مبلغ شارژ بایستی بزرگتر یا مساوی 100,000 ریال باشد.');
      return;
    }

    setLoading(true);

    try {
      const walletUsers = await getWalletUser();
      const cashCard = walletUsers.find(item => item.cachId !== null);
      const hasCashCard = cashCard !== undefined;

      if (!hasCashCard) {
        await createCashWallet();
        toast.success('کیف پول با موفقیت اضافه شد.');
        onWalletUpdate();

        const updatedWalletUsers = await getWalletUser();
        const updatedCashCard = updatedWalletUsers.find(item => item.cachId !== null);

        if (updatedCashCard?.cachId) {
          await handleGeneralPayment(updatedCashCard.cachId);
        }
      } else if (cashCard?.cachId) {
        await handleGeneralPayment(cashCard.cachId);
      }

      setModalOpen(false);
      setChargeAmount('');
      setRawAmount('');
    } catch (error) {
      console.error('Error in cash card operation:', error);
      toast.error('خطا در ایجاد کیف پول نقدی');
      setLoading(false);
    }
  };

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

            <div className='mt-20 flex h-[calc(100%-80px)] flex-col justify-end gap-y-4'>
              <div className='flex flex-col gap-y-1'>
                <span className='font-bold'>کیف پول اعتباری</span>
                <span className='text-sm text-secondary'>
                  موجودی{' '}
                  {normalizeToPersianDigits(formatNumber(walletInfo?.credit ?? 0, { int: true }))}{' '}
                  ریال
                </span>
              </div>
              <Link href='/requests/request-credit'>
                <Button variant='outline' className='mr-auto w-fit text-primary!'>
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

            <div className='mt-20 flex h-[calc(100%-80px)] flex-col justify-end gap-y-4'>
              <div className='flex flex-col gap-y-1'>
                <span className='font-bold'>کیف پول نقدی</span>
                <span className='text-sm text-secondary'>
                  موجودی{' '}
                  {normalizeToPersianDigits(
                    formatNumber(walletInfo?.cachRemain ?? 0, { int: true }),
                  )}{' '}
                  ریال
                </span>
              </div>

              <Button
                variant='outline'
                className='mr-auto w-fit cursor-pointer text-primary!'
                onClick={() => setModalOpen(true)}
              >
                شارژ کیف پول
              </Button>
            </div>
          </WalletCard.Front>
        </WalletCard>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-right'>شارژ کیف پول نقدی</DialogTitle>
            <DialogDescription className='text-right'>
              مبلغ مدنظر خود برای شارژ کیف پول را وارد کنید.
            </DialogDescription>
          </DialogHeader>
          <div className='mt-4 flex gap-2'>
            <Input
              value={chargeAmount}
              onChange={handleAmountChange}
              placeholder='مبلغ (ریال) را وارد کنید'
              inputMode='numeric'
              className='flex-1'
            />
            <Button onClick={handleCreateCashCard} disabled={loading} className='shrink-0'>
              {loading ? (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
              ) : (
                'تایید'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
