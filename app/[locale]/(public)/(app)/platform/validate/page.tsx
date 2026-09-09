'use client';

import { Suspense } from 'react';
import PlatformValidateClient from './platform-validate-client';

function Fallback() {
  return (
    <div className='flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4'>
      <div
        className='h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent'
        aria-hidden
      />
      <p className='text-muted-foreground text-center text-sm'>در حال احراز هویت...</p>
    </div>
  );
}

export default function PlatformValidateRoute() {
  return (
    <Suspense fallback={<Fallback />}>
      <PlatformValidateClient />
    </Suspense>
  );
}
