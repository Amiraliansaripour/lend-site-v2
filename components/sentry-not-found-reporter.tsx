'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { usePathname } from 'next/navigation';

export function SentryNotFoundReporter() {
  const pathname = usePathname();

  useEffect(() => {
    Sentry.captureException(new Error(`Not Found: ${pathname}`), {
      level: 'error',
      tags: { error_type: 'not_found' },
      extra: { pathname },
    });
  }, [pathname]);

  return null;
}
