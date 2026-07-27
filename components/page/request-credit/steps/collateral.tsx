'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { ChequeRegistration } from './cheque-registration';

interface CollateralProps {
  requestId: string;
  guarantees?: string[];
  guaranteedAmount?: number;
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  isEditMode?: boolean;
  isReadOnly?: boolean;
}

export function Collateral({
  requestId,
  guarantees = [],
  guaranteedAmount,
  onNext,
  onBack,
  onCancel,
  isEditMode = false,
  isReadOnly = false,
}: CollateralProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleMethodSelect = (method: string) => {
    if (isReadOnly) return;
    setSelectedMethod(method);
  };

  if (selectedMethod === 'check') {
    return (
      <ChequeRegistration
        requestId={requestId}
        guarantees={guarantees}
        guaranteedAmount={guaranteedAmount}
        onNext={onNext ? () => onNext() : undefined}
        onBack={() => setSelectedMethod(null)}
        onCancel={onCancel}
        isEditMode={isEditMode}
        isReadOnly={isReadOnly}
      />
    );
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>انتخاب روش وثیقه‌گذاری</CardTitle>
          <CardDescription>
            <div className='mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <p className='font-semibold text-center'>
                توجه: زمان بررسی درخواست از ساعت ۸ صبح تا ۴ بعدازظهر می‌باشد.
              </p>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            <div className='flex flex-col md:flex-row justify-center items-center gap-6'>
              <button
                onClick={() => handleMethodSelect('check')}
                type='button'
                className='flex flex-col items-center justify-center p-8 border-2 border-transparent hover:border-primary transition-all rounded-lg shadow-md w-full md:w-1/2 bg-gradient-to-br from-green-50 to-green-100 text-center cursor-pointer group'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3h7.5m-7.5-6h7.5m-3 6l3-3m0 0l3 3m-6-9h.008v.008H12v-.008ZM12 15h.008v.008H12v-.008Z'
                  />
                </svg>
                <span className='text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors'>
                  بارگذاری وثیقه
                </span>

                {guarantees.length > 0 && (
                  <div className='text-sm text-gray-600 mb-2'>
                    <p>وثیقه های مورد نیاز</p>
                    {guarantees.map((item, index) => (
                      <span key={item}>
                        {item}
                        {index !== guarantees.length - 1 && <span className='px-1'> و </span>}
                      </span>
                    ))}
                  </div>
                )}

                <div className='flex items-center text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity'>
                  <CheckCircle2 className='w-4 h-4 mr-1' />
                  <span>برای انتخاب کلیک کنید</span>
                </div>
              </button>
            </div>

            {(onBack || onCancel) && (
              <div className='flex justify-center gap-4 pt-6'>
                {onBack && (
                  <Button type='button' variant='outline' size='lg' onClick={onBack}>
                    بازگشت
                  </Button>
                )}
                {onCancel && (
                  <Button type='button' variant='outline' size='lg' onClick={onCancel}>
                    انصراف
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
