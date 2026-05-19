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

export type CreditCardNameProps = HTMLAttributes<HTMLParagraphElement>;

export type CreditCardChipProps = HTMLAttributes<SVGSVGElement>;

export type CreditCardLogoProps = HTMLAttributes<HTMLDivElement>;

export type CreditCardFrontProps = HTMLAttributes<HTMLDivElement> & {
  safeArea?: number;
};

export type CreditCardMagStripeProps = HTMLAttributes<HTMLDivElement>;

export type CreditCardBackContextValue = {
  safeArea: number;
};

const CreditCardBackContext = createContext<CreditCardBackContextValue>({
  safeArea: 20,
});

export type CreditCardBackProps = HTMLAttributes<HTMLDivElement> & {
  safeArea?: number;
};

export type CreditCardExpiryProps = HTMLAttributes<HTMLParagraphElement>;

export const CreditCard = ({ className, ...props }: CreditCardProps) => (
  <div
    className={cn(
      'group/kibo-credit-card perspective-distant aspect-8560/5398 w-full max-w-96 text-white',
      '@container',
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
      {/* biome-ignore lint/nursery/noStaticElementInteractions: tap to flip for touch devices */}
      <div
        onClick={handleClick}
        aria-label='Flip credit card'
        className={cn(
          'h-full w-full',
          '@xs:rounded-2xl rounded-lg',
          'transform-3d transition duration-700 ease-in-out',
          supportsHover &&
            'group-hover/kibo-credit-card:-rotate-y-180 group-hover/kibo-credit-card:shadow-lg',
          !supportsHover && isFlipped && '-rotate-y-180 shadow-lg',
          className,
        )}
        {...(props as any)}
      >
        {children}
      </div>
    </CreditCardFlipContext.Provider>
  );
};

export const CreditCardFront = ({
  className,
  safeArea = 20,
  children,
  ...props
}: CreditCardFrontProps) => (
  <div
    className={cn(
      'backface-hidden absolute inset-0 flex overflow-hidden bg-foreground/90',
      '@xs:rounded-2xl rounded-lg',
      className,
    )}
    {...(props as any)}
  >
    <div
      className='relative flex-1'
      style={{
        margin: `${safeArea}px`,
      }}
    >
      {children}
    </div>
  </div>
);

export const CreditCardBack = ({
  safeArea = 16,
  children,
  className,
  ...props
}: CreditCardBackProps) => {
  const isInsideFlipper = useContext(CreditCardFlipContext);

  return (
    <CreditCardBackContext.Provider value={{ safeArea }}>
      <div
        className={cn(
          'backface-hidden absolute inset-0 flex overflow-hidden bg-foreground/90',
          '@xs:rounded-2xl rounded-lg',
          isInsideFlipper && 'rotate-y-180',
          className,
        )}
        {...(props as any)}
      >
        <div
          className='relative flex-1'
          style={{
            margin: `${safeArea}px`,
          }}
        >
          {children}
        </div>
      </div>
    </CreditCardBackContext.Provider>
  );
};

export const CreditCardLogo = ({ className, ...props }: CreditCardLogoProps) => (
  <div className={cn('absolute top-0 right-0 size-1/6', className)} {...(props as any)} />
);

export const CreditCardName = ({ className, style, ...props }: CreditCardNameProps) => (
  <p
    className={cn('font-semibold uppercase', className)}
    style={{
      lineHeight: '100%',
      ...style,
    }}
    {...(props as any)}
  />
);

export const CreditCardExpiry = ({ className, style, ...props }: CreditCardExpiryProps) => (
  <p
    className={cn('font-mono', className)}
    style={{
      lineHeight: '100%',
      ...style,
    }}
    {...(props as any)}
  />
);

export const CreditCardMagStripe = ({ className, ...props }: CreditCardMagStripeProps) => {
  const context = useContext(CreditCardBackContext);

  return (
    <div
      className={cn('-translate-x-1/2 absolute top-[3%] left-1/2 h-1/4 bg-gray-900', className)}
      style={{
        width: `calc(100% + 2 * ${context.safeArea}px)`,
      }}
      {...(props as any)}
    />
  );
};
