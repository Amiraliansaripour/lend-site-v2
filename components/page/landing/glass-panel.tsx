import { cn } from '@/lib/utils';

type GlassPanelProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
};

export function GlassPanel({ children, className, as: Comp = 'div' }: GlassPanelProps) {
  return (
    <Comp
      className={cn(
        'rounded-[2rem] border border-navy/10 bg-white shadow-[0_18px_50px_-28px_rgba(11,18,36,0.28)]',
        'dark:border-white/15 dark:bg-white/[0.06] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] dark:backdrop-blur-xl',
        className,
      )}
    >
      {children}
    </Comp>
  );
}
