'use client';

import Image from 'next/image';
import { ArrowLeft, Store } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/page/landing/glass-panel';
import { Reveal } from '@/components/page/landing/reveal';
import { SectionHeading } from '@/components/page/landing/section-heading';
import { Link } from '@/i18n/navigation';
import { getShopImageUrl } from '@/lib/shop-utils';
import { useShopsFullPagination } from '@/queries/shop';
import { useSiteTemplate } from '@/providers/site-template';
import { cn } from '@/lib/utils';
import type { Shop } from '@/components/page/shop/shop-types';

function shopInitials(name?: string) {
  if (!name) return 'ش';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(part => part[0]).join('') || 'ش';
}

function resolveShopPhoto(shop: Shop) {
  return (
    getShopImageUrl(shop.attachmentFilePath) ||
    getShopImageUrl(shop.attachmentThumbnailFilePath) ||
    getShopImageUrl(shop.attachmentBannerFilePath) ||
    getShopImageUrl(shop.logoPath) ||
    null
  );
}

export function ShopsPreview() {
  const { withBrand } = useSiteTemplate();
  const { data, isLoading } = useShopsFullPagination({ pageNumber: 1, pageSize: 6 });
  const shops = data?.items?.filter(shop => shop.isActive) ?? [];

  if (!isLoading && shops.length === 0) return null;

  return (
    <section className='mx-auto max-w-6xl px-4 md:px-6 lg:px-10'>
      <Reveal>
        <SectionHeading
          eyebrow='خرید'
          title='فروشگاه‌های طرف قرارداد'
          description={withBrand('فروشگاه‌های منتخب را ببینید و مستقیم وارد صفحه هر فروشگاه شوید.')}
        />
      </Reveal>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className='h-64 animate-pulse rounded-[2rem] border border-navy/10 bg-navy/5 dark:border-white/10 dark:bg-white/5'
              />
            ))
          : shops.map((shop, index) => {
              const photo = resolveShopPhoto(shop);
              return (
                <Reveal key={shop.id} delayMs={index * 50}>
                  <Link href={`/shops/${shop.id}`} className='block h-full'>
                    <GlassPanel className='group h-full overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:border-gold/45'>
                      <div className='relative aspect-[16/10] overflow-hidden bg-navy/5 dark:bg-white/5'>
                        {photo ? (
                          <Image
                            src={photo}
                            alt={shop.name || 'فروشگاه'}
                            width={640}
                            height={400}
                            unoptimized
                            className='size-full object-cover transition-transform duration-500 group-hover:scale-105'
                          />
                        ) : (
                          <div className='flex size-full items-center justify-center bg-linear-to-br from-gold/30 via-gold/10 to-transparent'>
                            <span className='flex size-16 items-center justify-center rounded-2xl bg-gold text-xl font-bold text-navy'>
                              {shopInitials(shop.name)}
                            </span>
                          </div>
                        )}
                        <div className='absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-navy/55 to-transparent dark:from-navy/70' />
                        <span className='absolute top-3 right-3 rounded-full border border-gold/30 bg-navy/70 px-2.5 py-1 text-[11px] text-gold backdrop-blur-sm'>
                          فروشگاه
                        </span>
                      </div>
                      <div className='flex items-end justify-between gap-3 p-4'>
                        <div className='min-w-0'>
                          <h3 className='truncate font-semibold text-navy dark:text-white'>
                            {shop.name}
                          </h3>
                          <p className='mt-1 flex items-center gap-1.5 text-sm text-navy/45 dark:text-white/45'>
                            <Store className='size-3.5' />
                            مشاهده جزئیات
                          </p>
                        </div>
                        <span
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-full bg-gold/20 text-navy transition-transform group-hover:-translate-x-0.5 dark:bg-gold/15 dark:text-gold',
                          )}
                        >
                          <ArrowLeft className='size-4' />
                        </span>
                      </div>
                    </GlassPanel>
                  </Link>
                </Reveal>
              );
            })}
      </div>

      <Reveal delayMs={100} className='mt-8 flex justify-center'>
        <Button
          asChild
          size='lg'
          className='rounded-2xl bg-gold px-6 font-semibold text-navy hover:bg-gold/90'
        >
          <Link href='/shops'>
            همه فروشگاه‌ها
            <ArrowLeft className='size-4' />
          </Link>
        </Button>
      </Reveal>
    </section>
  );
}
