import { NextResponse, type NextRequest } from 'next/server';

import createMiddleware from 'next-intl/middleware';

import { routing, isLocale } from '@/i18n/routing';

// * constants
import { ACCESS_TOKEN_KEY } from '@/lib/auth/constants/cookies';

export async function proxy(request: NextRequest) {
  const i18nProxy = createMiddleware(routing);
  const response = i18nProxy(request);

  const pathname = request.nextUrl.pathname;
  const [maybeLocale, ...pathSegments] = pathname.split('/').filter(Boolean);

  if (isLocale(maybeLocale)) {
    const pathname = `/${pathSegments.join('/')}`;
    const isDashboard = pathname.startsWith('/dashboard');

    if (!isDashboard) return response;

    const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
    const authenticated = accessToken !== undefined;
    if (authenticated) return response;

    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
