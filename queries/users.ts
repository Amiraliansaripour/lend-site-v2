// * @tanstack/react-query
import { queryOptions, useQuery } from '@tanstack/react-query';

// * api
import { getUser, getUserAndUpdateStore } from '@/api/users';
import { appStore } from '@/stores';

export const queryKeys = { users: ['users'] } as const;

export const getUserQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: [...queryKeys.users, id],
    queryFn: () => getUser(id),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: [...queryKeys.users, id],
    queryFn: () => getUser(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUserWithStore = (id: string) => {
  const setUser = appStore.useSetUser();

  return useQuery({
    queryKey: [...queryKeys.users, id, 'withStore'],
    queryFn: async () => {
      const userData = await getUserAndUpdateStore(id);
      if (userData) {
        setUser(userData);
      }
      return userData;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
