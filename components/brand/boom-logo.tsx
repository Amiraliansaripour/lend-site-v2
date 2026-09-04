import { cn } from '@/lib/utils';

type BoomLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  variant?: 'color' | 'white';
};

/** Static Boom brand mark (Figma) — never loaded via GetImage / site-template. */
export function BoomLogo({
  className,
  markClassName,
  wordmarkClassName,
  showWordmark = true,
  variant = 'color',
}: BoomLogoProps) {
  const fill = variant === 'white' ? '#FFFFFF' : '#0055FF';

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        viewBox='0 0 64 64'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden
        className={cn('size-8 shrink-0', markClassName)}
      >
        {/* Percent mark matching Boom Figma logo */}
        <circle cx='18' cy='16' r='9' fill={fill} />
        <circle cx='46' cy='48' r='9' fill={fill} />
        <path d='M44 8L20 56' stroke={fill} strokeWidth='10' strokeLinecap='round' />
      </svg>
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
