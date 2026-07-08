import { z } from 'zod';

<<<<<<< HEAD
const booleanFromEnvString = (value: unknown) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

const envSchema = z.object({
=======
export type RuntimeEnv = z.infer<typeof envSchema>;

const envSchema = z.looseObject({
>>>>>>> a47b58a (pwa)
  NEXT_PUBLIC_API_BASE_URL: z.url(),

  // * react query
  NEXT_PUBLIC_QUERY_GC_TIME: z.coerce.number().default(0),
  NEXT_PUBLIC_QUERY_STALE_TIME: z.coerce.number().default(0),
<<<<<<< HEAD
  NEXT_PUBLIC_QUERY_RETRY: z.preprocess(
    booleanFromEnvString,
    z.union([z.boolean(), z.coerce.number()]).default(false),
  ),
});

export type RuntimeEnv = z.infer<typeof envSchema>;

type RawEnv = {
  [K in keyof RuntimeEnv]: string | undefined;
};

// Next.js only inlines NEXT_PUBLIC_* when each var is accessed statically.
// Passing `process.env` as a whole object prevents client-side inlining.
const runtimeEnv: RawEnv = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_QUERY_GC_TIME: process.env.NEXT_PUBLIC_QUERY_GC_TIME,
  NEXT_PUBLIC_QUERY_STALE_TIME: process.env.NEXT_PUBLIC_QUERY_STALE_TIME,
  NEXT_PUBLIC_QUERY_RETRY: process.env.NEXT_PUBLIC_QUERY_RETRY,
};

const parseEnv = () => {
  const result = envSchema.safeParse(runtimeEnv);

  if (!result.success) {
    throw new Error(z.prettifyError(result.error));
  }

  return result.data;
};

export const env = parseEnv();
=======
  NEXT_PUBLIC_QUERY_RETRY: z.union([z.boolean(), z.coerce.number()]).default(false),
});

const validateEnv = () => {
  const { error } = envSchema.safeParse(process.env);

  const isServer = typeof window === 'undefined';
  if (error && isServer) throw new Error(z.prettifyError(error));
};

validateEnv();
>>>>>>> a47b58a (pwa)
