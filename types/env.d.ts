<<<<<<< HEAD
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_BASE_URL?: string;
      NEXT_PUBLIC_QUERY_GC_TIME?: string;
      NEXT_PUBLIC_QUERY_STALE_TIME?: string;
      NEXT_PUBLIC_QUERY_RETRY?: string;
    }
=======
import type { RuntimeEnv } from '@/lib/env';

// type RuntimeEnv = Record<Env, string>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends RuntimeEnv {}
>>>>>>> a47b58a (pwa)
  }
}

export {};
