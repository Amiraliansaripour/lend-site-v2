import type { JSX } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getUserQueryOptions } from '@/queries';

export function AuthLoader({
  children,
  renderLoading,
  renderUnauthenticated,
  renderError = (error: Error) => <>{JSON.stringify(error)}</>,
}: {
  children: React.ReactNode;
  renderLoading: () => JSX.Element;
  renderUnauthenticated?: () => JSX.Element;
  renderError?: (error: Error) => JSX.Element;
}) {
  const { isSuccess, isFetched, status, data, error } = useQuery(getUserQueryOptions(true));

  if (isSuccess) {
    if (renderUnauthenticated && !data) return renderUnauthenticated();
    return children;
  }

  if (!isFetched) return renderLoading();

  if (status === 'error') return renderError(error);

  return null;
}
