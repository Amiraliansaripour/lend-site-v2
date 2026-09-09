'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { getUserId, getUserInfo } from '@/lib/auth/client/user-info';
import { getUser } from '@/api/users';

type MokhaberatButtonProps = {
  className?: string;
  /** Compact label for tight mobile slots */
  compact?: boolean;
  onNavigating?: () => void;
};

const readCachedPhone = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const profileRaw = localStorage.getItem('userInfo');
    if (profileRaw) {
      const profile = JSON.parse(profileRaw) as {
        phoneNumber?: string;
        personInfo?: { phoneNumber?: string };
      };
      const phone = profile.personInfo?.phoneNumber || profile.phoneNumber;
      if (phone?.trim()) return phone.trim();
    }
  } catch {
    // ignore corrupt cache
  }

  return null;
};

async function resolvePhoneNumber(): Promise<string | undefined> {
  if (!getUserInfo()) return undefined;

  const cached = readCachedPhone();
  if (cached) return cached;

  const userId = getUserId();
  if (!userId) return undefined;

  try {
    const user = await getUser(userId);
    return user?.personInfo?.phoneNumber || user?.phoneNumber || undefined;
  } catch {
    return undefined;
  }
}

const GUEST_LOGIN_URL = 'https://my.tci.ir/login';

const isUnregisteredPhoneMessage = (message?: string) => {
  if (!message) return false;
  return message.includes('درسامانه ثبت نشده') || message.includes('در سامانه ثبت نشده');
};

export function MokhaberatButton({ className, compact, onNavigating }: MokhaberatButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const phoneNumber = await resolvePhoneNumber();

      // Guest / no phone → public TCI login page (no lendtech API call)
      if (!phoneNumber) {
        onNavigating?.();
        window.location.assign(GUEST_LOGIN_URL);
        return;
      }

      const resp = await fetch('/api/tci/mokhaberat-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = (await resp.json()) as { loginUrl?: string; message?: string };

      if (!resp.ok || !data.loginUrl) {
        // Logged-in phone not registered on TCI → fall back to public login
        if (isUnregisteredPhoneMessage(data.message)) {
          onNavigating?.();
          window.location.assign(GUEST_LOGIN_URL);
          return;
        }

        toast.error(data.message || 'ورود به مخابرات ناموفق بود.');
        return;
      }

      onNavigating?.();
      window.location.assign(data.loginUrl);
    } catch {
      toast.error('خطا در ارتباط با سرویس مخابرات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type='button'
      onClick={() => void handleClick()}
      disabled={loading}
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-brand px-4 py-1.5 text-brand text-xs font-semibold transition-colors hover:bg-brand/5 disabled:opacity-60',
        className,
      )}
    >
      {loading ? 'در حال انتقال...' : compact ? 'مخابرات' : 'مخابرات من'}
    </button>
  );
}
