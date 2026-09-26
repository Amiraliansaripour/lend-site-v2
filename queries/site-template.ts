import { queryOptions } from '@tanstack/react-query';

import { getSiteTemplateImages } from '@/api/site-template';
import { resolveSiteTemplate } from '@/lib/site-template-resolve';

export const siteTemplateQueryKeys = {
  images: ['site-template', 'images'] as const,
};

export const RETRY_DELAY_MS = 5_000;

export const getSiteTemplateImagesQueryOptions = () => {
  return queryOptions({
    queryKey: siteTemplateQueryKeys.images,
    queryFn: async () => {
      const list = await getSiteTemplateImages();
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      return resolveSiteTemplate(list, hostname).template;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: Infinity,
    retryDelay: RETRY_DELAY_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
