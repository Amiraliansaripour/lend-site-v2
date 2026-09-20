'use client';

import { useState, type ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { getUserId, getUserInfo } from '@/lib/auth/client/user-info';
import { accessToken } from '@/lib/auth/client/cookies';
import { CUSTOMER_CLUB_APP_URL, resolveClubSsoTheme, submitClubSsoAssertion } from '@/lib/club-sso';

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
 * Same SSO flow as `/club-sso-test`, but with the logged-in user's real identity.
 * Theme is sent as a form field (light|dark|auto) — not inside the JWT.
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
  const { theme, resolvedTheme } = useTheme();

  const goPublicClub = () => {
    onNavigating?.();
    window.location.assign(CUSTOMER_CLUB_APP_URL);
  };

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const token = accessToken.get();
      const isLoggedIn = Boolean(getUserInfo() || token);

      // Guest → public club (no SSO)
      if (!isLoggedIn || !token) {
        goPublicClub();
        return;
      }

      const userId = getUserId();
      if (!userId) {
        toast.error('اطلاعات کاربر یافت نشد. دوباره وارد شوید.');
        setLoading(false);
        return;
      }

      // Same handoff as club-sso-test: mint assertion → POST assertion + theme
      const clubTheme = resolveClubSsoTheme(theme, resolvedTheme);
      const resp = await fetch('/api/club-sso/assertion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'same-origin',
        body: JSON.stringify({ userId }),
      });

      const payload = (await resp.json().catch(() => null)) as AssertionResponse | null;
      const assertion = payload?.data?.assertion;
      const message = payload?.message;

      if (resp.status === 401) {
        toast.error(message || 'برای ورود یکپارچه ابتدا وارد شوید.');
        setLoading(false);
        return;
      }

      if (!resp.ok || !payload?.isSuccess || !assertion) {
        toast.error(message || 'ورود یکپارچه به باشگاه ناموفق بود.');
        setLoading(false);
        return;
      }

      onNavigating?.();
      submitClubSsoAssertion(assertion, clubTheme);
    } catch {
      toast.error('خطا در ارتباط با سرویس باشگاه مشتریان.');
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
