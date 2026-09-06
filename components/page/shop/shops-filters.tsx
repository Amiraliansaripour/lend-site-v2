'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { HomeCategory, ShopType } from './shop-types';

type ShopsFiltersProps = {
  className?: string;
  categories?: HomeCategory[];
  isCategoriesLoading?: boolean;
};

export function ShopsFilters({
  className,
  categories = [],
  isCategoriesLoading,
}: ShopsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [typeIsOpen, setTypeIsOpen] = useState(true);
  const [categoryIsOpen, setCategoryIsOpen] = useState(true);

  const selectedType = (searchParams.get('type') as ShopType) || '2';
  const selectedCategories = searchParams.getAll('category');

  const onlineEnabled = selectedType === '0' || selectedType === '2';
  const physicalEnabled = selectedType === '1' || selectedType === '2';

  const updateURL = useCallback(
    (updates: { type?: ShopType; categories?: string[] }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.type !== undefined) {
        if (updates.type === '2') {
          params.delete('type');
        } else {
          params.set('type', updates.type);
        }
      }

      if (updates.categories !== undefined) {
        params.delete('category');
        updates.categories.forEach(id => params.append('category', id));
      }

      params.delete('page');

      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router],
  );

  const handleTypeChange = (online: boolean, physical: boolean) => {
    let newType: ShopType;
    if (online && physical) {
      newType = '2';
    } else if (online) {
      newType = '0';
    } else if (physical) {
      newType = '1';
    } else {
      newType = '3';
    }
    updateURL({ type: newType });
  };

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    const next = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter(id => id !== categoryId);
    updateURL({ categories: next });
  };

  return (
    <aside className={cn('w-full max-w-[325px] mb-20', className)}>
      <div className='rounded-2xl border border-[#BEBEBE] bg-transparent p-6'>
        <div className='pb-4'>
          <button
            type='button'
            onClick={() => setTypeIsOpen(v => !v)}
            aria-expanded={typeIsOpen}
            className='w-full flex items-center justify-between text-right text-zinc-800 text-base font-normal mb-2 border-b border-[#A9A9A9] pb-1.5 px-0'
          >
            <span className='leading-none'>نوع فروشگاه</span>
            <ChevronDown
              className={cn(
                'inline-block transition-transform duration-150 text-[#686868]',
                typeIsOpen && 'rotate-180',
              )}
              aria-hidden='true'
            />
          </button>

          {typeIsOpen && (
            <div className='bg-white rounded-lg shadow-[0px_1px_10px_0px_rgba(117,117,117,0.25)] pr-5 py-4 pl-4'>
              <div className='flex flex-col gap-3'>
                <label className='flex items-center justify-between cursor-pointer'>
                  <span className='text-sm'>آنلاین</span>
                  <input
                    type='checkbox'
                    checked={onlineEnabled}
                    onChange={e => handleTypeChange(e.target.checked, physicalEnabled)}
                    disabled={isPending}
                    className='w-4 h-4'
                  />
                </label>
                <label className='flex items-center justify-between cursor-pointer'>
                  <span className='text-sm'>حضوری</span>
                  <input
                    type='checkbox'
                    checked={physicalEnabled}
                    onChange={e => handleTypeChange(onlineEnabled, e.target.checked)}
                    disabled={isPending}
                    className='w-4 h-4'
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className='pb-4'>
          <button
            type='button'
            onClick={() => setCategoryIsOpen(v => !v)}
            aria-expanded={categoryIsOpen}
            className='w-full flex items-center justify-between text-right text-zinc-800 text-base font-normal mb-2 border-b border-[#A9A9A9] pb-1.5 px-0'
          >
            <span className='leading-none'>دسته‌بندی</span>
            <ChevronDown
              className={cn(
                'inline-block transition-transform duration-150 text-[#686868]',
                categoryIsOpen && 'rotate-180',
              )}
              aria-hidden='true'
            />
          </button>

          {categoryIsOpen && (
            <div className='bg-white rounded-lg shadow-[0px_1px_10px_0px_rgba(117,117,117,0.25)] pr-5 py-4 pl-4'>
              {isCategoriesLoading ? (
                <p className='text-sm text-gray-400'>در حال بارگذاری...</p>
              ) : categories.length === 0 ? (
                <p className='text-sm text-gray-400'>دسته‌بندی‌ای یافت نشد</p>
              ) : (
                <div className='flex flex-col gap-3 max-h-72 overflow-y-auto'>
                  {categories.map(category => (
                    <label
                      key={category.id}
                      className='flex items-center justify-between cursor-pointer gap-3'
                    >
                      <span className='text-sm text-right'>{category.name}</span>
                      <input
                        type='checkbox'
                        checked={selectedCategories.includes(category.id)}
                        onChange={e => handleCategoryToggle(category.id, e.target.checked)}
                        disabled={isPending}
                        className='w-4 h-4 shrink-0'
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
