'use client';

import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
};

export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn('landing-reveal', inView && 'landing-reveal-visible', className)}
    >
      {children}
    </div>
  );
}
