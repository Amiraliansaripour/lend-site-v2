'use client';

import { CreditCard } from 'lucide-react';

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
        'relative min-h-[220px] w-full overflow-hidden rounded-[22px] p-6 text-white shadow-2xl',
        className,
      )}
      style={{
        background: 'linear-gradient(150deg, #10131b 0%, #171c28 45%, #232a3a 100%)',
      }}
    >
      {/* fine brushed-metal grain */}
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay'
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)',
        }}
      />

      {/* single diagonal light sheen, the one intentional highlight */}
      <div
        className='pointer-events-none absolute -inset-x-10 -top-16 h-40 rotate-[-8deg] opacity-[0.08]'
        style={{ background: 'linear-gradient(90deg, transparent, #fff, transparent)' }}
      />

      <div className='relative z-10 flex h-full min-h-[168px] flex-col justify-between'>
        <div className='flex items-start justify-between gap-4'>
          {/* embossed chip */}
          <div
            className='flex h-8 w-11 items-center justify-center rounded-[6px] shadow-inner'
            style={{
              background: 'linear-gradient(155deg, #f4dfa3 0%, #d3a94f 45%, #9c7527 100%)',
            }}
          >
            <div className='h-4 w-7 rounded-[2px] border border-black/20' />
          </div>

          <div className='flex items-center gap-2 text-right'>
            <div>
              <p className='text-sm font-semibold leading-tight'>{displayBankName}</p>
              <p className='text-[10px] text-white/40'>کارت بانکی</p>
            </div>

            {bankInfo?.logo ? (
              <img
                src={bankInfo.logo}
                alt={displayBankName}
                className='size-7 rounded-md object-contain'
              />
            ) : (
              <CreditCard className='size-5 text-white/50' />
            )}
          </div>
        </div>

        <div className='mt-6'>
          <p
            dir='ltr'
            className='[unicode-bidi:isolate] text-left font-mono text-[20px] tracking-[3px] text-white/95 sm:text-[22px]'
            style={{ textShadow: '0 1px 0 rgba(255,255,255,0.12), 0 -1px 0 rgba(0,0,0,0.5)' }}
          >
            {displayCardNumber}
          </p>
        </div>

        <div className='mt-6 flex items-end justify-between'>
          <div>
            <p className='text-[9px] tracking-wider text-white/35'>VALID THRU</p>

            <p
              dir='ltr'
              className='mt-1 [unicode-bidi:isolate] text-left font-mono text-sm text-white/90'
            >
              {expiryDate || '••/••••'}
            </p>
          </div>

          <div className='text-left'>
            <p className='text-[9px] tracking-wider text-white/35'>CVV2</p>

            <p className='mt-1 font-mono text-sm tracking-widest text-white/90'>
              {masked ? '••••' : maskCvv2(cvv2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
