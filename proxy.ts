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

    // External-site entry: /wallets?nationalCode&phoneNumber without a session cookie
    // must not hit the dashboard auth layout (that redirects to /login).
    // Route them to the public Platform GetValidation page first.
    const isWalletsEntry = pathname === '/wallets';
    const nationalCode =
      request.nextUrl.searchParams.get('nationalCode') ||
      request.nextUrl.searchParams.get('nationalcode');
    const phoneNumber =
      request.nextUrl.searchParams.get('phoneNumber') ||
      request.nextUrl.searchParams.get('phonenumber') ||
      request.nextUrl.searchParams.get('mobile') ||
      request.nextUrl.searchParams.get('phone');
    const hasPlatformParams = Boolean(nationalCode?.trim() && phoneNumber?.trim());
    const accessTokenCookie = request.cookies.get(ACCESS_TOKEN_KEY)?.value;

    if (isWalletsEntry && hasPlatformParams && !accessTokenCookie) {
      const validateUrl = request.nextUrl.clone();
      validateUrl.pathname = `/${maybeLocale}/platform/validate`;
      return NextResponse.redirect(validateUrl);
    }

    const isDashboard = pathname.startsWith('/dashboard');

    if (!isDashboard) return response;

    // const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
    const accessToken = accessTokenCookie;
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
