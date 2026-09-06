'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import type { ShopType } from '@/components/page/shop/shop-types';

const readCategories = (params: URLSearchParams) => params.getAll('category');

const readType = (params: URLSearchParams): ShopType => (params.get('type') as ShopType) || '2';

const readPage = (params: URLSearchParams) => parseInt(params.get('page') || '1', 10);

const restoreScroll = (scrollY: number) => {
  window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' });
};

/**
 * Shops filters as local state + shallow URL sync.
 * Avoids Next.js router navigations on each checkbox (those reset scroll to the banner).
 */
export function useShopsFilters() {
  const searchParams = useSearchParams();

  const [type, setType] = useState<ShopType>(() => readType(searchParams));
  const [categories, setCategories] = useState<string[]>(() => readCategories(searchParams));
  const [page, setPage] = useState(() => readPage(searchParams));

  // Back/forward only — replaceState does not update useSearchParams.
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setType(readType(params));
      setCategories(readCategories(params));
      setPage(readPage(params));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const writeUrl = useCallback((next: { type: ShopType; categories: string[]; page: number }) => {
    const params = new URLSearchParams();

    if (next.type !== '2') {
      params.set('type', next.type);
    }
    next.categories.forEach(id => params.append('category', id));
    if (next.page > 1) {
      params.set('page', String(next.page));
    }

    const qs = params.toString();
    const path = window.location.pathname;
    const href = qs ? `${path}?${qs}` : path;
    const scrollY = window.scrollY;

    window.history.replaceState(window.history.state, '', href);

    restoreScroll(scrollY);
    requestAnimationFrame(() => {
      restoreScroll(scrollY);
      requestAnimationFrame(() => restoreScroll(scrollY));
    });
  }, []);

  const setShopType = useCallback(
    (nextType: ShopType) => {
      setType(nextType);
      setPage(1);
      writeUrl({ type: nextType, categories, page: 1 });
    },
    [categories, writeUrl],
  );

  const setShopCategories = useCallback(
    (nextCategories: string[]) => {
      setCategories(nextCategories);
      setPage(1);
      writeUrl({ type, categories: nextCategories, page: 1 });
    },
    [type, writeUrl],
  );

  const setShopPage = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      writeUrl({ type, categories, page: nextPage });
    },
    [type, categories, writeUrl],
  );

  return {
    type,
    categories,
    page,
    setShopType,
    setShopCategories,
    setShopPage,
  };
}
