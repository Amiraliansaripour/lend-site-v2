import { NextResponse } from 'next/server';

type TciLoginResponse = {
  data?: {
    login_url?: string;
    deep_link?: string;
    token?: string;
  };
  message?: string;
};

const toIranMobile = (phone: string) => {
  let value = phone.trim().replace(/[\s-]/g, '');
  if (value.startsWith('+98')) value = `0${value.slice(3)}`;
  else if (value.startsWith('98')) value = `0${value.slice(2)}`;
  return value;
};

/**
 * Proxies TCI lendtech login so X-Lendtech-Secret never reaches the browser.
 * Body: { phoneNumber?: string } — omit when the user is not logged in.
 */
export async function POST(request: Request) {
  const secret = process.env.TCI_LENDTECH_SECRET?.trim();
  const endpoint =
    process.env.TCI_LENDTECH_LOGIN_URL?.trim() ||
    'https://my2-test.tci.ir/api/v1/auth/lendtech/login';

  if (!secret) {
    return NextResponse.json({ message: 'پیکربندی سرویس مخابرات ناقص است.' }, { status: 500 });
  }

  let phoneNumber: string | undefined;
  try {
    const body = (await request.json()) as { phoneNumber?: string };
    if (body?.phoneNumber?.trim()) {
      phoneNumber = toIranMobile(body.phoneNumber);
    }
  } catch {
    // empty body is fine (guest / not logged in)
  }

  const payload = phoneNumber && /^09\d{9}$/.test(phoneNumber) ? { phone_number: phoneNumber } : {};

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Lendtech-Secret': secret,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = (await upstream.json()) as TciLoginResponse;
    const loginUrl = data?.data?.login_url;

    if (!upstream.ok || !loginUrl) {
      return NextResponse.json(
        { message: data?.message || 'ورود به مخابرات ناموفق بود.' },
        { status: upstream.ok ? 502 : upstream.status },
      );
    }

    return NextResponse.json({ loginUrl, message: data.message });
  } catch {
    return NextResponse.json({ message: 'خطا در ارتباط با سرویس مخابرات.' }, { status: 502 });
  }
}
