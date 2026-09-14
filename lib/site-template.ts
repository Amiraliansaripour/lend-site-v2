const PLACEHOLDER_BRANDS = ['کارالند', 'Karalend', 'karalend'] as const;

/**
 * Labels that are never company tenants (infra hosts).
 * Real company matching stays dynamic via API `companyName` ↔ subdomain.
 */
const RESERVED_SUBDOMAINS = new Set([
  'www',
  'api',
  'app',
  'admin',
  'staging',
  'stage',
  'test',
  'dev',
  'develop',
  'm',
  'mail',
  'ftp',
  'cdn',
  'static',
  'assets',
  'img',
  'images',
  'media',
  'auth',
  'sso',
  'portal',
]);

export const getUploadUrl = (filePath?: string | null): string => {
  if (!filePath) return '';
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || '';
  return `${baseUrl}/uploads/${filePath}`;
};

export const applyBrandName = (text: string, brandName: string) => {
  if (!text || !brandName) return text;

  return PLACEHOLDER_BRANDS.reduce(
    (result, placeholder) => result.replaceAll(placeholder, brandName),
    text,
  );
};

/** Normalize company / subdomain labels for case-insensitive equality. */
export const normalizeTenantKey = (value?: string | null): string => {
  return (value ?? '').trim().toLowerCase();
};

/**
 * Default site row: companyName is null / undefined / blank.
 * These builds (apex domain, no tenant subdomain) must always use this row.
 */
export const isDefaultCompanyName = (companyName?: string | null): boolean => {
  return normalizeTenantKey(companyName).length === 0;
};

const isIpv4Hostname = (host: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(host);

/**
 * Tenant slug = first hostname label when (and only when) it is a real subdomain.
 *
 * Returns null (→ default companyName=null template) for:
 * - apex: lend360.ir
 * - www: www.lend360.ir
 * - localhost / 127.0.0.1 / raw server IPs (e.g. 185.x.x.x)
 * - reserved infra labels
 *
 * Returns slug for:
 * - fld.lend360.ir → "fld"
 * - fld.localhost → "fld" (local multi-tenant)
 */
export const getTenantSlugFromHostname = (hostname: string): string | null => {
  const host = hostname.split(':')[0]?.trim().toLowerCase() ?? '';
  if (!host) return null;

  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
    return null;
  }

  // Never treat bare IPv4 deploy hosts as tenants (e.g. 185.105.101.103)
  if (isIpv4Hostname(host)) {
    return null;
  }

  if (host.includes(':')) {
    // IPv6
    return null;
  }

  if (host.endsWith('.localhost')) {
    const slug = host.slice(0, -'.localhost'.length).split('.')[0] ?? '';
    if (!slug || RESERVED_SUBDOMAINS.has(slug)) return null;
    return slug;
  }

  const parts = host.split('.').filter(Boolean);
  // Need subdomain.domain.tld (3+ labels). Apex domain.tld → default.
  if (parts.length < 3) return null;

  const slug = parts[0] ?? '';
  if (!slug || RESERVED_SUBDOMAINS.has(slug)) return null;
  return slug;
};

export const getTenantSlugFromWindow = (): string | null => {
  if (typeof window === 'undefined') return null;
  return getTenantSlugFromHostname(window.location.hostname);
};
