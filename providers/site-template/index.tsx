'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { SiteTemplateImages } from '@/api/site-template';
import { getSiteTemplateImages } from '@/api/site-template';
import { applyBrandName, getTenantSlugFromWindow, getUploadUrl } from '@/lib/site-template';
import { resolveSiteTemplate } from '@/lib/site-template-resolve';
import { applySiteThemeColor } from '@/lib/site-template-theme';
import { RETRY_DELAY_MS } from '@/queries/site-template';
import { SiteTemplateLoader } from '@/components/site-template-loader';

const SESSION_STORAGE_KEY = 'site-template-active';

type CachedActiveTemplate = {
  template: SiteTemplateImages;
  tenantSlug: string | null;
  isDefaultTenant: boolean;
};

/**
 * In-memory cache for the current JS runtime.
 * - Present after a successful fetch → SPA navigations reuse it (no API, no loader)
 * - Cleared on full page load / refresh → API is called again
 */
let memoryCache: CachedActiveTemplate | null = null;

/** Prevents duplicate in-flight fetches across Strict Mode remounts on the same page load. */
let pageLoadFetchPromise: Promise<CachedActiveTemplate> | null = null;

function readSessionCache(): CachedActiveTemplate | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedActiveTemplate | SiteTemplateImages;

    // Legacy cache: a bare template object without tenant metadata
    if (parsed && typeof parsed === 'object' && !('template' in parsed) && 'name' in parsed) {
      return {
        template: parsed as SiteTemplateImages,
        tenantSlug: getTenantSlugFromWindow(),
        isDefaultTenant: !(parsed as SiteTemplateImages).companyName?.trim(),
      };
    }

    const cached = parsed as CachedActiveTemplate;
    if (!cached?.template) return null;

    // Ignore cache from a different subdomain in the same browser profile (defensive).
    const currentSlug = getTenantSlugFromWindow();
    if ((cached.tenantSlug ?? null) !== (currentSlug ?? null)) {
      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

function clearSessionCache() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    // Clear previous key name if present
    sessionStorage.removeItem('site-template-images');
  } catch {
    // ignore
  }
}

function replaceSessionCache(data: CachedActiveTemplate) {
  clearSessionCache();
  memoryCache = data;

  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota / private-mode failures; memory cache still applies.
  }
}

async function fetchSiteTemplateForPageLoad(): Promise<CachedActiveTemplate> {
  if (pageLoadFetchPromise) return pageLoadFetchPromise;

  pageLoadFetchPromise = (async () => {
    const list = await getSiteTemplateImages();
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const resolved = resolveSiteTemplate(list, hostname);
    const payload: CachedActiveTemplate = {
      template: resolved.template,
      tenantSlug: resolved.tenantSlug,
      isDefaultTenant: resolved.isDefaultTenant,
    };
    replaceSessionCache(payload);
    return payload;
  })();

  try {
    return await pageLoadFetchPromise;
  } catch (error) {
    pageLoadFetchPromise = null;
    throw error;
  }
}

export type SiteTemplateImageKey =
  | 'favicon'
  | 'logo'
  | 'darkLogo'
  | 'lightLogo'
  | 'homeBanner'
  | 'slide_3'
  | 'creditCard'
  | 'cashCard'
  | 'store'
  | 'store_Res'
  | 'shopBanner'
  | 'shopBanner_Res'
  | 'merchantBanner'
  | 'merchantBanner_Res'
  | 'merchantSignupBanner';

type SiteTemplateContextValue = {
  template: SiteTemplateImages;
  brandName: string;
  phone: string;
  email: string;
  address: string;
  /** Active company subdomain slug, or null on the default site. */
  tenantSlug: string | null;
  isDefaultTenant: boolean;
  getImageUrl: (key: SiteTemplateImageKey) => string;
  withBrand: (text: string) => string;
};

const SiteTemplateContext = createContext<SiteTemplateContextValue | null>(null);

function upsertHeadLink(selector: string, attrs: Record<string, string>) {
  let link = document.querySelector<HTMLLinkElement>(selector);

  if (!link) {
    link = document.createElement('link');
    document.head.appendChild(link);
  }

  for (const [key, value] of Object.entries(attrs)) {
    link.setAttribute(key, value);
  }
}

function updateDocumentBranding(active: CachedActiveTemplate) {
  if (typeof document === 'undefined') return;

  const { template, isDefaultTenant } = active;

  applySiteThemeColor(template, { isDefaultTenant });

  const faviconUrl = getUploadUrl(template.favicon);
  if (faviconUrl) {
    upsertHeadLink('link[data-site-template-favicon]', {
      rel: 'icon',
      href: faviconUrl,
      'data-site-template-favicon': 'true',
    });
    upsertHeadLink('link[data-site-template-apple-icon]', {
      rel: 'apple-touch-icon',
      href: faviconUrl,
      'data-site-template-apple-icon': 'true',
    });
  }

  if (template.name) {
    document.title = template.name;
  }
}

type SiteTemplateProviderProps = {
  children: ReactNode;
};

export function SiteTemplateProvider({ children }: SiteTemplateProviderProps) {
  const isPageLoadRef = useRef(memoryCache === null);
  const [active, setActive] = useState<CachedActiveTemplate | null>(() => memoryCache);

  useLayoutEffect(() => {
    if (active) {
      updateDocumentBranding(active);
      return;
    }

    if (!isPageLoadRef.current) return;

    const fromSession = readSessionCache();
    if (fromSession) {
      setActive(fromSession);
      updateDocumentBranding(fromSession);
    }
  }, [active]);

  useEffect(() => {
    if (!isPageLoadRef.current) return;

    let cancelled = false;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const data = await fetchSiteTemplateForPageLoad();
        if (cancelled) return;

        setActive(data);
        updateDocumentBranding(data);
        isPageLoadRef.current = false;
      } catch {
        if (cancelled) return;
        retryTimeout = setTimeout(load, RETRY_DELAY_MS);
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);

  const template = active?.template ?? null;

  const getImageUrl = useCallback(
    (key: SiteTemplateImageKey) => {
      if (!template) return '';
      return getUploadUrl(template[key]);
    },
    [template],
  );

  const withBrand = useCallback(
    (text: string) => applyBrandName(text, template?.name ?? ''),
    [template?.name],
  );

  const value = useMemo<SiteTemplateContextValue | null>(() => {
    if (!active || !template) return null;

    return {
      template,
      brandName: template.name,
      phone: template.phone,
      email: template.email,
      address: template.address,
      tenantSlug: active.tenantSlug,
      isDefaultTenant: active.isDefaultTenant,
      getImageUrl,
      withBrand,
    };
  }, [active, template, getImageUrl, withBrand]);

  if (!value) {
    return <SiteTemplateLoader />;
  }

  return <SiteTemplateContext.Provider value={value}>{children}</SiteTemplateContext.Provider>;
}

export function useSiteTemplate() {
  const context = useContext(SiteTemplateContext);
  if (!context) {
    throw new Error('useSiteTemplate must be used within SiteTemplateProvider');
  }
  return context;
}

export function useBrandName() {
  return useSiteTemplate().brandName;
}

export function useBrandText(text: string) {
  return useSiteTemplate().withBrand(text);
}
