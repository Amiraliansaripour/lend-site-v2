'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { getUserId, getUserInfo } from '@/lib/auth/client/user-info';
import { getUser } from '@/api/users';
import { extractLendtechLoginUrl, lendtechLogin } from '@/api/platform';

type MokhaberatButtonProps = {
  className?: string;
  /** Compact label for tight mobile slots */
  compact?: boolean;
  onNavigating?: () => void;
};

const GUEST_LOGIN_URL = 'https://my.tci.ir/login';

const toIranMobile = (phone: string) => {
  let value = phone.trim().replace(/[\s-]/g, '');
  if (value.startsWith('+98')) value = `0${value.slice(3)}`;
  else if (value.startsWith('98') && value.length >= 12) value = `0${value.slice(2)}`;
  return value;
};

const readCachedPhone = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    for (const key of ['userInfo', 'USER_INFO'] as const) {
      const profileRaw = localStorage.getItem(key);
      if (!profileRaw) continue;
      const profile = JSON.parse(profileRaw) as {
        phoneNumber?: string;
        personInfo?: { phoneNumber?: string };
      };
      const phone = profile.personInfo?.phoneNumber || profile.phoneNumber;
      if (phone?.trim()) return toIranMobile(phone);
    }
  } catch {
    // ignore corrupt cache
  }

  return null;
};

async function resolvePhoneNumber(): Promise<string | undefined> {
  // Not logged in → no phone for lendtech flow
  if (!getUserInfo()) return undefined;

  const cached = readCachedPhone();
  if (cached && /^09\d{9}$/.test(cached)) return cached;

  const userId = getUserId();
  if (!userId) return undefined;

  try {
    const user = await getUser(userId);
    const phone = user?.personInfo?.phoneNumber || user?.phoneNumber;
    if (!phone) return undefined;
    const normalized = toIranMobile(phone);
    return /^09\d{9}$/.test(normalized) ? normalized : undefined;
  } catch {
    return undefined;
  }
}

const isUnregisteredPhoneMessage = (message?: string) => {
  if (!message) return false;
  return message.includes('درسامانه ثبت نشده') || message.includes('در سامانه ثبت نشده');
};

export function MokhaberatButton({ className, compact, onNavigating }: MokhaberatButtonProps) {
  const [loading, setLoading] = useState(false);

  const goGuestLogin = () => {
    onNavigating?.();
    window.location.assign(GUEST_LOGIN_URL);
  };

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const phoneNumber = await resolvePhoneNumber();

      // Not logged in / no phone → public TCI login
      if (!phoneNumber) {
        goGuestLogin();
        return;
      }

      // Logged in + phone → our backend Platform/lendtech-login
      const { data, resp } = await lendtechLogin(phoneNumber);
      const loginUrl = extractLendtechLoginUrl(data);
      const message = data?.message || data?.data?.message;

      // Phone not registered on TCI → show message, then same guest login as logged-out users
      if (resp.status === 400 && isUnregisteredPhoneMessage(message)) {
        toast.error(message || 'شماره موبایل وارد شده درسامانه ثبت نشده است');
        window.setTimeout(() => {
          goGuestLogin();
        }, 1000);
        return;
      }

      if (!resp.ok || !data?.isSuccess || !loginUrl) {
        toast.error(message || 'ورود به مخابرات ناموفق بود.');
        setLoading(false);
        return;
      }

      onNavigating?.();
      window.location.assign(loginUrl);
    } catch {
      toast.error('خطا در ارتباط با سرویس مخابرات.');
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
