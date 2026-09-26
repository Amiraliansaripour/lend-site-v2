import * as Sentry from '@sentry/nextjs';

export const SENTRY_INGEST_HOST = 'sentry.psaapp.ir';

/** Expected auth/session statuses — do not send these to Sentry. */
const IGNORED_HTTP_STATUSES = new Set([401]);

export function shouldCaptureHttpStatus(status: number) {
  return status >= 400 && status < 600 && !IGNORED_HTTP_STATUSES.has(status);
}

export function captureHttpError(args: {
  status: number;
  method?: string;
  url: string;
  message?: string;
}) {
  if (!shouldCaptureHttpStatus(args.status)) return;

  Sentry.captureException(new Error(`HTTP ${args.status}: ${args.method ?? 'GET'} ${args.url}`), {
    level: args.status >= 500 ? 'error' : 'warning',
    tags: {
      error_type: 'http_error',
      http_status: String(args.status),
    },
    extra: args,
  });
}

export function httpSentryDsn(dsn: string | undefined): string | undefined {
  if (!dsn) return undefined;
  return dsn.replace(/^https:\/\//i, 'http://');
}

/** HTTP envelope ingest URL. Used as the SDK tunnel target. */
export function sentryEnvelopeUrl(dsn: string | undefined): string | undefined {
  const httpDsn = httpSentryDsn(dsn);
  if (!httpDsn) return undefined;

  try {
    const url = new URL(httpDsn);
    const projectId = url.pathname.replace(/^\//, '').split('/')[0];
    if (!projectId) return undefined;
    return `http://${SENTRY_INGEST_HOST}/api/${projectId}/envelope/`;
  } catch {
    return undefined;
  }
}
