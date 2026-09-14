'use client';

import { useState } from 'react';
import { Gift } from 'lucide-react';
import { toast } from 'sonner';

import { BoomLogo } from '@/components/brand/boom-logo';
import { submitClubSsoAssertion } from '@/lib/club-sso';

/**
 * Temporary client-demo page for club SSO (guide test account).
 * Route: /fa/club-sso-test — remove after demo.
 */
export default function ClubSsoDemoPage() {
  const [loading, setLoading] = useState(false);

  const enterClub = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const resp = await fetch('/api/club-sso/test-assertion', { method: 'POST' });
      const payload = (await resp.json()) as {
        isSuccess?: boolean;
        message?: string;
        data?: { assertion?: string };
      };

      if (!resp.ok || !payload.isSuccess || !payload.data?.assertion) {
        toast.error(payload.message || 'ورود به باشگاه ناموفق بود.');
        setLoading(false);
        return;
      }

      submitClubSsoAssertion(payload.data.assertion);
    } catch {
      toast.error('خطا در ارتباط با سرویس باشگاه.');
      setLoading(false);
    }
  };

  return (
    <main className='relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[radial-gradient(120%_80%_at_50%_-10%,#e8f3ff_0%,#f7fafc_45%,#ffffff_100%)] px-6'>
      <div className='absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand/10 to-transparent' />

      <div className='relative z-10 flex w-full max-w-sm flex-col items-center gap-8 text-center'>
        <BoomLogo markClassName='size-10' wordmarkClassName='text-xl' />

        <div className='space-y-3'>
          <div className='mx-auto flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand'>
            <Gift className='size-7' aria-hidden />
          </div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900'>باشگاه مشتریان</h1>
          <p className='text-sm leading-7 text-gray-600'>
            ورود یکپارچه از سرویس اعتباری به باشگاه مشتریان مخابرات — بدون ورود دوباره.
          </p>
        </div>

        <button
          type='button'
          disabled={loading}
          onClick={() => void enterClub()}
          className='inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90 disabled:opacity-60'
        >
          {loading ? 'در حال انتقال...' : 'ورود به باشگاه مشتریان'}
        </button>
      </div>
    </main>
  );
}
