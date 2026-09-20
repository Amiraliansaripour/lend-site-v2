'use client';

import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { getClubSsoThemeFromBrowser, submitClubSsoAssertion } from '@/lib/club-sso';

type CustomerClubButtonProps = {
  className?: string;
  /** Compact label for tight mobile slots */
  compact?: boolean;
  onNavigating?: () => void;
  /** Optional leading icon */
  icon?: ReactNode;
  /** Override visible label */
  label?: string;
  compactLabel?: string;
};

type AssertionResponse = {
  isSuccess?: boolean;
  message?: string;
  data?: { assertion?: string };
};

/**
 * Same SSO flow as `/club-sso-test`: mint test assertion → POST assertion + theme.
 */
export function CustomerClubButton({
  className,
  compact,
  onNavigating,
  icon,
  label = 'باشگاه مشتریان',
  compactLabel = 'باشگاه',
}: CustomerClubButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const theme = getClubSsoThemeFromBrowser();
      const resp = await fetch('/api/club-sso/test-assertion', { method: 'POST' });
      const payload = (await resp.json()) as AssertionResponse;

      if (!resp.ok || !payload.isSuccess || !payload.data?.assertion) {
        toast.error(payload.message || 'ورود به باشگاه ناموفق بود.');
        setLoading(false);
        return;
      }

      onNavigating?.();
      submitClubSsoAssertion(payload.data.assertion, theme);
    } catch {
      toast.error('خطا در ارتباط با سرویس باشگاه.');
      setLoading(false);
    }
  };

  return (
    <button
      type='button'
      onClick={() => void handleClick()}
      disabled={loading}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-full border border-brand px-4 py-1.5 text-brand text-xs font-semibold transition-colors hover:bg-brand/5 disabled:opacity-60',
        className,
      )}
      aria-label={label}
    >
      {loading ? (
        'در حال انتقال...'
      ) : (
        <>
          {icon}
          <span>{compact ? compactLabel : label}</span>
        </>
      )}
    </button>
  );
}
