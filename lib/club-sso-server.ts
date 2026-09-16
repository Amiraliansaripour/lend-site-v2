import 'server-only';

import { createPrivateKey, type KeyObject } from 'node:crypto';
import { SignJWT } from 'jose';

import { isIranMobile09, isNationalCode, toIranMobile09 } from '@/lib/club-sso';

const ISSUER = 'lendtech';
const AUDIENCE = 'tcclub';
/** Guide recommendation: 2 minutes (hard max 5). */
const ASSERTION_TTL = '2m';

let cachedKey: KeyObject | null = null;

const readPrivateKeyPem = () => {
  const raw = process.env.CLUB_SSO_PRIVATE_KEY?.trim();
  if (!raw) {
    throw new Error('CLUB_SSO_PRIVATE_KEY is not configured');
  }
  return raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
};

const getSigningKey = (): KeyObject => {
  if (cachedKey) return cachedKey;
  cachedKey = createPrivateKey(readPrivateKeyPem());
  return cachedKey;
};

export type ClubSsoIdentity = {
  nationalCode: string;
  mobile: string;
};

export const normalizeClubSsoIdentity = (
  nationalCode: string,
  mobile: string,
): ClubSsoIdentity | null => {
  const code = nationalCode.trim();
  const phone = toIranMobile09(mobile);
  if (!isNationalCode(code) || !isIranMobile09(phone)) return null;
  return { nationalCode: code, mobile: phone };
};

/**
 * Creates a compact JWS assertion (guide §3–4).
 * Private key never leaves the server.
 * Theme is NOT part of the signed assertion — send it only as a form field.
 */
export async function createClubSsoAssertion(identity: ClubSsoIdentity): Promise<string> {
  const header: { alg: 'RS256'; typ: 'JWT'; kid?: string } = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const kid = process.env.CLUB_SSO_KID?.trim();
  if (kid) header.kid = kid;

  return new SignJWT({
    national_code: identity.nationalCode,
    mobile: identity.mobile,
  })
    .setProtectedHeader(header)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setNotBefore('0s')
    .setExpirationTime(ASSERTION_TTL)
    .setJti(crypto.randomUUID())
    .sign(getSigningKey());
}
