'use client';

import type { CategoryProduct } from './shop-types';
import { ShopProductCard, ShopProductCardSkeleton } from './shop-product-card';

type ShopProductListProps = {
  products: CategoryProduct[];
  isLoading?: boolean;
  hasSelectedCategory?: boolean;
};

export function ShopProductList({
  products,
  isLoading,
  hasSelectedCategory = true,
}: ShopProductListProps) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <ShopProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!hasSelectedCategory) {
    return (
      <div className='flex items-center justify-center min-h-[200px] text-gray-500 text-sm'>
        یک دسته‌بندی را انتخاب کنید
      </div>
    );
  }

  const safeProducts = Array.isArray(products) ? products : [];

  if (safeProducts.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-[200px] text-gray-500 text-sm'>
        محصولی در این دسته وجود ندارد
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'>
      {safeProducts.map(product =>
        product?.id ? <ShopProductCard key={product.id} product={product} /> : null,
      )}
    </div>
  );
}
