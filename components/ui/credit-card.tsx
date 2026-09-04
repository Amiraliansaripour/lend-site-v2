'use client';

import { cn } from '@/lib/utils';
import {
  type HTMLAttributes,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const useSupportsHover = () => {
  const [supportsHover, setSupportsHover] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(hover: hover)');
    const handler = (e: MediaQueryListEvent) => setSupportsHover(e.matches);

    setSupportsHover(mql.matches);
    mql.addEventListener('change', handler);

    return () => mql.removeEventListener('change', handler);
  }, []);

  return supportsHover;
};

export type CreditCardProps = HTMLAttributes<HTMLDivElement>;
const CreditCardFlipContext = createContext(false);

export type CreditCardFlipperProps = HTMLAttributes<HTMLDivElement>;
export type CreditCardFrontProps = HTMLAttributes<HTMLDivElement> & { safeArea?: number };
export type CreditCardBackProps = HTMLAttributes<HTMLDivElement> & { safeArea?: number };
export type CreditCardMagStripeProps = HTMLAttributes<HTMLDivElement>;

export const CreditCard = ({ className, ...props }: CreditCardProps) => (
  <div
    className={cn(
      'perspective-distant aspect-8560/5398 w-full max-w-96 text-white relative',
      'group/kibo-credit-card',
      className,
    )}
    {...(props as any)}
  />
);

export const CreditCardFlipper = ({
  className,
  children,
  ...props
}: CreditCardFlipperProps & { children?: ReactNode }) => {
  const supportsHover = useSupportsHover();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (!supportsHover) {
      setIsFlipped(prev => !prev);
    }
  };

  return (
    <CreditCardFlipContext.Provider value={true}>
      <div
        onClick={handleClick}
        className={cn(
          'h-full w-full relative rounded-2xl transition-transform duration-700 ease-in-out',
          'transform-3d',
          supportsHover && 'group-hover/kibo-credit-card:[transform:rotateY(180deg)]',
          !supportsHover && isFlipped && '[transform:rotateY(180deg)]',
          className,
        )}
        style={{ transformStyle: 'preserve-3d' }}
        {...(props as any)}
      >
        {children}
      </div>
    </CreditCardFlipContext.Provider>
  );
};

export const CreditCardFront = ({ className, children, style, ...props }: CreditCardFrontProps) => (
  <div
    className={cn(
      'absolute top-0 left-0 w-full h-full flex flex-col justify-between overflow-hidden rounded-2xl',
      className,
    )}
    style={{
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      ...style,
    }}
    {...(props as any)}
  >
    {children}
  </div>
);

export const CreditCardBack = ({ children, className, style, ...props }: CreditCardBackProps) => {
  const isInsideFlipper = useContext(CreditCardFlipContext);

  return (
    <div
      className={cn(
        'absolute top-0 left-0 w-full h-full flex flex-col overflow-hidden rounded-2xl',
        isInsideFlipper && '[transform:rotateY(180deg)]',
        className,
      )}
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        ...style,
      }}
      {...(props as any)}
    >
      {children}
    </div>
  );
};

export const CreditCardMagStripe = ({ className, ...props }: CreditCardMagStripeProps) => {
  return (
    <div
      className={cn('absolute top-[12%] left-0 w-full h-[22%] bg-[#121927] z-10', className)}
      {...(props as any)}
    />
  );
};
