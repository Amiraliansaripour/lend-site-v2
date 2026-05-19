'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { SHOP_CATEGORIES, type ShopType } from './shop-types';

type ShopsFiltersProps = {
  className?: string;
};

export function ShopsFilters({ className }: ShopsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(true);
  const [typeIsOpen, setTypeIsOpen] = useState(true);

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
        updates.categories.forEach(cat => params.append('category', cat));
      }

      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false });
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

  const toggleCategory = (id: string) => {
    const newCategories = selectedCategories.includes(id)
      ? selectedCategories.filter(cat => cat !== id)
      : [...selectedCategories, id];
    updateURL({ categories: newCategories });
  };

  return (
    <aside className={cn('w-full max-w-[325px] mb-20', className)}>
      <div className='rounded-2xl border border-[#BEBEBE] bg-transparent p-6'>
        <div className='pb-4 min-h-[500px]'>
          <button
            type='button'
            onClick={() => setIsOpen(v => !v)}
            aria-expanded={isOpen}
            className='w-full flex items-center justify-between text-right text-zinc-800 text-base font-normal mb-2 border-b border-[#A9A9A9] pb-1.5 px-0'
          >
            <div className='flex items-center gap-2'>
              <span className='leading-none'>دسته بندی</span>
              {selectedCategories.length > 0 && (
                <div className='bg-light-blue text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center'>
                  {selectedCategories.length}
                </div>
              )}
            </div>
            <ChevronDown
              className={cn(
                'inline-block transition-transform duration-150 text-[#686868]',
                isOpen && 'rotate-180',
              )}
              aria-hidden='true'
            />
          </button>

          {isOpen && (
            <div className='bg-white rounded-lg shadow-[0px_1px_10px_0px_rgba(117,117,117,0.25)] overflow-y-auto mb-7 pr-5 py-4 pl-4'>
              <ul className='flex flex-col items-stretch'>
                {SHOP_CATEGORIES.map(cat => {
                  const isActive = selectedCategories.includes(cat.id);
                  return (
                    <li key={cat.id}>
                      <button
                        type='button'
                        onClick={() => toggleCategory(cat.id)}
                        disabled={isPending}
                        className={cn(
                          'text-sm w-full text-right py-2.5 px-2 rounded-md transition-colors hover:bg-gray-50',
                          isActive && 'bg-purple-50 text-purple-primary font-medium',
                        )}
                      >
                        {cat.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

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
      </div>
    </aside>
  );
}
