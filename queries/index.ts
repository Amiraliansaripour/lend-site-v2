import { queryOptions } from '@tanstack/react-query';

// import { getUsers } from '@/api/users';

export const queryKeys = {
  users: {
    list: ['list'],
  },
} as const;

// export const getUsersQueryOptions = () => {
//   return queryOptions({
//     queryKey: queryKeys.users.list,
//     queryFn: getUsers,
//   });
// };

export * from './wallet';
export * from './installments';
export * from './request';
export * from './users';
