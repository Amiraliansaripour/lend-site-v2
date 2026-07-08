<<<<<<< HEAD
'use client';

import React, { useState } from 'react';

// * zod
import { z } from 'zod';

// * @tanstack/react-form
import { useStore } from '@tanstack/react-form';

// * sonner
import { toast } from 'sonner';

// * i18n
import { useRouter } from '@/i18n/navigation';

// * queries
import { useProvinces, useCitiesByProvince } from '@/queries/common';

// * mutations
import { useUpdateUserProfile } from '@/mutations/users';

// * components
import { useAppForm } from '@/components/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// * types
import { User } from '@/types/auth';

// Component props interface
interface CombinedUserFormProps {
  user: User | null;
}

// National code validator function
const validateNationalCode = (val: string) => {
  if (!/^\d{10}$/.test(val)) return false;
  const digits = val.split('').map(Number);
  const checkDigit = digits[9];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  const remainder = sum % 11;
  return remainder < 2 ? checkDigit === remainder : checkDigit === 11 - remainder;
};

// Zod validation schema
const CombinedFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'نام باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام نباید بیشتر از 50 کاراکتر باشد'),
  lastName: z
    .string()
    .min(2, 'نام خانوادگی باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام خانوادگی نباید بیشتر از 50 کاراکتر باشد'),
  fatherName: z
    .string()
    .min(2, 'نام پدر باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام پدر نباید بیشتر از 50 کاراکتر باشد'),
  birthDate: z.date().optional(),
  nationalCode: z
    .string()
    .regex(/^[0-9]{10}$/, 'کد ملی باید 10 رقم باشد')
    .refine(validateNationalCode, 'کد ملی نامعتبر است'),
  issuePlace: z.string().min(1, 'محل صدور الزامی است'),
  birthCertificateNumber: z.string().min(1, 'شماره شناسنامه الزامی است'),
  email: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      val => {
        if (!val || val === '') return true;
        return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(val);
      },
      { message: 'ایمیل نامعتبر است' },
    ),
  provinceId: z.string().min(1, 'انتخاب استان الزامی است'),
  cityId: z.string().min(1, 'انتخاب شهر الزامی است'),
  postalCode: z.string().regex(/^[0-9]{10}$/, 'کد پستی باید 10 رقم باشد'),
  jobTitle: z.string().optional().or(z.literal('')),
  telephone: z.string().optional().or(z.literal('')),
  address: z.string().min(10, 'آدرس باید حداقل 10 کاراکتر باشد'),
});

const CombinedUserForm: React.FC<CombinedUserFormProps> = ({ user }) => {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(
    user?.personInfo?.cityProvinceId || '',
  );
  const router = useRouter();

  const { data: provincesData } = useProvinces();
  const { data: citiesData } = useCitiesByProvince(selectedProvinceId);

  const provinces = provincesData?.data || [];
  const cities = citiesData?.data || [];
  const { mutate: updateProfile, isPending } = useUpdateUserProfile();
  const form = useAppForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      fatherName: user?.personInfo?.fatherName || '',
      birthDate: user?.personInfo?.birthDate ? new Date(user.personInfo.birthDate) : undefined,
      nationalCode: user?.nationalCode || '',
      issuePlace: user?.personInfo?.issuePlace || '',
      birthCertificateNumber: user?.personInfo?.birthCertificateNumber || '',
      email: user?.personInfo?.email || '',
      provinceId: user?.personInfo?.cityProvinceId || '',
      cityId: user?.personInfo?.cityId || '',
      postalCode: user?.personInfo?.postalCode || '',
      jobTitle: user?.personInfo?.jobTitle || '',
      telephone: user?.personInfo?.telephone || '',
      address: user?.personInfo?.address || '',
    },
    validators: {
      onSubmit: CombinedFormSchema,
    },
    onSubmit: async ({ value }) => {
      // Update selectedProvinceId for cities query
      setSelectedProvinceId(value.provinceId);

      const userInfo = localStorage.getItem('userInfo');
      const userId = userInfo ? JSON.parse(userInfo).id : '';

      const payload = {
        firstName: value.firstName,
        lastName: value.lastName,
        fatherName: value.fatherName,
        birthDate: value.birthDate ? value.birthDate.toISOString() : null,
        issuePlace: value.issuePlace,
        birthCertificateNumber: value.birthCertificateNumber,
        postalCode: value.postalCode,
        telephone: value.telephone,
        email: value.email,
        address: value.address,
        userId,
        nationalCode: value.nationalCode,
        cityId: value.cityId,
        jobTitle: value.jobTitle,
        provinceId: value.provinceId,
      };
      updateProfile(payload, {
        onSuccess: response => {
          if (!response.isSuccess) {
            toast.error(response.message || 'خطا در به‌روزرسانی اطلاعات');
            return;
          }

          toast.success('اطلاعات با موفقیت به‌روزرسانی شد');

          // Update localStorage with complete updated user info from server response
          const updatedUserInfo = response.data;

          // Add cityProvinceId to the personInfo if it exists
          if (updatedUserInfo.personInfo && value.provinceId) {
            updatedUserInfo.personInfo.cityProvinceId = value.provinceId;
          }

          localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

          // Navigate back if there's a callback URL
          const params = new URLSearchParams(window.location.search);
          const raw = params.get('callBackUrl') || params.get('callbackUrl');
          if (raw) {
            router.push(raw);
          }
        },
        onError: error => {
          console.error('Error updating user:', error);
          toast.error('خطا در به‌روزرسانی اطلاعات');
        },
      });
    },
  });

  // Subscribe to provinceId changes reactively via useStore
  const currentProvinceId = useStore(form.store, state => state.values.provinceId);

  // Update selectedProvinceId when form province value changes (user selects new province)
  React.useEffect(() => {
    if (currentProvinceId && currentProvinceId !== selectedProvinceId) {
      setSelectedProvinceId(currentProvinceId);
    }
  }, [currentProvinceId, selectedProvinceId]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        form.handleSubmit();
      }}
      dir='rtl'
      className='space-y-6'
    >
      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات هویتی</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* First row - 4 columns */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <form.AppField name='firstName'>
              {field => <field.TextField label='نام:' placeholder='نام' />}
            </form.AppField>

            <form.AppField name='lastName'>
              {field => <field.TextField label='نام خانوادگی:' placeholder='نام خانوادگی' />}
            </form.AppField>

            <form.AppField name='fatherName'>
              {field => <field.TextField label='نام پدر:' placeholder='نام پدر' />}
            </form.AppField>

            <form.AppField name='birthDate'>
              {field => <field.DatePickerField label='تاریخ تولد:' />}
            </form.AppField>
          </div>

          {/* Second row - 4 columns */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <form.AppField name='nationalCode'>
              {field => <field.TextField label='کد ملی:' placeholder='کد ملی' />}
            </form.AppField>

            <form.AppField name='issuePlace'>
              {field => <field.TextField label='محل صدور:' placeholder='محل صدور' />}
            </form.AppField>

            <form.AppField name='birthCertificateNumber'>
              {field => <field.TextField label='شماره شناسنامه:' placeholder='شماره شناسنامه' />}
            </form.AppField>

            <form.AppField name='email'>
              {field => <field.TextField type='email' label='ایمیل:' placeholder='ایمیل' />}
            </form.AppField>
          </div>
        </CardContent>
      </Card>

      {/* Location Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات محل سکونت</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* First row: استان شهر کد پستی */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <form.AppField name='provinceId'>
              {field => (
                <field.SelectField
                  label='استان:'
                  placeholder='انتخاب استان'
                  options={[
                    {
                      label: '',
                      items: provinces.map(province => ({
                        value: province.id,
                        label: province.name,
                      })),
                    },
                  ]}
                />
              )}
            </form.AppField>

            <form.AppField name='cityId'>
              {field => (
                <field.SelectField
                  label='شهر:'
                  placeholder={selectedProvinceId ? 'انتخاب شهر' : 'ابتدا استان را انتخاب کنید'}
                  options={[
                    {
                      label: '',
                      items: cities.map(city => ({
                        value: city.id,
                        label: city.name,
                      })),
                    },
                  ]}
                  disabled={!selectedProvinceId}
                />
              )}
            </form.AppField>

            <form.AppField name='postalCode'>
              {field => <field.TextField label='کد پستی:' placeholder='کد پستی' />}
            </form.AppField>
          </div>

          {/* Second row: آدرس (full width) */}
          <form.AppField name='address'>
            {field => <field.TextareaField label='آدرس:' placeholder='آدرس کامل' rows={4} />}
          </form.AppField>

          {/* Third row: تلفن شغل */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <form.AppField name='telephone'>
              {field => <field.TextField label='تلفن:' placeholder='تلفن' />}
            </form.AppField>

            <form.AppField name='jobTitle'>
              {field => <field.TextField label='شغل:' placeholder='شغل' />}
            </form.AppField>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className='flex justify-end'>
        <Button type='submit' disabled={isPending} className='px-4 py-2'>
          {isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </Button>
      </div>
    </form>
  );
};

export default CombinedUserForm;
=======
'use client';

import React, { useState } from 'react';

// * zod
import { z } from 'zod';

// * @tanstack/react-form
import { useStore } from '@tanstack/react-form';

// * sonner
import { toast } from 'sonner';

// * i18n
import { useRouter } from '@/i18n/navigation';

// * queries
import { useProvinces, useCitiesByProvince } from '@/queries/common';

// * mutations
import { useUpdateUserProfile } from '@/mutations/users';

// * components
import { useAppForm } from '@/components/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// * types
import { User } from '@/types/auth';

// Component props interface
interface CombinedUserFormProps {
  user: User | null;
}

// National code validator function
const validateNationalCode = (val: string) => {
  if (!/^\d{10}$/.test(val)) return false;
  const digits = val.split('').map(Number);
  const checkDigit = digits[9];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  const remainder = sum % 11;
  return remainder < 2 ? checkDigit === remainder : checkDigit === 11 - remainder;
};

// Zod validation schema
const CombinedFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'نام باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام نباید بیشتر از 50 کاراکتر باشد'),
  lastName: z
    .string()
    .min(2, 'نام خانوادگی باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام خانوادگی نباید بیشتر از 50 کاراکتر باشد'),
  fatherName: z
    .string()
    .min(2, 'نام پدر باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام پدر نباید بیشتر از 50 کاراکتر باشد'),
  birthDate: z.date().optional(),
  nationalCode: z
    .string()
    .regex(/^[0-9]{10}$/, 'کد ملی باید 10 رقم باشد')
    .refine(validateNationalCode, 'کد ملی نامعتبر است'),
  issuePlace: z.string().min(1, 'محل صدور الزامی است'),
  birthCertificateNumber: z.string().min(1, 'شماره شناسنامه الزامی است'),
  email: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      val => {
        if (!val || val === '') return true;
        return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(val);
      },
      { message: 'ایمیل نامعتبر است' },
    ),
  provinceId: z.string().min(1, 'انتخاب استان الزامی است'),
  cityId: z.string().min(1, 'انتخاب شهر الزامی است'),
  postalCode: z.string().regex(/^[0-9]{10}$/, 'کد پستی باید 10 رقم باشد'),
  jobTitle: z.string().optional().or(z.literal('')),
  telephone: z.string().optional().or(z.literal('')),
  address: z.string().min(10, 'آدرس باید حداقل 10 کاراکتر باشد'),
});

const CombinedUserForm: React.FC<CombinedUserFormProps> = ({ user }) => {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(
    user?.personInfo?.cityProvinceId || '',
  );
  const router = useRouter();

  const { data: provincesData } = useProvinces();
  const { data: citiesData } = useCitiesByProvince(selectedProvinceId);

  const provinces = provincesData?.data || [];
  const cities = citiesData?.data || [];
  const { mutate: updateProfile, isPending } = useUpdateUserProfile();
  const form = useAppForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      fatherName: user?.personInfo?.fatherName || '',
      birthDate: user?.personInfo?.birthDate ? new Date(user.personInfo.birthDate) : undefined,
      nationalCode: user?.nationalCode || '',
      issuePlace: user?.personInfo?.issuePlace || '',
      birthCertificateNumber: user?.personInfo?.birthCertificateNumber || '',
      email: user?.personInfo?.email || '',
      provinceId: user?.personInfo?.cityProvinceId || '',
      cityId: user?.personInfo?.cityId || '',
      postalCode: user?.personInfo?.postalCode || '',
      jobTitle: user?.personInfo?.jobTitle || '',
      telephone: user?.personInfo?.telephone || '',
      address: user?.personInfo?.address || '',
    },
    validators: {
      onSubmit: CombinedFormSchema,
    },
    onSubmit: async ({ value }) => {
      // Update selectedProvinceId for cities query
      setSelectedProvinceId(value.provinceId);

      const userInfo = localStorage.getItem('userInfo');
      const userId = userInfo ? JSON.parse(userInfo).id : '';

      const payload = {
        firstName: value.firstName,
        lastName: value.lastName,
        fatherName: value.fatherName,
        birthDate: value.birthDate ? value.birthDate.toISOString() : null,
        issuePlace: value.issuePlace,
        birthCertificateNumber: value.birthCertificateNumber,
        postalCode: value.postalCode,
        telephone: value.telephone,
        email: value.email,
        address: value.address,
        userId,
        nationalCode: value.nationalCode,
        cityId: value.cityId,
        jobTitle: value.jobTitle,
        provinceId: value.provinceId,
      };
      updateProfile(payload, {
        onSuccess: response => {
          if (!response.isSuccess) {
            toast.error(response.message || 'خطا در به‌روزرسانی اطلاعات');
            return;
          }

          toast.success('اطلاعات با موفقیت به‌روزرسانی شد');

          // Update localStorage with complete updated user info from server response
          const updatedUserInfo = response.data;

          // Add cityProvinceId to the personInfo if it exists
          if (updatedUserInfo.personInfo && value.provinceId) {
            updatedUserInfo.personInfo.cityProvinceId = value.provinceId;
          }

          localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

          // Navigate back if there's a callback URL
          const params = new URLSearchParams(window.location.search);
          const raw = params.get('callBackUrl') || params.get('callbackUrl');
          if (raw) {
            router.push(raw);
          }
        },
        onError: error => {
          console.error('Error updating user:', error);
          toast.error('خطا در به‌روزرسانی اطلاعات');
        },
      });
    },
  });

  // Subscribe to provinceId changes reactively via useStore
  const currentProvinceId = useStore(form.store, state => state.values.provinceId);

  // Update selectedProvinceId when form province value changes (user selects new province)
  React.useEffect(() => {
    if (currentProvinceId && currentProvinceId !== selectedProvinceId) {
      setSelectedProvinceId(currentProvinceId);
    }
  }, [currentProvinceId, selectedProvinceId]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        form.handleSubmit();
      }}
      dir='rtl'
      className='space-y-6'
    >
      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات هویتی</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* First row - 4 columns */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <form.AppField name='firstName'>
              {field => <field.TextField label='نام:' placeholder='نام' />}
            </form.AppField>

            <form.AppField name='lastName'>
              {field => <field.TextField label='نام خانوادگی:' placeholder='نام خانوادگی' />}
            </form.AppField>

            <form.AppField name='fatherName'>
              {field => <field.TextField label='نام پدر:' placeholder='نام پدر' />}
            </form.AppField>

            <form.AppField name='birthDate'>
              {field => <field.DatePickerField label='تاریخ تولد:' />}
            </form.AppField>
          </div>

          {/* Second row - 4 columns */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <form.AppField name='nationalCode'>
              {field => <field.TextField label='کد ملی:' placeholder='کد ملی' />}
            </form.AppField>

            <form.AppField name='issuePlace'>
              {field => <field.TextField label='محل صدور:' placeholder='محل صدور' />}
            </form.AppField>

            <form.AppField name='birthCertificateNumber'>
              {field => <field.TextField label='شماره شناسنامه:' placeholder='شماره شناسنامه' />}
            </form.AppField>

            <form.AppField name='email'>
              {field => <field.TextField type='email' label='ایمیل:' placeholder='ایمیل' />}
            </form.AppField>
          </div>
        </CardContent>
      </Card>

      {/* Location Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات محل سکونت</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* First row: استان شهر کد پستی */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <form.AppField name='provinceId'>
              {field => (
                <field.SelectField
                  label='استان:'
                  placeholder='انتخاب استان'
                  options={[
                    {
                      label: '',
                      items: provinces.map(province => ({
                        value: province.id,
                        label: province.name,
                      })),
                    },
                  ]}
                />
              )}
            </form.AppField>

            <form.AppField name='cityId'>
              {field => (
                <field.SelectField
                  label='شهر:'
                  placeholder={selectedProvinceId ? 'انتخاب شهر' : 'ابتدا استان را انتخاب کنید'}
                  options={[
                    {
                      label: '',
                      items: cities.map(city => ({
                        value: city.id,
                        label: city.name,
                      })),
                    },
                  ]}
                  disabled={!selectedProvinceId}
                />
              )}
            </form.AppField>

            <form.AppField name='postalCode'>
              {field => <field.TextField label='کد پستی:' placeholder='کد پستی' />}
            </form.AppField>
          </div>

          {/* Second row: آدرس (full width) */}
          <form.AppField name='address'>
            {field => <field.TextareaField label='آدرس:' placeholder='آدرس کامل' rows={4} />}
          </form.AppField>

          {/* Third row: تلفن شغل */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <form.AppField name='telephone'>
              {field => <field.TextField label='تلفن:' placeholder='تلفن' />}
            </form.AppField>

            <form.AppField name='jobTitle'>
              {field => <field.TextField label='شغل:' placeholder='شغل' />}
            </form.AppField>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className='flex justify-end'>
        <Button type='submit' disabled={isPending} className='px-4 py-2'>
          {isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </Button>
      </div>
    </form>
  );
};

export default CombinedUserForm;
>>>>>>> a47b58a (pwa)
