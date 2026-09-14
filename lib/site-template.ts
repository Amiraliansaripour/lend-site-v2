const PLACEHOLDER_BRANDS = ['کارالند', 'Karalend', 'karalend'] as const;

/**
 * Subdomains that never map to a company tenant (infra / marketing hosts).
 * Company matching itself stays fully dynamic via API `companyName`.
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

export const isDefaultCompanyName = (companyName?: string | null): boolean => {
  return normalizeTenantKey(companyName).length === 0;
};

/**
 * Reads the leftmost hostname label as a potential tenant slug.
 * Examples:
 * - foolad.lend360.ir → "foolad"
 * - tamin.localhost → "tamin"
 * - lend360.ir / www.lend360.ir / localhost → null (default site)
 */
export const getTenantSlugFromHostname = (hostname: string): string | null => {
  const host = hostname.split(':')[0]?.trim().toLowerCase() ?? '';
  if (!host) return null;

  // foolad.localhost (local multi-tenant)
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
    return null;
  }

  if (host.endsWith('.localhost')) {
    const slug = host.slice(0, -'.localhost'.length).split('.')[0] ?? '';
    if (!slug || RESERVED_SUBDOMAINS.has(slug)) return null;
    return slug;
  }

  const parts = host.split('.').filter(Boolean);
  // subdomain.domain.tld → at least 3 labels
  if (parts.length < 3) return null;

  const slug = parts[0] ?? '';
  if (!slug || RESERVED_SUBDOMAINS.has(slug)) return null;
  return slug;
};

export const getTenantSlugFromWindow = (): string | null => {
  if (typeof window === 'undefined') return null;
  return getTenantSlugFromHostname(window.location.hostname);
};
