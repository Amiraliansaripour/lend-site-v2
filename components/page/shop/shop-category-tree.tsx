'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ProductCategory } from './shop-types';
import {
  filterActiveCategories,
  findCategoryPathIds,
  getCategoryChildren,
} from './category-tree-utils';

type ShopCategoryTreeProps = {
  categories: ProductCategory[];
  selectedId: string | null;
  onSelect: (categoryId: string) => void;
  isLoading?: boolean;
  className?: string;
};

type CategoryNodeProps = {
  category: ProductCategory;
  depth: number;
  selectedId: string | null;
  expandedIds: Set<string>;
  onToggle: (categoryId: string) => void;
  onSelect: (categoryId: string) => void;
};

function CategoryNode({
  category,
  depth,
  selectedId,
  expandedIds,
  onToggle,
  onSelect,
}: CategoryNodeProps) {
  const children = getCategoryChildren(category).filter(c => c && c.isActive !== false);
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(category.id);
  const isSelected = selectedId === category.id;

  return (
    <li>
      <div
        className={cn(
          'flex items-center gap-1 rounded-md transition-colors',
          isSelected && 'bg-purple-50',
        )}
        style={{ paddingRight: `${depth * 12}px` }}
      >
        {hasChildren ? (
          <button
            type='button'
            onClick={() => onToggle(category.id)}
            className='shrink-0 p-1.5 hover:bg-gray-100 rounded-md'
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'بستن' : 'باز کردن'}
          >
            {isExpanded ? (
              <ChevronDown className='w-4 h-4 text-[#686868]' />
            ) : (
              <ChevronLeft className='w-4 h-4 text-[#686868]' />
            )}
          </button>
        ) : (
          <span className='w-7 shrink-0' />
        )}

        <button
          type='button'
          onClick={() => onSelect(category.id)}
          className={cn(
            'flex-1 text-right py-2 px-2 rounded-md text-sm transition-colors hover:bg-gray-50',
            isSelected && 'text-purple-primary font-medium',
          )}
        >
          {category.name}
        </button>
      </div>

      {hasChildren && isExpanded && (
        <ul className='flex flex-col'>
          {children.map(child => (
            <CategoryNode
              key={child.id}
              category={child}
              depth={depth + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function ShopCategoryTree({
  categories,
  selectedId,
  onSelect,
  isLoading,
  className,
}: ShopCategoryTreeProps) {
  const activeCategories = useMemo(() => filterActiveCategories(categories), [categories]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!selectedId || activeCategories.length === 0) return;

    const path = findCategoryPathIds(activeCategories, selectedId);
    if (!path || path.length <= 1) return;

    setExpandedIds(prev => {
      const next = new Set(prev);
      // Expand all ancestors (everything except the leaf itself)
      path.slice(0, -1).forEach(id => next.add(id));
      return next;
    });
  }, [selectedId, activeCategories]);

  const handleToggle = (categoryId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-3 p-2', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='h-8 bg-gray-100 rounded-md animate-pulse' />
        ))}
      </div>
    );
  }

  if (activeCategories.length === 0) {
    return (
      <div className={cn('text-sm text-gray-500 text-right py-4 px-2', className)}>
        دسته‌بندی‌ای یافت نشد
      </div>
    );
  }

  return (
    <ul className={cn('flex flex-col items-stretch', className)}>
      {activeCategories.map(category => (
        <CategoryNode
          key={category.id}
          category={category}
          depth={0}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onToggle={handleToggle}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
