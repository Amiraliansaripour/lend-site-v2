import { z } from 'zod';

const booleanFromEnvString = (value: unknown) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url(),

  // * react query
  NEXT_PUBLIC_QUERY_GC_TIME: z.coerce.number().default(0),
  NEXT_PUBLIC_QUERY_STALE_TIME: z.coerce.number().default(0),
  NEXT_PUBLIC_QUERY_RETRY: z.preprocess(
    booleanFromEnvString,
    z.union([z.boolean(), z.coerce.number()]).default(false),
  ),
});

export type RuntimeEnv = z.infer<typeof envSchema>;

// Next.js only inlines NEXT_PUBLIC_* when each var is accessed statically.
// Passing `process.env` as a whole object prevents client-side inlining.
const runtimeEnv = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_QUERY_GC_TIME: process.env.NEXT_PUBLIC_QUERY_GC_TIME,
  NEXT_PUBLIC_QUERY_STALE_TIME: process.env.NEXT_PUBLIC_QUERY_STALE_TIME,
  NEXT_PUBLIC_QUERY_RETRY: process.env.NEXT_PUBLIC_QUERY_RETRY,
} satisfies Record<keyof RuntimeEnv, string | undefined>;

const parseEnv = () => {
  const result = envSchema.safeParse(runtimeEnv);

  if (!result.success) {
    throw new Error(z.prettifyError(result.error));
  }

  return result.data;
};

export const env = parseEnv();
