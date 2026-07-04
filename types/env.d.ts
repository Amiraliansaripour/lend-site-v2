declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_BASE_URL?: string;
      NEXT_PUBLIC_QUERY_GC_TIME?: string;
      NEXT_PUBLIC_QUERY_STALE_TIME?: string;
      NEXT_PUBLIC_QUERY_RETRY?: string;
    }
  }
}

export {};
