'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import {
  readPlatformEntryParams,
  validatePlatformEntry,
  clearPlatformSession,
} from '@/lib/auth/client/platform-validation';

/**
 * Public entry for users arriving from an external site.
 * Expected URL: /platform/validate?nationalCode=...&phoneNumber=...
 *
 * On HTTP 200 + valid token payload → session is stored (same as OTP login) → /wallets
 * Otherwise → landing (/). Does not touch the normal login flow.
 */
export default function PlatformValidateClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const startedRef = useRef(false);
  const [message, setMessage] = useState('در حال احراز هویت...');

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const params = readPlatformEntryParams(searchParams);
    if (!params) {
      setMessage('اطلاعات ورود ناقص است. در حال انتقال...');
      clearPlatformSession();
      router.replace('/');
      return;
    }

    void (async () => {
      const result = await validatePlatformEntry(params);
      if (result.ok) {
        setMessage('ورود موفق. در حال انتقال...');
        router.replace('/wallets');
        return;
      }

      setMessage('احراز هویت ناموفق بود. در حال انتقال...');
      clearPlatformSession();
      router.replace('/');
    })();
  }, [searchParams, router]);

  return (
    <div className='flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4'>
      <div
        className='h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent'
        aria-hidden
      />
      <p className='text-muted-foreground text-center text-sm'>{message}</p>
    </div>
  );
}
