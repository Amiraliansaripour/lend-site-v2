import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Kept for API compat — rendered as muted label, not a pill chip. */
  eyebrow?: string;
  align?: 'center' | 'start';
  className?: string;
};

/** YourBank SectionIntro: accent title + quiet description, no pill eyebrows. */
export function SectionHeading({
  title,
  description,
  eyebrow,
  align = 'start',
  className,
}: SectionHeadingProps) {
  return (
    <header
      className={cn(
        'mb-10 flex max-w-3xl flex-col gap-4',
        align === 'center' && 'mx-auto items-center text-center',
        align === 'start' && 'items-start text-right',
        className,
      )}
    >
      {eyebrow ? (
        <span className='text-xs font-medium tracking-wide text-navy/45 dark:text-white/45'>
          {eyebrow}
        </span>
      ) : null}
      <h2 className='text-3xl font-semibold text-balance text-navy md:text-4xl dark:text-white'>
        {title}
      </h2>
      {description ? (
        <p className='max-w-3xl leading-8 text-navy/55 text-pretty dark:text-white/55'>
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function Accent({ children }: { children: React.ReactNode }) {
  return <span className='text-brand dark:text-gold'>{children}</span>;
}
