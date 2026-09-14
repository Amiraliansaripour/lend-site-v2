'use client';

import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { CustomerClubButton } from '@/components/customer-club-button';
import { CUSTOMER_CLUB_APP_URL } from '@/lib/club-sso';

/** @deprecated Prefer CUSTOMER_CLUB_APP_URL from `@/lib/club-sso` */
export const CUSTOMER_CLUB_URL = CUSTOMER_CLUB_APP_URL;

type CustomerClubBackButtonProps = {
  className?: string;
  /** Compact label for tight slots (e.g. mobile top bar) */
  compact?: boolean;
  variant?: 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
};

/**
 * «بازگشت به باشگاه» — same SSO flow as the main club button when logged in.
 */
export function CustomerClubBackButton({
  className,
  compact = false,
  variant = 'outline',
  size = 'default',
}: CustomerClubBackButtonProps) {
  return (
    <CustomerClubButton
      compact={compact}
      label='بازگشت به باشگاه مشتریان'
      compactLabel='بازگشت به باشگاه'
      icon={<ArrowRight className='size-4 shrink-0' aria-hidden />}
      className={cn(
        'rounded-md',
        variant === 'outline' &&
          'border-input bg-background hover:bg-accent hover:text-accent-foreground',
        variant === 'ghost' && 'border-0 hover:bg-accent',
        variant === 'link' && 'border-0 underline-offset-4 hover:underline',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'lg' && 'h-10 px-6',
        className,
      )}
    />
  );
}
