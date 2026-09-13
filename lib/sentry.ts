export const SENTRY_INGEST_HOST = 'sentry.psaapp.ir';

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
