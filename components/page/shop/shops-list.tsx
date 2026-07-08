<<<<<<< HEAD
'use client';

import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ShopCard, ShopListSkeleton } from './shop-card';
import type { Shop } from './shop-types';

type ShopsListProps = {
  shops: Shop[];
  totalPages: number;
  isLoading?: boolean;
};

export function ShopsList({ shops, totalPages, isLoading }: ShopsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;

      const params = new URLSearchParams(searchParams.toString());
      if (newPage === 1) {
        params.delete('page');
      } else {
        params.set('page', newPage.toString());
      }

      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: true });
      });
    },
    [searchParams, router, totalPages],
  );

  if (isLoading) {
    return <ShopListSkeleton count={6} />;
  }

  if (shops.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <p className='text-gray-500 text-lg mb-2'>فروشگاهی یافت نشد</p>
        <p className='text-gray-400 text-sm'>لطفاً فیلترهای دیگری را امتحان کنید</p>
      </div>
    );
  }

  return (
    <div className='flex-1'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        {shops.map(shop => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-2' dir='ltr'>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPending}
            className={cn(
              'p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            )}
            aria-label='Previous page'
          >
            <ChevronLeft className='w-5 h-5' />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            const isCurrentPage = page === currentPage;
            const shouldShow =
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1);

            if (!shouldShow) {
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className='px-2 text-gray-400'>
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={isCurrentPage || isPending}
                className={cn(
                  'min-w-[40px] h-10 px-3 rounded-md border transition-colors',
                  isCurrentPage
                    ? 'bg-purple-primary text-white border-purple-primary cursor-default'
                    : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPending}
            className={cn(
              'p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            )}
            aria-label='Next page'
          >
            <ChevronRight className='w-5 h-5' />
          </button>
        </div>
      )}
    </div>
  );
}
=======
'use client';

import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ShopCard, ShopListSkeleton } from './shop-card';
import type { Shop } from './shop-types';

type ShopsListProps = {
  shops: Shop[];
  totalPages: number;
  isLoading?: boolean;
};

export function ShopsList({ shops, totalPages, isLoading }: ShopsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;

      const params = new URLSearchParams(searchParams.toString());
      if (newPage === 1) {
        params.delete('page');
      } else {
        params.set('page', newPage.toString());
      }

      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: true });
      });
    },
    [searchParams, router, totalPages],
  );

  if (isLoading) {
    return <ShopListSkeleton count={6} />;
  }

  if (shops.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <p className='text-gray-500 text-lg mb-2'>فروشگاهی یافت نشد</p>
        <p className='text-gray-400 text-sm'>لطفاً فیلترهای دیگری را امتحان کنید</p>
      </div>
    );
  }

  return (
    <div className='flex-1'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        {shops.map(shop => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-2' dir='ltr'>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPending}
            className={cn(
              'p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            )}
            aria-label='Previous page'
          >
            <ChevronLeft className='w-5 h-5' />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            const isCurrentPage = page === currentPage;
            const shouldShow =
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1);

            if (!shouldShow) {
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className='px-2 text-gray-400'>
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={isCurrentPage || isPending}
                className={cn(
                  'min-w-[40px] h-10 px-3 rounded-md border transition-colors',
                  isCurrentPage
                    ? 'bg-purple-primary text-white border-purple-primary cursor-default'
                    : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPending}
            className={cn(
              'p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            )}
            aria-label='Next page'
          >
            <ChevronRight className='w-5 h-5' />
          </button>
        </div>
      )}
    </div>
  );
}
>>>>>>> a47b58a (pwa)
