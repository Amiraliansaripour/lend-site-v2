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

const TCI_LOGIN_URL = 'https://my2-test.tci.ir/api/v1/auth/lendtech/login';
const GUEST_LOGIN_URL = 'https://my.tci.ir/login';

type TciLoginResponse = {
  data?: {
    login_url?: string;
  };
  message?: string;
};

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

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const phoneNumber = await resolvePhoneNumber();

      // Guest / no phone → public TCI login page
      if (!phoneNumber) {
        onNavigating?.();
        window.location.assign(GUEST_LOGIN_URL);
        return;
      }

      const secret = process.env.NEXT_PUBLIC_TCI_LENDTECH_SECRET?.trim();
      if (!secret) {
        toast.error('پیکربندی سرویس مخابرات ناقص است');
        return;
      }

      // Direct browser → TCI (same as curl)
      const resp = await fetch(TCI_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Lendtech-Secret': secret,
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      const data = (await resp.json().catch(() => null)) as TciLoginResponse | null;
      const loginUrl = data?.data?.login_url;

      if (!resp.ok || !loginUrl) {
        if (isUnregisteredPhoneMessage(data?.message)) {
          onNavigating?.();
          window.location.assign(GUEST_LOGIN_URL);
          return;
        }

        toast.error(data?.message || 'ورود به مخابرات ناموفق بود.');
        return;
      }

      onNavigating?.();
      window.location.assign(loginUrl);
    } catch {
      toast.error('خطا در ارتباط با سرویس مخابرات. (احتمالاً CORS)');
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
