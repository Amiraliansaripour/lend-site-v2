import { z } from 'zod';

export type RuntimeEnv = z.infer<typeof envSchema>;

const envSchema = z.looseObject({
  NEXT_PUBLIC_API_BASE_URL: z.url(),

  // * react query
  NEXT_PUBLIC_QUERY_GC_TIME: z.coerce.number().default(0),
  NEXT_PUBLIC_QUERY_STALE_TIME: z.coerce.number().default(0),
  NEXT_PUBLIC_QUERY_RETRY: z.union([z.boolean(), z.coerce.number()]).default(false),
});

const validateEnv = () => {
  const { error } = envSchema.safeParse(process.env);

  const isServer = typeof window === 'undefined';
  if (error && isServer) throw new Error(z.prettifyError(error));
};

validateEnv();