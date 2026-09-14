declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_BASE_URL?: string;
      NEXT_PUBLIC_API_REPORT_URL?: string;
      NEXT_PUBLIC_QUERY_GC_TIME?: string;
      NEXT_PUBLIC_QUERY_STALE_TIME?: string;
      NEXT_PUBLIC_QUERY_RETRY?: string;
      /** RSA private key PEM for tcclub SSO (RS256). Never expose to the client. */
      CLUB_SSO_PRIVATE_KEY?: string;
      /** Optional key id when rotating club SSO keys */
      CLUB_SSO_KID?: string;
    }
  }
}

export {};
