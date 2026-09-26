'use client';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export function WalletActivitySummary() {
  return (
    <div className='flex flex-col items-center justify-center gap-y-5'>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src='/images/folderIcon.png' alt='' />
      <p className='text-center text-sm font-medium'>
        «اولین قدم رو بردار! همین حالا درخواست وام خودت رو ثبت کن و مسیرت رو شروع کن.»
      </p>
      <Link href='/requests'>
        <Button>دریافت اعتبار</Button>
      </Link>
    </div>
  );
}
