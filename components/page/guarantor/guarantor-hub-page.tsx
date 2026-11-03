'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OfferGuarantyPanel } from './offer-guaranty-panel';
import { IncomingGuarantyPanel } from './incoming-guaranty-panel';

/**
 * 1) اعلام ضمانت            → requested-user + accept (ضامن)
 * 2) درخواست‌های ضمانت من   → guarantor-user (معرفی ضامن) + request/approve/reject (وام‌گیرنده)
 */
export function GuarantorHubPage() {
  const [tab, setTab] = useState('offer');

  return (
    <Tabs dir='rtl' value={tab} onValueChange={setTab} className='w-full'>
      <TabsList className='grid w-full grid-cols-2 h-auto gap-1'>
        <TabsTrigger value='offer' className='whitespace-normal py-2 text-center'>
          اعلام ضمانت
        </TabsTrigger>
        <TabsTrigger value='incoming' className='whitespace-normal py-2 text-center'>
          درخواست‌های ضمانت من
        </TabsTrigger>
      </TabsList>

      <TabsContent value='offer' className='mt-6'>
        <OfferGuarantyPanel onAccepted={() => setTab('incoming')} />
      </TabsContent>

      <TabsContent value='incoming' className='mt-6'>
        <IncomingGuarantyPanel />
      </TabsContent>
    </Tabs>
  );
}
