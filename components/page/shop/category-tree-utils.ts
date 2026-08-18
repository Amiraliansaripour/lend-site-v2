import type { ProductCategory } from './shop-types';

export const getCategoryChildren = (category: ProductCategory): ProductCategory[] => {
  return Array.isArray(category.children) ? category.children : [];
};

export const filterActiveCategories = (categories: ProductCategory[]): ProductCategory[] => {
  return categories
    .filter(cat => cat && cat.isActive !== false)
    .map(cat => ({
      ...cat,
      children: filterActiveCategories(getCategoryChildren(cat)),
    }));
};

export const findCategoryPathIds = (
  categories: ProductCategory[],
  targetId: string,
  path: string[] = [],
): string[] | null => {
  for (const category of categories) {
    if (!category?.id) continue;
    const nextPath = [...path, category.id];
    if (category.id === targetId) return nextPath;

    const found = findCategoryPathIds(getCategoryChildren(category), targetId, nextPath);
    if (found) return found;
  }
  return null;
};

export const findFirstSelectableCategoryId = (categories: ProductCategory[]): string | null => {
  for (const category of categories) {
    if (!category?.id) continue;
    const children = getCategoryChildren(category).filter(c => c && c.isActive !== false);
    if (children.length === 0) return category.id;

    const nested = findFirstSelectableCategoryId(children);
    if (nested) return nested;
  }
  return categories[0]?.id ?? null;
};

export const categoryExistsInTree = (
  categories: ProductCategory[],
  categoryId: string,
): boolean => {
  return findCategoryPathIds(categories, categoryId) !== null;
};
