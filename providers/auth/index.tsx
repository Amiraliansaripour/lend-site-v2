import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// * casl
import * as Casl from '@casl/react';
import type { AnyAbility } from '@casl/ability';

import { usePathname } from '@/i18n/navigation';
import { abilities } from '@/providers/auth/abilities';

// * stores
import { appStore } from '@/stores';

import { getUserQueryOptions } from '@/queries';

// * types
type CanProps = Casl.BoundCanProps<AnyAbility>;

export const Can = ({ children, ...props }: CanProps) => {
  const ability = appStore.useAbility();

  return (
    <Casl.Can ability={ability} {...props}>
      {children}
    </Casl.Can>
  );
};

export function AuthProvider() {
  const pathname = usePathname();

  const {
    data: maybeUser,
    isError,
    isLoading,
  } = useQuery({ ...getUserQueryOptions(true), enabled: pathname !== '/login' });

  const setUser = appStore.useSetUser();
  const setAbility = appStore.useSetAbility();

  useEffect(() => {
    if (!maybeUser || isError || isLoading) return;

    const ability = abilities['admin'];
    const user = maybeUser;

    setAbility(ability);
    setUser(user);
  }, [maybeUser, isError, isLoading]);

  return null;
}
