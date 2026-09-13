import { NextResponse, type NextRequest } from 'next/server';

import createMiddleware from 'next-intl/middleware';

import { routing, isLocale } from '@/i18n/routing';

// * constants
import { ACCESS_TOKEN_KEY } from '@/lib/auth/constants/cookies';

const SENTRY_TUNNEL_PATH = '/monitoring';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Same-origin Sentry tunnel must not be locale-prefixed (HTTPS page → HTTP ingest).
  if (pathname === SENTRY_TUNNEL_PATH || pathname.startsWith(`${SENTRY_TUNNEL_PATH}/`)) {
    return NextResponse.next();
  }

  const i18nProxy = createMiddleware(routing);
  const response = i18nProxy(request);

  const [maybeLocale, ...pathSegments] = pathname.split('/').filter(Boolean);

  if (isLocale(maybeLocale)) {
    const localePath = `/${pathSegments.join('/')}`;
    const isDashboard = localePath.startsWith('/dashboard');

    if (!isDashboard) return response;

    const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
    const authenticated = accessToken !== undefined;
    if (authenticated) return response;

    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  // Keep next-intl off the Sentry tunnel. Next 16 runs this file as proxy.ts.
  matcher: '/((?!api|trpc|_next|_vercel|monitoring|.*\\..*).*)',
};
