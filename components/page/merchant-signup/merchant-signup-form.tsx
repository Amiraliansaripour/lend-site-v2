'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import type { MerchantSignupFormData } from './merchant-signup-types';
import { useCreateMerchantSignup } from '@/mutations/merchant';

export function MerchantSignupForm() {
  const [formData, setFormData] = useState<MerchantSignupFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    url: '',
    category: 0,
    cityName: '',
    organName: '',
    description: '',
  });

  const createMerchantSignup = useCreateMerchantSignup();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'category' ? Number(value) : value,
    }));
  };

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      isActive: true,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      email: formData.email || '',
      url: formData.url || '',
      category: formData.category,
      status: 0,
      description: formData.description || '',
      cityName: formData.cityName || '',
      organName: formData.organName,
    };

    createMerchantSignup.mutate(payload, {
      onSuccess: response => {
        if (!response) {
          toast.error('پاسخی از سرور دریافت نشد.');
          return;
        }

        if (response.isSuccess) {
          toast.success(response.message || 'درخواست شما با موفقیت ثبت شد.');
          setFormData({
            firstName: '',
            lastName: '',
            phoneNumber: '',
            email: '',
            url: '',
            category: 0,
            cityName: '',
            organName: '',
            description: '',
          });
        } else {
          toast.error(response.message || 'مشکلی در ارسال درخواست پیش آمد.');
        }
      },
      onError: error => {
        console.error(error);
        toast.error(error.message || 'ارسال درخواست با خطا مواجه شد.');
      },
    });
  };

  const formFields = [
    { label: 'نام فروشگاه', name: 'organName', type: 'text', required: true },
    { label: 'نام', name: 'firstName', type: 'text', required: true },
    { label: 'نام خانوادگی', name: 'lastName', type: 'text', required: true },
    { label: 'دسته بندی فروشگاه', name: 'category', type: 'select', required: true },
    { label: 'آدرس اینترنتی', name: 'url', type: 'url', required: false },
    {
      label: 'شهر محل فعالیت (برای فروشگاه‌های حضوری)',
      name: 'cityName',
      type: 'text',
      required: false,
    },
    { label: 'شماره تماس', name: 'phoneNumber', type: 'tel', required: true },
    { label: 'آدرس ایمیل', name: 'email', type: 'email', required: false },
  ];

  return (
    <div
      id='merchant-signup-form'
      className='bg-boom-surface flex items-center flex-col pb-24 pt-8 md:pt-12'
    >
      <div className='text-2xl md:text-3xl font-bold py-10 text-center text-[#0f172a]'>
        فرم ثبت درخواست همکاری
      </div>

      <div className='bg-white rounded-3xl w-full sm:w-11/12 md:w-4/5 lg:w-3/4 max-w-5xl mx-auto px-4 sm:px-6 md:px-9 py-10 sm:py-14 boom-card-shadow border border-brand/10'>
        <form onSubmit={onFormSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {formFields.map(field => (
            <div key={field.name} className='w-full'>
              <label
                htmlFor={field.name}
                className='block text-sm font-medium text-[#334155] mb-1.5'
              >
                {field.label} {field.required && <span className='text-red-500'>*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={formData.category}
                  onChange={handleInputChange}
                  required={field.required}
                  className='mt-1 block w-full px-4 py-3 border border-[#e2e8f0] rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'
                >
                  <option value={0}>کالای بادوام</option>
                  <option value={1}>کالای مصرفی</option>
                  <option value={3}>سایر</option>
                </select>
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name as keyof MerchantSignupFormData] || ''}
                  onChange={handleInputChange}
                  required={field.required}
                  className='mt-1 block w-full px-4 py-3 border border-[#e2e8f0] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'
                />
              )}
            </div>
          ))}

          <div className='col-span-1 md:col-span-2 flex justify-start'>
            <button
              type='submit'
              disabled={createMerchantSignup.isPending}
              className={`bg-brand text-white w-full sm:w-56 h-14 flex items-center justify-center rounded-xl mt-5 cursor-pointer transition-opacity ${
                createMerchantSignup.isPending
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:opacity-90'
              }`}
            >
              {createMerchantSignup.isPending ? 'در حال ارسال...' : 'ثبت درخواست'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
