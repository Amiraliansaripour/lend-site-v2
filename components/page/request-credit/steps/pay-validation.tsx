'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle, CreditCard } from 'lucide-react';
import type { User } from '@/types/auth';
import { useGetPaymentToken } from '@/mutations/request';

interface PayValidationProps {
  requestId: string;
  user?: User | null;
  validationPrice?: number;
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  isEditMode?: boolean;
  isReadOnly?: boolean;
}

const explanations = [
  'این هزینه برای استعلام وضعیت اعتباری شما از مراجع ذی‌صلاح دریافت می‌شود.',
  'نتیجه استعلام به صورت محرمانه فقط در اختیار شما قرار می‌گیرد.',
  'پرداخت این هزینه به منزله تضمین دریافت اعتبار نیست و صرفا برای بررسی اولیه است.',
  'مبلغ پرداختی بابت استعلام به هیچ عنوان قابل استرداد نمی‌باشد.',
];

export function PayValidation({
  requestId,
  user,
  validationPrice = 0,
  onNext,
  onBack,
  onCancel,
  isEditMode,
  isReadOnly = false,
}: PayValidationProps) {
  const getPaymentTokenMutation = useGetPaymentToken();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const formatPrice = (price: number): string => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const navigateUserToPayment = (token: string, terminalID: string, merchantId: string) => {
    // Persist so /CallBack can return the user to this request after gateway redirect.
    if (requestId) {
      localStorage.setItem('requestId', requestId);
      localStorage.setItem('pendingPayType', '2');
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://rt.sizpay.ir/Route/Payment';
    // form.action = `https://panel.aqayepardakht.ir/startpay/${token}`;
    form.target = '_self';

    const fields = [
      { name: 'MerchantID', value: merchantId },
      { name: 'TerminalID', value: terminalID },
      { name: 'Token', value: token },
    ];

    fields.forEach(({ name, value }) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const handleGeneralPayment = async () => {
    if (!user?.id) {
      toast.error('اطلاعات کاربر برای انجام پرداخت ناقص است.');
      return;
    }

    setIsPaymentLoading(true);

    getPaymentTokenMutation.mutate(
      {
        requestId: requestId,
        payType: 2,
      },
      {
        onSuccess: result => {
          if (result.isSuccess && result.data) {
            const { token, terminalID, merchantId } = result.data;
            navigateUserToPayment(token, terminalID, merchantId);
          } else {
            const message = result.message || 'پاسخ معتبر از سرور پرداخت دریافت نشد.';
            toast.error(message);
            setIsPaymentLoading(false);
          }
        },
        onError: (error: Error) => {
          console.error('Payment initiation failed:', error);
          toast.error('خطا در شروع فرآیند پرداخت.');
          setIsPaymentLoading(false);
        },
      },
    );
  };

  const isPaymentButtonDisabled = isPaymentLoading || !user?.id || isReadOnly;

  return (
    <div className='w-full space-y-0'>
      <Card className='border-r-4 border-green-400 rounded-b-none'>
        <CardHeader className='bg-green-50'>
          <CardTitle>پیش فاکتور</CardTitle>
        </CardHeader>
        <CardContent className='bg-green-50 space-y-4 pb-4'>
          <div className='flex justify-between items-center text-gray-700'>
            <span className='text-sm'>اعتبار سنجی:</span>
            <span className='text-sm font-bold'>{formatPrice(validationPrice)} ریال</span>
          </div>
        </CardContent>
      </Card>

      <Card className='border-r-4 border-green-400 rounded-none border-t-0'>
        <CardContent className='bg-green-50 pt-6'>
          <h3 className='text-lg font-semibold text-green-800 mb-3 text-right'>
            چرا این هزینه را پرداخت می‌کنید؟
          </h3>
          <ul className='space-y-3'>
            {explanations.map((explanation, index) => (
              <li key={index} className='flex items-start text-gray-700 text-sm text-right'>
                <CheckCircle className='h-5 w-5 text-green-600 ml-2 flex-shrink-0 mt-0.5' />
                <span className='leading-6'>{explanation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className='border-r-4 border-green-400 rounded-t-none border-t-0'>
        <CardContent className='pt-6 space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 text-right'>
              شماره موبایل
            </label>
            <input
              dir='ltr'
              type='text'
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-gray-400 sm:text-sm text-right bg-gray-50'
              value={user?.personInfo?.phoneNumber || ''}
              disabled
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 text-right'>
              کد ملی
            </label>
            <input
              type='text'
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-gray-400 sm:text-sm text-right bg-gray-50'
              value={user?.nationalCode || ''}
              disabled
            />
          </div>

          <div className='mt-6 mb-6 text-center text-gray-700 p-4 bg-green-50 rounded-lg'>
            <span className='text-base text-black'>مبلغ اعتبار سنجی: </span>
            <div className='mt-2'>
              <span className='text-3xl font-bold text-green-600 ml-1'>
                {formatPrice(validationPrice)}
              </span>
              <span className='text-base text-black'>ریال</span>
            </div>
          </div>

          <div className='flex gap-4 justify-center pt-4'>
            <Button
              type='button'
              onClick={handleGeneralPayment}
              disabled={isPaymentButtonDisabled}
              size='lg'
              className='bg-green-500 hover:bg-green-600'
            >
              {isPaymentLoading ? (
                <div className='animate-spin w-5 h-5 border-t-2 border-white rounded-full' />
              ) : (
                <>
                  <CreditCard className='h-5 w-5 ml-2' />
                  پرداخت هزینه اعتبارسنجی
                </>
              )}
            </Button>

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

          {isEditMode && onNext && (
            <div className='text-center mt-4'>
              <Button type='button' variant='ghost' onClick={onNext}>
                رد کردن این مرحله
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
