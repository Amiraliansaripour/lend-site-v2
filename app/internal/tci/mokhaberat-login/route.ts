import { NextResponse } from 'next/server';

type TciLoginResponse = {
  data?: {
    login_url?: string;
    deep_link?: string;
    token?: string;
  };
  message?: string;
};

/** Always TCI — never the lend API base URL */
const TCI_LOGIN_URL = 'https://my2-test.tci.ir/api/v1/auth/lendtech/login';

const toIranMobile = (phone: string) => {
  let value = phone.trim().replace(/[\s-]/g, '');
  if (value.startsWith('+98')) value = `0${value.slice(3)}`;
  else if (value.startsWith('98') && value.length >= 12) value = `0${value.slice(2)}`;
  return value;
};

/**
 * Proxies TCI lendtech login so X-Lendtech-Secret never reaches the browser.
 * Path is /internal/... (not /api/...) so reverse proxies to the lend backend
 * do not swallow this request.
 *
 * Body: { phoneNumber: string }
 * Success → { loginUrl } from upstream data.login_url
 */
export async function POST(request: Request) {
  const secret = process.env.TCI_LENDTECH_SECRET?.trim();
  const endpoint = process.env.TCI_LENDTECH_LOGIN_URL?.trim() || TCI_LOGIN_URL;

  if (!secret) {
    return NextResponse.json({ message: 'پیکربندی سرویس مخابرات ناقص است' }, { status: 500 });
  }

  // Guard: never accidentally call our own lend API
  if (!endpoint.includes('tci.ir')) {
    return NextResponse.json({ message: 'آدرس سرویس مخابرات نامعتبر است' }, { status: 500 });
  }

  let phoneNumber = '';
  try {
    const body = (await request.json()) as { phoneNumber?: string };
    phoneNumber = typeof body?.phoneNumber === 'string' ? toIranMobile(body.phoneNumber) : '';
  } catch {
    return NextResponse.json({ message: 'شماره موبایل نامعتبر است' }, { status: 400 });
  }

  if (!/^09\d{9}$/.test(phoneNumber)) {
    return NextResponse.json({ message: 'شماره موبایل نامعتبر است' }, { status: 400 });
  }

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Lendtech-Secret': secret,
      },
      body: JSON.stringify({ phone_number: phoneNumber }),
      cache: 'no-store',
    });

    const payload = (await upstream.json().catch(() => null)) as TciLoginResponse | null;
    const loginUrl = payload?.data?.login_url;

    if (!upstream.ok || !loginUrl) {
      return NextResponse.json(
        { message: payload?.message || 'ورود به مخابرات ناموفق بود' },
        { status: upstream.status >= 400 ? upstream.status : 502 },
      );
    }

    return NextResponse.json({ loginUrl, message: payload?.message });
  } catch {
    return NextResponse.json({ message: 'ارتباط با سرویس مخابرات برقرار نشد' }, { status: 502 });
  }
}
