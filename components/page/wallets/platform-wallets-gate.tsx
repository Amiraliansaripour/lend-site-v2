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

type PlatformWalletsGateProps = {
  children: React.ReactNode;
};

/**
 * When /wallets is opened with nationalCode + phoneNumber query params
 * (external entry while a session may already exist), re-validate via GetValidation.
 *
 * Normal /wallets visits without those params are untouched (OTP login flow).
 */
export function PlatformWalletsGate({ children }: PlatformWalletsGateProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const startedRef = useRef(false);

  const entryKey = searchParams.toString();
  const entryParams = readPlatformEntryParams(searchParams);
  const shouldValidate = Boolean(entryParams);

  const [status, setStatus] = useState<'idle' | 'validating' | 'error' | 'done'>(
    shouldValidate ? 'validating' : 'done',
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!shouldValidate || !entryParams) {
      setStatus('done');
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;
    setStatus('validating');

    void (async () => {
      const result = await validatePlatformEntry(entryParams);
      if (result.ok) {
        router.replace('/wallets');
        setStatus('done');
        return;
      }

      setErrorMessage(result.message);
      setStatus('error');
      toast.error(result.message);
      clearPlatformSession();
      window.setTimeout(() => {
        router.replace('/');
      }, LANDING_REDIRECT_DELAY_MS);
    })();
    // entryKey captures query string; entryParams is derived from it for this run.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot per query
  }, [entryKey, shouldValidate, router]);

  if (status === 'validating') {
    return (
      <div className='flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4'>
        <div
          className='h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent'
          aria-hidden
        />
        <p className='text-muted-foreground text-center text-sm'>در حال احراز هویت...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className='flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4'>
        <p className='text-destructive max-w-md text-center text-sm font-medium'>{errorMessage}</p>
        <p className='text-muted-foreground text-center text-xs'>در حال انتقال به صفحه اصلی...</p>
      </div>
    );
  }

  return <>{children}</>;
}
