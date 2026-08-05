'use client';
import { useState } from 'react';
import Image from 'next/image';
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
import { formatNumber } from '@/utils/format';
import { normalizeToPersianDigits } from '@/utils/normalize';
import { WalletCard } from '@/components/wallet-card';
import { canSubmitNewRequest } from '@/utils/request-status';
import { getWalletUser, createCashWallet, getPaymentToken } from '@/api/wallet';
import { toast } from 'sonner';
import type { Request } from './request-types';
import type { WalletInfo } from '@/api/wallet';

type RequestsCardsProps = {
  walletInfo: WalletInfo | null;
  requests: Request[];
  isLoading: boolean;
  onWalletUpdate: () => void;
};

export function RequestsCards({
  walletInfo,
  requests,
  isLoading,
  onWalletUpdate,
}: RequestsCardsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chargeAmount, setChargeAmount] = useState('');
  const [rawAmount, setRawAmount] = useState('');

  const allowNewRequest = canSubmitNewRequest(requests);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const digitsOnly = inputValue.replace(/[^\d]/g, '');
    setRawAmount(digitsOnly);
    if (digitsOnly) {
      const formatted = digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      setChargeAmount(formatted);
    } else {
      setChargeAmount('');
    }
  };

  const navigateUserToPayment = (token: string, terminalID: string, merchantId: string) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://rt.sizpay.ir/Route/Payment';
    // form.action = `https://panel.aqayepardakht.ir/startpay/${token}`;
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
    document.body.removeChild(form);
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

        // Get the updated wallet data after creating the cash card
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
        {/* Credit Wallet Card */}
        <WalletCard>
          <WalletCard.Front>
            <div className='absolute left-0 top-0 w-full flex items-center justify-end'>
              <Image
                src='/logos/white-logo.png'
                alt='wallet'
                width={86}
                height={86}
                className='w-28'
              />
            </div>

            <div className='mt-20 flex flex-col justify-end gap-y-4 h-[calc(100%-80px)]'>
              <div className='flex flex-col gap-y-1'>
                <span className='font-bold'>کیف پول اعتباری</span>
                <span className='text-sm text-secondary'>
                  موجودی{' '}
                  {normalizeToPersianDigits(
                    formatNumber(walletInfo?.sumCreditCharg ?? 0, { int: true }),
                  )}{' '}
                  ریال
                </span>
              </div>

              <Button
                variant='outline'
                className='w-fit mr-auto text-primary!'
                title='تا زمانی که درخواست در حال بررسی دارید، امکان ثبت درخواست جدید نیست'
              >
                درخواست اعتبار
              </Button>
            </div>
          </WalletCard.Front>
        </WalletCard>

        {/* Cash Wallet Card */}
        <WalletCard>
          <WalletCard.Front>
            <div className='absolute left-0 top-0 w-full flex items-center justify-end'>
              <Image
                src='/logos/white-logo.png'
                alt='wallet'
                width={86}
                height={86}
                className='w-28'
              />
            </div>

            <div className='mt-20 flex flex-col justify-end gap-y-4 h-[calc(100%-80px)]'>
              <div className='flex flex-col gap-y-1'>
                <span className='font-bold'>کیف پول نقدی</span>
                <span className='text-sm text-secondary'>
                  موجودی{' '}
                  {normalizeToPersianDigits(
                    formatNumber(walletInfo?.sumCachCharg ?? 0, { int: true }),
                  )}{' '}
                  ریال
                </span>
              </div>

              <Button
                variant='outline'
                className='w-fit mr-auto cursor-pointer text-primary!'
                onClick={() => setModalOpen(true)}
              >
                شارژ کیف پول
              </Button>
            </div>
          </WalletCard.Front>
        </WalletCard>
      </div>

      {/* Charge Wallet Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-right'>شارژ کیف پول نقدی</DialogTitle>
            <DialogDescription className='text-right'>
              مبلغ مدنظر خود برای شارژ کیف پول را وارد کنید.
            </DialogDescription>
          </DialogHeader>
          <div className='flex gap-2 mt-4'>
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

export function RequestsCardsSkeleton() {
  return (
    <div className='grid w-full grid-cols-1 place-items-center gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3'>
      {[1, 2].map(i => (
        <div
          key={i}
          className='w-full max-w-96 h-64 rounded-xl bg-gray-100 animate-pulse shadow-lg'
        />
      ))}
    </div>
  );
}
