'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import { appStore, type Theme } from '@/stores';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type ThemeToggleProps = {
  className?: string;
  /** Compact icon-only control for tight header slots */
  compact?: boolean;
};

/**
 * Single-click theme toggle: switches between light and dark.
 */
export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const setStoreTheme = appStore.useSetTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';
  const nextTheme: Theme = isDark ? 'light' : 'dark';
  const Icon = isDark ? Sun : Moon;
  const label = isDark ? 'تم روشن' : 'تم تاریک';

  const toggleTheme = () => {
    setTheme(nextTheme);
    setStoreTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <span
        aria-hidden
        className={cn(
          'inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/60',
          compact && 'size-7',
          className,
        )}
      />
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          aria-label={label}
          onClick={toggleTheme}
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-full border border-border/80',
            'bg-background/80 text-foreground/80 shadow-xs backdrop-blur-sm',
            'transition-colors hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
            compact ? 'size-7' : 'size-8 gap-1.5 px-3',
            className,
          )}
        >
          <Icon className={cn(compact ? 'size-3.5' : 'size-4')} />
          {!compact ? <span className='text-xs font-medium'>{label}</span> : null}
        </button>
      </TooltipTrigger>
      <TooltipContent side='bottom'>{label}</TooltipContent>
    </Tooltip>
  );
}

/** @deprecated Prefer ThemeToggle */
export { ThemeToggle as ThemeSelect };
