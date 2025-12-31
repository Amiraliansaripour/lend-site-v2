import type { RuntimeEnv } from '@/lib/env';

// type RuntimeEnv = Record<Env, string>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends RuntimeEnv {}
  }
}

export {};
