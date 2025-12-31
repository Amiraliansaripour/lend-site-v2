import { NuqsAdapter } from 'nuqs/adapters/react';

// * types
type NuqsProviderProps = { children: React.ReactNode };

export function NuqsProvider({ children }: NuqsProviderProps) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
