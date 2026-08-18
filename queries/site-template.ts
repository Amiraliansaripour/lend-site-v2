// * @tanstack/react-query
import { queryOptions } from '@tanstack/react-query';

// * api
import { getSiteTemplateImages } from '@/api/site-template';

export const siteTemplateQueryKeys = {
  images: ['site-template', 'images'] as const,
};

export const RETRY_DELAY_MS = 5_000;

export const getSiteTemplateImagesQueryOptions = () => {
  return queryOptions({
    queryKey: siteTemplateQueryKeys.images,
    queryFn: getSiteTemplateImages,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: Infinity,
    retryDelay: RETRY_DELAY_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
