'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useUpdateSalaryInfo } from '@/mutations/request';

interface SalaryInfoProps {
  requestId?: string;
  onNext?: (data: SalaryInfoFormData) => void;
  onCancel?: () => void;
  initialData?: SalaryInfoFormData;
}

interface SalaryInfoFormData {
  income: string;
  installment: string;
}

export function SalaryInfo({ requestId, onNext, onCancel, initialData }: SalaryInfoProps) {
  const updateSalaryInfoMutation = useUpdateSalaryInfo();

  const [formData, setFormData] = useState<SalaryInfoFormData>({
    income: initialData?.income || '',
    installment: initialData?.installment || '',
  });

  const formatNumber = (value: string): string => {
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/,/g, '');
    const formattedValue = formatNumber(value);

    setFormData(prev => ({
      ...prev,
      [name]: numericValue,
    }));

    e.target.value = formattedValue;
  };

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.income) {
      toast.error('لطفا میانگین درآمد ماهیانه را وارد کنید');
      return;
    }

    if (!formData.installment) {
      toast.error('لطفا میزان اقساط ماهیانه را وارد کنید');
      return;
    }

    // If requestId is provided, save to API
    if (requestId) {
      updateSalaryInfoMutation.mutate(
        {
          requestId,
          income: parseFloat(formData.income),
          installment: parseFloat(formData.installment),
        },
        {
          onSuccess: () => {
            toast.success('اطلاعات با موفقیت ثبت شد');
            if (onNext) {
              onNext(formData);
            }
          },
          onError: () => {
            toast.error('خطا در ثبت اطلاعات');
          },
        },
      );
    } else {
      if (onNext) {
        onNext(formData);
      }
      toast.success('اطلاعات با موفقیت ثبت شد');
    }
  };

  return (
    <form onSubmit={onFormSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات درآمدی</CardTitle>
          <CardDescription>
            لطفا اطلاعات زیر را تکمیل و صحت آن را تایید کنید. این اطلاعات در مراحل بعد با مدارک
            ارائه شده شما مطابقت داده خواهد شد
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='w-full'>
              <label htmlFor='income' className='block text-sm font-medium text-gray-700 mb-1'>
                میانگین درآمد ماهیانه (ریال) <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='income'
                name='income'
                defaultValue={formatNumber(formData.income)}
                onChange={handleInputChange}
                required
                placeholder='مثال: 200,000,000'
                className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary'
              />
            </div>

            <div className='w-full'>
              <label htmlFor='installment' className='block text-sm font-medium text-gray-700 mb-1'>
                میزان اقساط ماهیانه شما (ریال) <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='installment'
                name='installment'
                defaultValue={formatNumber(formData.installment)}
                onChange={handleInputChange}
                required
                placeholder='مثال: 50,000,000'
                className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary'
              />
            </div>
          </div>

          <div className='flex justify-center gap-4'>
            <Button type='submit' disabled={updateSalaryInfoMutation.isPending} size='lg'>
              {updateSalaryInfoMutation.isPending ? 'در حال ثبت...' : 'مرحله بعد'}
            </Button>
            {onCancel && (
              <Button type='button' variant='outline' size='lg' onClick={onCancel}>
                انصراف
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
