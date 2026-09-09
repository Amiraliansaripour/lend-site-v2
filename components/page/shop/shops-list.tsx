'use client';

import { ChevronRight, ChevronLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ShopCard, ShopListSkeleton } from './shop-card';
import type { Shop } from './shop-types';

type ShopsListProps = {
  shops: Shop[];
  totalPages: number;
  page: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
};

export function ShopsList({ shops, totalPages, page, isLoading, onPageChange }: ShopsListProps) {
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    onPageChange(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading && shops.length === 0) {
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
            type='button'
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={cn(
              'p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            )}
            aria-label='Previous page'
          >
            <ChevronLeft className='w-5 h-5' />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
            const isCurrentPage = pageNum === page;
            const shouldShow =
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= page - 1 && pageNum <= page + 1);

            if (!shouldShow) {
              if (pageNum === page - 2 || pageNum === page + 2) {
                return (
                  <span key={pageNum} className='px-2 text-gray-400'>
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                type='button'
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                disabled={isCurrentPage}
                className={cn(
                  'min-w-[40px] h-10 px-3 rounded-md border transition-colors',
                  isCurrentPage
                    ? 'bg-purple-primary text-white border-purple-primary cursor-default'
                    : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type='button'
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
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
