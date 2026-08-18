'use client';

// * components
import {
  CreditCard,
  CreditCardFlipper,
  CreditCardFront,
  CreditCardBack,
  CreditCardMagStripe,
  type CreditCardProps,
  type CreditCardFrontProps,
  type CreditCardBackProps,
} from '@/components/ui/credit-card';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// * types
type WalletCardRootProps = CreditCardProps & {
  isFlippable?: boolean;
  children: ReactNode;
};

type WalletCardFrontProps = CreditCardFrontProps & {
  children?: ReactNode;
};

type WalletCardBackProps = CreditCardBackProps & {
  children?: ReactNode;
};

// * components
const WalletCardRoot = ({
  isFlippable = false,
  className,
  children,
  ...props
}: WalletCardRootProps) => {
  return (
    <CreditCard className={cn('w-full max-w-96 mx-auto relative', className)} {...props}>
      {isFlippable ? <CreditCardFlipper>{children}</CreditCardFlipper> : children}
    </CreditCard>
  );
};

const WalletCardFrontComponent = ({ className, children, ...props }: WalletCardFrontProps) => {
  return (
    <CreditCardFront
      className={cn('bg-linear-to-br from-[#3bb9cf] to-[#133c7a]', className)}
      {...props}
    >
      {children}
    </CreditCardFront>
  );
};

const WalletCardBackComponent = ({ className, children, ...props }: WalletCardBackProps) => {
  return (
    <CreditCardBack
      className={cn('bg-linear-to-br from-[#3bb9cf] to-[#133c7a]', className)}
      {...props}
    >
      {children}
    </CreditCardBack>
  );
};

// * compound component
export const WalletCard = Object.assign(WalletCardRoot, {
  Front: WalletCardFrontComponent,
  Back: WalletCardBackComponent,
  MagStripe: CreditCardMagStripe,
});
