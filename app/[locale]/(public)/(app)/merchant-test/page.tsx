'use client';

import { useEffect, useState } from 'react';
import { MerchantLogin } from '@/components/page/payment/merchant-login';
import { MerchantCreateOrder } from '@/components/page/payment/merchant-create-order';

export default function MerchantTestPage() {
  const [merchantToken, setMerchantToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('merchantToken');
    if (stored) setMerchantToken(stored);
  }, []);

  return (
    <div className='flex min-h-[70vh] items-center justify-center p-6'>
      {merchantToken ? (
        <MerchantCreateOrder
          merchantToken={merchantToken}
          onLogout={() => setMerchantToken(null)}
        />
      ) : (
        <MerchantLogin onSuccess={token => setMerchantToken(token)} />
      )}
    </div>
  );
}
