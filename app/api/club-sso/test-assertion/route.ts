import { NextResponse } from 'next/server';

import { parseClubSsoTheme } from '@/lib/club-sso';
import { createClubSsoAssertion } from '@/lib/club-sso-server';

/** Temporary demo endpoint — club guide test identity. Remove after client demo. */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production' && process.env.CLUB_SSO_ALLOW_TEST !== '1') {
    return NextResponse.json({ isSuccess: false, message: 'Not available' }, { status: 404 });
  }

  let themeInput: unknown;
  try {
    const body = (await request.json()) as { theme?: string };
    themeInput = body.theme;
  } catch {
    themeInput = undefined;
  }

  try {
    const theme = parseClubSsoTheme(themeInput) ?? 'auto';
    const assertion = await createClubSsoAssertion(
      {
        nationalCode: '1000000000',
        mobile: '09121000000',
      },
      theme,
    );

    return NextResponse.json({ isSuccess: true, data: { assertion, theme } });
  } catch (error) {
    console.error('[club-sso] demo assertion failed', error);
    return NextResponse.json(
      {
        isSuccess: false,
        message:
          error instanceof Error && error.message.includes('CLUB_SSO_PRIVATE_KEY')
            ? 'پیکربندی ورود یکپارچه باشگاه کامل نیست'
            : 'ورود آزمایشی ناموفق بود',
      },
      { status: 500 },
    );
  }
}
