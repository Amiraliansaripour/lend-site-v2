import * as Sentry from '@sentry/nextjs';
import { httpSentryDsn } from '@/lib/sentry';

Sentry.init({
  dsn: httpSentryDsn(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  tracesSampleRate: 0.2,
  sendDefaultPii: false,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tunnel: '/monitoring',
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.httpClientIntegration({
      failedRequestStatusCodes: [400, [402, 599]],
      failedRequestTargets: [/^(?!.*\/monitoring(?:\?|$)).*/],
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
