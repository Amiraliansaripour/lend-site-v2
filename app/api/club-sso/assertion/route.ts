import { NextResponse } from 'next/server';

import { accessToken } from '@/lib/auth/server/cookies';
import { BASE_URLS } from '@/lib/api/constants';
import { createClubSsoAssertion, normalizeClubSsoIdentity } from '@/lib/club-sso-server';
import type { APIResult } from '@/types/api';
import type { User } from '@/types/auth';

type AssertionBody = {
  userId?: string;
};

/**
 * Step 2 of club SSO (guide): mint a short-lived RS256 JWS on the Lendtech server.
 * Identity is taken from User/Get so the client cannot spoof another member.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const bearer = authHeader?.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : null;
  const token = bearer || (await accessToken.get());

  if (!token) {
    return NextResponse.json({ isSuccess: false, message: 'ورود لازم است' }, { status: 401 });
  }

  let body: AssertionBody = {};
  try {
    body = (await request.json()) as AssertionBody;
  } catch {
    body = {};
  }

  const userId = body.userId?.trim();
  if (!userId) {
    return NextResponse.json(
      { isSuccess: false, message: 'شناسه کاربر ارسال نشده است' },
      { status: 400 },
    );
  }

  try {
    const userResp = await fetch(`${BASE_URLS.DEFAULT}/User/Get/${encodeURIComponent(userId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (userResp.status === 401) {
      return NextResponse.json(
        { isSuccess: false, message: 'نشست منقضی شده است' },
        { status: 401 },
      );
    }

    const userPayload = (await userResp.json()) as APIResult<User>;
    const user = userPayload?.data;
    if (!userResp.ok || !userPayload?.isSuccess || !user) {
      return NextResponse.json(
        { isSuccess: false, message: userPayload?.message || 'دریافت اطلاعات کاربر ناموفق بود' },
        { status: 400 },
      );
    }

    const nationalCode = user.nationalCode || user.personInfo?.nationalCode || '';
    const mobile = user.personInfo?.phoneNumber || user.phoneNumber || '';
    const identity = normalizeClubSsoIdentity(nationalCode, mobile);

    if (!identity) {
      return NextResponse.json(
        {
          isSuccess: false,
          message:
            'کد ملی یا شماره موبایل در پروفایل کامل نیست. ابتدا از «مخابرات من» عضو باشگاه شوید.',
        },
        { status: 400 },
      );
    }

    const assertion = await createClubSsoAssertion(identity);

    return NextResponse.json({ isSuccess: true, data: { assertion } });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes('CLUB_SSO_PRIVATE_KEY')
        ? 'پیکربندی ورود یکپارچه باشگاه کامل نیست'
        : 'ساخت توکن ورود به باشگاه ناموفق بود';

    console.error('[club-sso] assertion failed', error);
    return NextResponse.json({ isSuccess: false, message }, { status: 500 });
  }
}
