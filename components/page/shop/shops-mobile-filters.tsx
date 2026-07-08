<<<<<<< HEAD
'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SHOP_CATEGORIES, type ShopType } from './shop-types';

type ShopsMobileFiltersProps = {
  className?: string;
};

export function ShopsMobileFilters({ className }: ShopsMobileFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

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
    <div className={cn('flex gap-4 mb-6', className)}>
      {/* Category Filter Button */}
      <button
        onClick={() => setIsCategoryOpen(true)}
        className='flex-1 bg-white rounded-lg shadow-md py-3 px-4 text-center relative'
      >
        <span className='text-sm font-medium'>دسته بندی</span>
        {selectedCategories.length > 0 && (
          <div className='absolute -top-2 -right-2 bg-light-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
            {selectedCategories.length}
          </div>
        )}
      </button>

      {/* Type Filter Button */}
      <button
        onClick={() => setIsTypeOpen(true)}
        className='flex-1 bg-white rounded-lg shadow-md py-3 px-4 text-center'
      >
        <span className='text-sm font-medium'>نوع فروشگاه</span>
      </button>

      {/* Category Modal */}
      {isCategoryOpen && (
        <div className='fixed inset-0 z-50 flex items-end'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setIsCategoryOpen(false)} />
          <div className='relative w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>دسته بندی</h3>
              <button
                onClick={() => setIsCategoryOpen(false)}
                className='p-1 hover:bg-gray-100 rounded-full'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
            <ul className='flex flex-col items-stretch gap-2'>
              {SHOP_CATEGORIES.map(cat => {
                const isActive = selectedCategories.includes(cat.id);
                return (
                  <li key={cat.id}>
                    <button
                      type='button'
                      onClick={() => toggleCategory(cat.id)}
                      disabled={isPending}
                      className={cn(
                        'text-sm w-full text-right py-3 px-4 rounded-lg transition-colors hover:bg-gray-50',
                        isActive && 'bg-purple-50 text-purple-primary font-medium',
                      )}
                    >
                      {cat.name}
                    </button>
                  </li>
                );
              })}
            </ul>
            <Button
              onClick={() => setIsCategoryOpen(false)}
              className='w-full mt-6'
              disabled={isPending}
            >
              اعمال فیلتر
            </Button>
          </div>
        </div>
      )}

      {/* Type Modal */}
      {isTypeOpen && (
        <div className='fixed inset-0 z-50 flex items-end'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setIsTypeOpen(false)} />
          <div className='relative w-full bg-white rounded-t-3xl p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>نوع فروشگاه</h3>
              <button
                onClick={() => setIsTypeOpen(false)}
                className='p-1 hover:bg-gray-100 rounded-full'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
            <div className='flex flex-col gap-3'>
              <label className='flex items-center justify-between cursor-pointer py-3 px-4 hover:bg-gray-50 rounded-lg'>
                <span className='text-sm'>آنلاین</span>
                <input
                  type='checkbox'
                  checked={onlineEnabled}
                  onChange={e => handleTypeChange(e.target.checked, physicalEnabled)}
                  disabled={isPending}
                  className='w-4 h-4'
                />
              </label>
              <label className='flex items-center justify-between cursor-pointer py-3 px-4 hover:bg-gray-50 rounded-lg'>
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
            <Button
              onClick={() => setIsTypeOpen(false)}
              className='w-full mt-6'
              disabled={isPending}
            >
              اعمال فیلتر
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
=======
'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SHOP_CATEGORIES, type ShopType } from './shop-types';

type ShopsMobileFiltersProps = {
  className?: string;
};

export function ShopsMobileFilters({ className }: ShopsMobileFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

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
    <div className={cn('flex gap-4 mb-6', className)}>
      {/* Category Filter Button */}
      <button
        onClick={() => setIsCategoryOpen(true)}
        className='flex-1 bg-white rounded-lg shadow-md py-3 px-4 text-center relative'
      >
        <span className='text-sm font-medium'>دسته بندی</span>
        {selectedCategories.length > 0 && (
          <div className='absolute -top-2 -right-2 bg-light-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
            {selectedCategories.length}
          </div>
        )}
      </button>

      {/* Type Filter Button */}
      <button
        onClick={() => setIsTypeOpen(true)}
        className='flex-1 bg-white rounded-lg shadow-md py-3 px-4 text-center'
      >
        <span className='text-sm font-medium'>نوع فروشگاه</span>
      </button>

      {/* Category Modal */}
      {isCategoryOpen && (
        <div className='fixed inset-0 z-50 flex items-end'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setIsCategoryOpen(false)} />
          <div className='relative w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>دسته بندی</h3>
              <button
                onClick={() => setIsCategoryOpen(false)}
                className='p-1 hover:bg-gray-100 rounded-full'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
            <ul className='flex flex-col items-stretch gap-2'>
              {SHOP_CATEGORIES.map(cat => {
                const isActive = selectedCategories.includes(cat.id);
                return (
                  <li key={cat.id}>
                    <button
                      type='button'
                      onClick={() => toggleCategory(cat.id)}
                      disabled={isPending}
                      className={cn(
                        'text-sm w-full text-right py-3 px-4 rounded-lg transition-colors hover:bg-gray-50',
                        isActive && 'bg-purple-50 text-purple-primary font-medium',
                      )}
                    >
                      {cat.name}
                    </button>
                  </li>
                );
              })}
            </ul>
            <Button
              onClick={() => setIsCategoryOpen(false)}
              className='w-full mt-6'
              disabled={isPending}
            >
              اعمال فیلتر
            </Button>
          </div>
        </div>
      )}

      {/* Type Modal */}
      {isTypeOpen && (
        <div className='fixed inset-0 z-50 flex items-end'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setIsTypeOpen(false)} />
          <div className='relative w-full bg-white rounded-t-3xl p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>نوع فروشگاه</h3>
              <button
                onClick={() => setIsTypeOpen(false)}
                className='p-1 hover:bg-gray-100 rounded-full'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
            <div className='flex flex-col gap-3'>
              <label className='flex items-center justify-between cursor-pointer py-3 px-4 hover:bg-gray-50 rounded-lg'>
                <span className='text-sm'>آنلاین</span>
                <input
                  type='checkbox'
                  checked={onlineEnabled}
                  onChange={e => handleTypeChange(e.target.checked, physicalEnabled)}
                  disabled={isPending}
                  className='w-4 h-4'
                />
              </label>
              <label className='flex items-center justify-between cursor-pointer py-3 px-4 hover:bg-gray-50 rounded-lg'>
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
            <Button
              onClick={() => setIsTypeOpen(false)}
              className='w-full mt-6'
              disabled={isPending}
            >
              اعمال فیلتر
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
>>>>>>> a47b58a (pwa)
