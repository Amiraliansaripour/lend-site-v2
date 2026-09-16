import type { SiteTemplateImages } from '@/api/site-template';
import {
  getTenantSlugFromHostname,
  isDefaultCompanyName,
  normalizeTenantKey,
  tenantSlugCandidates,
} from '@/lib/site-template';

export type ResolvedSiteTemplate = {
  template: SiteTemplateImages;
  /** Subdomain slug when on a tenant host; null on apex / default. */
  tenantSlug: string | null;
  /**
   * True on the default site path:
   * - apex / no subdomain, OR
   * - subdomain with no matching companyName (falls back to default row)
   * When true, CSS keeps the app's built-in brand color (colorMain is not applied).
   */
  isDefaultTenant: boolean;
};

function findDefaultTemplate(list: SiteTemplateImages[]): SiteTemplateImages {
  const byNullCompany = list.find(item => isDefaultCompanyName(item.companyName));
  if (byNullCompany) return byNullCompany;

  // Legacy: API returned a single object without companyName (or only tenant rows).
  // Prefer first row but callers on apex still force default theming.
  return list[0]!;
}

/**
 * Resolve which SiteTemplate row to use for the current host.
 *
 * Rules (intentional, keep stable):
 * 1) Main domain (lend360.ir, www, localhost, IP) → ALWAYS the row with companyName null/empty.
 * 2) Subdomain (fld.lend360.ir / fld-lend.persiansys.ir) → row whose companyName
 *    matches the slug (exact) or the slug without a deploy suffix like "-lend".
 * 3) Subdomain without a matching companyName → fall back to the default (null) row.
 * 4) No hard-coded company list — any future companyName / subdomain works automatically.
 */
export function resolveSiteTemplate(
  templates: SiteTemplateImages[],
  hostnameOrSlug?: string | null,
): ResolvedSiteTemplate {
  const list = templates.filter(Boolean);
  if (list.length === 0) {
    throw new Error('No site templates available');
  }

  const defaultTemplate = findDefaultTemplate(list);

  const raw = hostnameOrSlug ?? null;
  const tenantSlug =
    raw == null || raw === ''
      ? null
      : raw.includes('.')
        ? getTenantSlugFromHostname(raw)
        : normalizeTenantKey(raw) || null;

  // ── Main / default host ──────────────────────────────────────────────
  // Never switch to a company-specific row just because it appears first in the array.
  if (!tenantSlug) {
    return {
      template: defaultTemplate,
      tenantSlug: null,
      isDefaultTenant: true,
    };
  }

  // ── Tenant subdomain ─────────────────────────────────────────────────
  // fld.lend360.ir → "fld"; fld-lend.persiansys.ir → try "fld-lend" then "fld"
  const candidates = tenantSlugCandidates(tenantSlug);
  const matched = list.find(item => {
    if (isDefaultCompanyName(item.companyName)) return false;
    const key = normalizeTenantKey(item.companyName);
    return candidates.includes(key);
  });

  if (!matched) {
    return {
      template: defaultTemplate,
      tenantSlug,
      isDefaultTenant: true,
    };
  }

  return {
    template: matched,
    tenantSlug,
    isDefaultTenant: false,
  };
}
