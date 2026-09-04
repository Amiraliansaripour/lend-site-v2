import Image from 'next/image';

import { cn } from '@/lib/utils';
import boomLogoMark from '@/assets/images/boomlogo.svg';

type BoomLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  variant?: 'color' | 'white';
};

/** Static Boom brand mark — never loaded via GetImage / site-template. */
export function BoomLogo({
  className,
  markClassName,
  wordmarkClassName,
  showWordmark = true,
  variant = 'color',
}: BoomLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image
        src={boomLogoMark}
        alt=''
        width={64}
        height={64}
        unoptimized
        aria-hidden
        className={cn(
          'size-8 shrink-0 object-contain',
          variant === 'white' && 'brightness-0 invert',
          markClassName,
        )}
      />
      {showWordmark ? (
        <span
          className={cn(
            'text-lg font-black tracking-tight leading-none',
            variant === 'white' ? 'text-white' : 'text-brand',
            wordmarkClassName,
          )}
        >
          BOOM UP
        </span>
      ) : null}
    </span>
  );
}
