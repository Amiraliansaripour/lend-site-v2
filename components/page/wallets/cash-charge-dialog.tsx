'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createCashWallet, getPaymentToken, getWalletUser } from '@/api/wallet';

type CashChargeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWalletUpdate: () => void;
};

export function CashChargeDialog({ open, onOpenChange, onWalletUpdate }: CashChargeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [chargeAmount, setChargeAmount] = useState('');
  const [rawAmount, setRawAmount] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^\d]/g, '');
    setRawAmount(digitsOnly);
    setChargeAmount(digitsOnly ? digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '');
  };

  const resetForm = () => {
    setChargeAmount('');
    setRawAmount('');
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

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error in cash card operation:', error);
      toast.error('خطا در ایجاد کیف پول نقدی');
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        onOpenChange(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
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
  );
}
