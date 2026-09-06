'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useUser } from '@/queries/users';
import { getUserId } from '@/lib/auth/client/user-info';
import {
  readPlatformEntryParams,
  validatePlatformEntry,
  clearPlatformSession,
} from '@/lib/auth/client/platform-validation';

type PlatformWalletsGateProps = {
  children: React.ReactNode;
};

/**
 * Runs Platform GetValidation when entering /wallets.
 *
 * Credential sources (priority):
 * 1) Query params from external-site link (nationalCode + phoneNumber)
 * 2) Logged-in user profile (nationalCode + phoneNumber)
 *
 * Success → stay on wallets (tokens refreshed). Failure → landing (/).
 */
export function PlatformWalletsGate({ children }: PlatformWalletsGateProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const startedKeyRef = useRef<string | null>(null);

  const queryParams = readPlatformEntryParams(searchParams);
  const userId = getUserId();
  const { data: user, isLoading: isUserLoading, isFetched } = useUser(userId || '');

  const profileNationalCode = (user?.nationalCode || user?.personInfo?.nationalCode || '').trim();
  const profilePhoneNumber = (user?.phoneNumber || user?.personInfo?.phoneNumber || '').trim();
  const hasQueryParams = Boolean(queryParams);

  const waitingForProfile = !hasQueryParams && Boolean(userId) && (isUserLoading || !isFetched);

  const nationalCode = (queryParams?.nationalCode || profileNationalCode).trim();
  const phoneNumber = (queryParams?.phoneNumber || profilePhoneNumber).trim();
  const canValidate = Boolean(nationalCode && phoneNumber);
  const validationKey = canValidate
    ? `${nationalCode}|${phoneNumber}|${hasQueryParams ? 'q' : 'p'}`
    : null;

  const [status, setStatus] = useState<'validating' | 'done'>('validating');

  useEffect(() => {
    if (waitingForProfile) {
      setStatus('validating');
      return;
    }

    if (!canValidate || !validationKey) {
      setStatus('done');
      return;
    }

    if (startedKeyRef.current === validationKey) return;
    startedKeyRef.current = validationKey;
    setStatus('validating');

    void (async () => {
      const result = await validatePlatformEntry({ nationalCode, phoneNumber });
      if (result.ok) {
        if (hasQueryParams) {
          router.replace('/wallets');
        }
        setStatus('done');
        return;
      }

      clearPlatformSession();
      router.replace('/');
    })();
  }, [
    waitingForProfile,
    canValidate,
    validationKey,
    nationalCode,
    phoneNumber,
    hasQueryParams,
    router,
  ]);

  if (status === 'validating' || waitingForProfile) {
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

  return <>{children}</>;
}
