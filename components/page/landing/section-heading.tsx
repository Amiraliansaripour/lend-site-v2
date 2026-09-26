import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  align?: 'center' | 'start';
  className?: string;
};

export function SectionHeading({
  title,
  description,
  eyebrow,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <hgroup
      className={cn(
        'mb-10 flex max-w-2xl flex-col gap-3',
        align === 'center' && 'mx-auto items-center text-center',
        align === 'start' && 'items-start text-right',
        className,
      )}
    >
      {eyebrow ? (
        <span className='inline-flex rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-medium text-navy dark:border-gold/30 dark:bg-gold/10 dark:text-gold'>
          {eyebrow}
        </span>
      ) : null}
      <h2 className='text-2xl font-bold text-navy md:text-3xl dark:text-white'>{title}</h2>
      {description ? (
        <p className='leading-8 text-navy/60 text-pretty dark:text-white/65'>{description}</p>
      ) : null}
    </hgroup>
  );
}
