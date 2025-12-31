import { useRef, useEffect } from 'react';

export function useIsInitialLoading(isLoading: boolean, initialValue: boolean = true) {
  const isInitialLoading = useRef<boolean>(initialValue);

  useEffect(() => {
    if (isLoading && isInitialLoading.current) isInitialLoading.current = false;
  }, [isLoading]);

  return isInitialLoading.current;
}
