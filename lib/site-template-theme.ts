import type { SiteTemplateImages } from '@/api/site-template';

const THEME_VARS = ['--brand', '--primary', '--sidebar-primary'] as const;

function isValidCssColor(value: string): boolean {
  if (typeof window === 'undefined') {
    return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.trim());
  }

  const probe = document.createElement('span').style;
  probe.color = '';
  probe.color = value;
  return probe.color !== '';
}

/**
 * Applies tenant brand color to CSS variables used across the app.
 * Default (empty companyName) clears overrides so globals.css colors apply.
 */
export function applySiteThemeColor(
  template: SiteTemplateImages,
  options: { isDefaultTenant: boolean },
) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  if (options.isDefaultTenant) {
    for (const key of THEME_VARS) {
      root.style.removeProperty(key);
    }
    return;
  }

  const color = template.colorMain?.trim() ?? '';
  if (!color || !isValidCssColor(color)) {
    for (const key of THEME_VARS) {
      root.style.removeProperty(key);
    }
    return;
  }

  for (const key of THEME_VARS) {
    root.style.setProperty(key, color);
  }
}
