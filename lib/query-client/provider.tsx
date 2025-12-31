'use client';

import { QueryClientProvider as ReactQueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/lib/query-client';

// * types
type ReactQueryProviderProps = { children: React.ReactNode };

export const QueryClientProvider = ({ children }: ReactQueryProviderProps) => {
  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  );
};
