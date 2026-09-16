import { NextResponse } from 'next/server';

import { createClubSsoAssertion } from '@/lib/club-sso-server';

/** Temporary demo endpoint — club guide test identity. Remove after client demo. */
export async function POST() {
  if (process.env.NODE_ENV === 'production' && process.env.CLUB_SSO_ALLOW_TEST !== '1') {
    return NextResponse.json({ isSuccess: false, message: 'Not available' }, { status: 404 });
  }

  try {
    const assertion = await createClubSsoAssertion({
      nationalCode: '1000000000',
      mobile: '09121000000',
    });

    return NextResponse.json({ isSuccess: true, data: { assertion } });
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
