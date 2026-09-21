'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import {
  readPlatformEntryParams,
  validatePlatformEntry,
  clearPlatformSession,
} from '@/lib/auth/client/platform-validation';

const LANDING_REDIRECT_DELAY_MS = 2500;

/**
 * Public entry for users arriving from an external site.
 * Expected URL: /platform/validate?nationalCode=...&phoneNumber=...&theme=light|dark
 * (`theme` is applied globally via InboundThemeSync; other params are unchanged.)
 *
 * On HTTP 200 + valid token payload → session is stored (same as OTP login) → /wallets
 * Otherwise → show API message (e.g. 400 mismatch) then landing (/).
 */
export default function PlatformValidateClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const startedRef = useRef(false);
  const [message, setMessage] = useState('در حال احراز هویت...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const goLanding = (errorMessage: string) => {
      setIsError(true);
      setMessage(errorMessage);
      toast.error(errorMessage);
      clearPlatformSession();
      window.setTimeout(() => {
        router.replace('/');
      }, LANDING_REDIRECT_DELAY_MS);
    };

    const params = readPlatformEntryParams(searchParams);
    if (!params) {
      goLanding('اطلاعات ورود ناقص است. کد ملی و شماره موبایل الزامی است.');
      return;
    }

    void (async () => {
      const result = await validatePlatformEntry(params);
      if (result.ok) {
        setMessage('ورود موفق. در حال انتقال...');
        router.replace('/wallets');
        return;
      }

      goLanding(result.message);
    })();
  }, [searchParams, router]);

  return (
    <div className='flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4'>
      {!isError && (
        <div
          className='h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent'
          aria-hidden
        />
      )}
      <p
        className={`max-w-md text-center text-sm ${
          isError ? 'text-destructive font-medium' : 'text-muted-foreground'
        }`}
      >
        {message}
      </p>
      {isError && (
        <p className='text-muted-foreground text-center text-xs'>در حال انتقال به صفحه اصلی...</p>
      )}
    </div>
  );
}
