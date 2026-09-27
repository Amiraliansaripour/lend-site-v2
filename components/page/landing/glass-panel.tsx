import { cn } from '@/lib/utils';

type GlassPanelProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
};

/** Surface panel — YourBank-style: quiet border, soft radius, no heavy glass. */
export function GlassPanel({ children, className, as: Comp = 'div' }: GlassPanelProps) {
  return (
    <Comp
      className={cn(
        'rounded-xl border border-navy/10 bg-white',
        'dark:border-white/10 dark:bg-white/[0.04]',
        className,
      )}
    >
      {children}
    </Comp>
  );
}
