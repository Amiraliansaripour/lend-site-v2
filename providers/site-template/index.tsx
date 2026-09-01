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
import { applyBrandName, getUploadUrl } from '@/lib/site-template';
import { RETRY_DELAY_MS } from '@/queries/site-template';
import { SiteTemplateLoader } from '@/components/site-template-loader';

const SESSION_STORAGE_KEY = 'site-template-images';

/**
 * In-memory cache for the current JS runtime.
 * - Present after a successful fetch → SPA navigations reuse it (no API, no loader)
 * - Cleared on full page load / refresh → API is called again
 */
let memoryCache: SiteTemplateImages | null = null;

/** Prevents duplicate in-flight fetches across Strict Mode remounts on the same page load. */
let pageLoadFetchPromise: Promise<SiteTemplateImages> | null = null;

function readSessionCache(): SiteTemplateImages | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SiteTemplateImages;
  } catch {
    return null;
  }
}

function clearSessionCache() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** On HTTP 200 success: clear previous session data, then store the fresh payload. */
function replaceSessionCache(data: SiteTemplateImages) {
  clearSessionCache();
  memoryCache = data;

  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota / private-mode failures; memory cache still applies.
  }
}

async function fetchSiteTemplateForPageLoad(): Promise<SiteTemplateImages> {
  if (pageLoadFetchPromise) return pageLoadFetchPromise;

  pageLoadFetchPromise = (async () => {
    const data = await getSiteTemplateImages();
    replaceSessionCache(data);
    return data;
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

function updateDocumentBranding(template: SiteTemplateImages) {
  if (typeof document === 'undefined') return;

  const faviconUrl = getUploadUrl(template.favicon);
  if (faviconUrl) {
    // Update dedicated links instead of removing Next.js-managed icon nodes.
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
  // Full page load/refresh → memoryCache is null. SPA remount → memoryCache is set.
  const isPageLoadRef = useRef(memoryCache === null);
  const [template, setTemplate] = useState<SiteTemplateImages | null>(() => memoryCache);

  useLayoutEffect(() => {
    if (template) {
      updateDocumentBranding(template);
      return;
    }

    // Refresh: session still has data — show it immediately (no loader) while we re-fetch.
    if (!isPageLoadRef.current) return;

    const fromSession = readSessionCache();
    if (fromSession) {
      setTemplate(fromSession);
      updateDocumentBranding(fromSession);
    }
  }, [template]);

  useEffect(() => {
    // SPA navigation / remount with memory cache — do not call the API again.
    if (!isPageLoadRef.current) return;

    let cancelled = false;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const data = await fetchSiteTemplateForPageLoad();
        if (cancelled) return;

        setTemplate(data);
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
    if (!template) return null;

    return {
      template,
      brandName: template.name,
      phone: template.phone,
      email: template.email,
      address: template.address,
      getImageUrl,
      withBrand,
    };
  }, [template, getImageUrl, withBrand]);

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
