'use client';

import { CreditCard, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';

import { formatCardNumber, getCardBankInfo, maskCardNumber, maskCvv2 } from './cards-utils';

type BankCardPreviewProps = {
  cardNumber: string;
  cvv2: string;
  expiryDate: string;
  bankName: string;
  masked?: boolean;
  className?: string;
};

export function BankCardPreview({
  cardNumber,
  cvv2,
  expiryDate,
  bankName,
  masked = false,
  className,
}: BankCardPreviewProps) {
  const bankInfo = getCardBankInfo(cardNumber);

  const displayBankName = bankName || bankInfo?.name || 'بانک';

  const displayCardNumber = cardNumber
    ? masked
      ? maskCardNumber(cardNumber)
      : formatCardNumber(cardNumber)
    : '•••• •••• •••• ••••';

  return (
    <div
      dir='ltr'
      className={cn(
        'relative min-h-[220px] w-full overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-950 via-slate-800 to-slate-700 p-6 text-white shadow-2xl',
        className,
      )}
    >
      <div className='absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10' />
      <div className='absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-white/5' />
      <div className='absolute right-20 bottom-10 h-24 w-24 rounded-full bg-white/[0.03]' />

      <div className='relative z-10 flex h-full min-h-[168px] flex-col justify-between'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='flex size-12 items-center justify-center overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm'>
              {bankInfo?.logo ? (
                <img src={bankInfo.logo} alt={displayBankName} className='size-9 object-contain' />
              ) : (
                <CreditCard className='size-6 text-white/80' />
              )}
            </div>

            <div>
              <p className='text-[11px] text-white/50'>BANK CARD</p>

              <p className='mt-0.5 text-sm font-bold'>{displayBankName}</p>
            </div>
          </div>

          <div className='flex items-center gap-1.5 text-white/50'>
            <ShieldCheck className='size-4' />
            <span className='text-[10px]'>SECURE</span>
          </div>
        </div>

        <div className='mt-7'>
          <p
            dir='ltr'
            className='[unicode-bidi:isolate] text-left font-mono text-[19px] tracking-[2px] text-white sm:text-[21px]'
          >
            {displayCardNumber}
          </p>
        </div>

        <div className='mt-6 flex items-end justify-between'>
          <div>
            <p className='text-[9px] uppercase tracking-wider text-white/40'>Expiry</p>

            <p dir='ltr' className='mt-1 [unicode-bidi:isolate] text-left font-mono text-sm'>
              {expiryDate || '••/••••'}
            </p>
          </div>

          <div className='text-left'>
            <p className='text-[9px] uppercase tracking-wider text-white/40'>CVV2</p>

            <p className='mt-1 font-mono text-sm tracking-widest'>
              {masked ? '••••' : maskCvv2(cvv2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
