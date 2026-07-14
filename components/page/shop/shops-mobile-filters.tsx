'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ShopType } from './shop-types';

type ShopsMobileFiltersProps = {
  className?: string;
};

export function ShopsMobileFilters({ className }: ShopsMobileFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const selectedType = (searchParams.get('type') as ShopType) || '2';

  const onlineEnabled = selectedType === '0' || selectedType === '2';
  const physicalEnabled = selectedType === '1' || selectedType === '2';

  const updateURL = useCallback(
    (updates: { type?: ShopType }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.type !== undefined) {
        if (updates.type === '2') {
          params.delete('type');
        } else {
          params.set('type', updates.type);
        }
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

  return (
    <div className={cn('flex gap-4 mb-6', className)}>
      <button
        onClick={() => setIsTypeOpen(true)}
        className='flex-1 bg-white rounded-lg shadow-md py-3 px-4 text-center'
      >
        <span className='text-sm font-medium'>نوع فروشگاه</span>
      </button>

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
