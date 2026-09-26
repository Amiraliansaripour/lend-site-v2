import { NextResponse, type NextRequest } from 'next/server';

import { sentryEnvelopeUrl } from '@/lib/sentry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const envelopeUrl = sentryEnvelopeUrl(process.env.NEXT_PUBLIC_SENTRY_DSN);
  if (!envelopeUrl) {
    return NextResponse.json({ error: 'Sentry DSN is not configured' }, { status: 500 });
  }

  const body = await request.arrayBuffer();
  const contentType = request.headers.get('content-type') ?? 'application/x-sentry-envelope';

  const upstream = await fetch(envelopeUrl, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
    },
  });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
