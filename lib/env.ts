import { z } from 'zod';

const booleanFromEnvString = (value: unknown) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

export type RuntimeEnv = z.infer<typeof envSchema>;

const envSchema = z.looseObject({
  NEXT_PUBLIC_API_BASE_URL: z.url(),

  // * react query
  NEXT_PUBLIC_QUERY_GC_TIME: z.coerce.number().default(0),
  NEXT_PUBLIC_QUERY_STALE_TIME: z.coerce.number().default(0),
  NEXT_PUBLIC_QUERY_RETRY: z.preprocess(
    booleanFromEnvString,
    z.union([z.boolean(), z.coerce.number()]).default(false),
  ),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  const isServer = typeof window === 'undefined';

  if (!result.success && isServer) {
    throw new Error(z.prettifyError(result.error));
  }

  return result.success ? result.data : envSchema.parse({});
};

export const env = parseEnv();
