'use client';

import Image from 'next/image';

import { getShopImageUrl } from '@/lib/shop-utils';
import type { CategoryProduct } from './shop-types';

type ShopProductCardProps = {
  product: CategoryProduct;
};

function formatPrice(price: number | null | undefined): string {
  if (price == null || Number.isNaN(Number(price))) return '—';
  return `${Number(price).toLocaleString('fa-IR')} ریال`;
}

function getMainImage(product: CategoryProduct): string | null {
  const images = Array.isArray(product.productImages) ? product.productImages : [];
  if (images.length === 0) return null;

  const main = images.find(img => img?.isMain) ?? images[0];
  return getShopImageUrl(main?.filePath);
}

export function ShopProductCard({ product }: ShopProductCardProps) {
  const imageUrl = getMainImage(product);
  const imageAlt = product.name || 'محصول';

  return (
    <article className='border border-[rgb(147,147,147)] rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full'>
      <div className='relative aspect-[4/3] bg-gray-100 flex items-center justify-center'>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className='object-cover'
            unoptimized
            sizes='(max-width: 768px) 50vw, 25vw'
          />
        ) : (
          <span className='text-sm text-gray-400'>بدون تصویر</span>
        )}
        {product.isAvailable === false && (
          <div className='absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded'>
            ناموجود
          </div>
        )}
      </div>

      <div className='p-3 flex flex-col gap-1.5 flex-1 text-right'>
        <h3 className='font-medium text-sm line-clamp-2'>{product.name}</h3>
        {product.categoryName && <p className='text-xs text-gray-500'>{product.categoryName}</p>}
        {product.description && (
          <p className='text-xs text-gray-600 line-clamp-2'>{product.description}</p>
        )}
        <p className='mt-auto pt-2 font-bold text-sm text-zinc-800'>
          {formatPrice(product.basePrice)}
        </p>
      </div>
    </article>
  );
}

export function ShopProductCardSkeleton() {
  return (
    <div className='border border-[rgb(147,147,147)] rounded-lg overflow-hidden animate-pulse'>
      <div className='aspect-[4/3] bg-gray-200' />
      <div className='p-3 space-y-2'>
        <div className='h-4 bg-gray-200 rounded w-3/4' />
        <div className='h-3 bg-gray-200 rounded w-1/2' />
        <div className='h-4 bg-gray-200 rounded w-2/3 mt-4' />
      </div>
    </div>
  );
}
