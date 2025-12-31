'use client';

import { useEffect } from 'react';

import { useRouter } from '@/i18n/navigation';
import { AUTH_LOGOUT_EVENT } from '@/lib/auth/events';

export function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = () => {
      router.push('/login');
    };

    window.addEventListener(AUTH_LOGOUT_EVENT.type, handleLogout);

    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT.type, handleLogout);
    };
  }, []);

  return null;
}
