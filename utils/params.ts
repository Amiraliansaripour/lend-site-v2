import { format } from 'date-fns';

// * types
import type { Params } from '@/types/api';

export const filterParams = (
  params: Record<string, unknown>,
  predicate: (value: unknown, key: string) => boolean,
) => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (predicate(value, key)) acc[key] = `${value}`;
    return acc;
  }, {} as Params);
};

export const normalizeDateRangeParams = (dateRange: Date[] | null) => {
  if (!dateRange || dateRange.filter(Boolean).length === 0) return null;
  const [start, end = new Date()] = dateRange;

  return [start, end].map(date => format(date, 'yyyy-MM-dd')).sort();
};
