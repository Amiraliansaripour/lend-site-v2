import { useQueryState, parseAsString, type UseQueryStateOptions } from 'nuqs';

export function useQueryStateValue(key: string): string | null;
export function useQueryStateValue<T>(key: string, options: UseQueryStateOptions<T>): T | null;

export function useQueryStateValue<T = string>(key: string, options?: UseQueryStateOptions<T>) {
  const [query] = useQueryState(key, options || (parseAsString as UseQueryStateOptions<T>));
  return query;
}
