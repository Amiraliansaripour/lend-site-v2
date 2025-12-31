import { useQueryStates, type UseQueryStatesKeysMap, type UseQueryStatesOptions } from 'nuqs';

export function useQueryStatesValue<T extends UseQueryStatesKeysMap>(
  keyMap: T,
  options?: Partial<UseQueryStatesOptions<T>>,
) {
  const [queries] = useQueryStates(keyMap, options);
  return queries;
}
