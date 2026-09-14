import type { SiteTemplateImages } from '@/api/site-template';
import {
  getTenantSlugFromHostname,
  isDefaultCompanyName,
  normalizeTenantKey,
} from '@/lib/site-template';

export type ResolvedSiteTemplate = {
  template: SiteTemplateImages;
  /** Subdomain slug when on a tenant host; null on apex / default. */
  tenantSlug: string | null;
  /** True when the selected row has an empty companyName (apex default). */
  isDefaultTenant: boolean;
};

/**
 * Picks the active site template for the current host.
 * - Default host → first row with empty companyName (fallback: first row)
 * - Tenant host  → row whose companyName matches the subdomain (fallback: default)
 * Matching is dynamic: any future companyName / subdomain works without code changes.
 */
export function resolveSiteTemplate(
  templates: SiteTemplateImages[],
  hostnameOrSlug?: string | null,
): ResolvedSiteTemplate {
  const list = templates.filter(Boolean);
  if (list.length === 0) {
    throw new Error('No site templates available');
  }

  const defaultTemplate = list.find(item => isDefaultCompanyName(item.companyName)) ?? list[0]!;

  const raw = hostnameOrSlug ?? null;
  const tenantSlug =
    raw == null || raw === ''
      ? null
      : raw.includes('.')
        ? getTenantSlugFromHostname(raw)
        : normalizeTenantKey(raw) || null;

  if (!tenantSlug) {
    return {
      template: defaultTemplate,
      tenantSlug: null,
      isDefaultTenant: isDefaultCompanyName(defaultTemplate.companyName),
    };
  }

  const matched = list.find(item => normalizeTenantKey(item.companyName) === tenantSlug);

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
    isDefaultTenant: isDefaultCompanyName(matched.companyName),
  };
}
