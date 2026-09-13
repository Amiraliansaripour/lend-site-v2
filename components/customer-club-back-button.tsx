'use client';

import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const CUSTOMER_CLUB_URL = 'https://tcclub.ir/app';

type CustomerClubBackButtonProps = {
  className?: string;
  /** Compact label for tight slots (e.g. mobile top bar) */
  compact?: boolean;
  variant?: 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
};

export function CustomerClubBackButton({
  className,
  compact = false,
  variant = 'outline',
  size = 'default',
}: CustomerClubBackButtonProps) {
  return (
    <Button asChild variant={variant} size={size} className={cn(className)}>
      <a href={CUSTOMER_CLUB_URL} rel='noopener noreferrer'>
        <ArrowRight className='size-4 me-1 shrink-0' aria-hidden />
        {compact ? 'بازگشت به باشگاه' : 'بازگشت به باشگاه مشتریان'}
      </a>
    </Button>
  );
}
