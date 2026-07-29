'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { useAppForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMerchantToken } from '@/api/wallet';

type Props = {
  onSuccess: (token: string) => void;
};

export function MerchantLogin({ onSuccess }: Props) {
  const [isPending, setIsPending] = useState(false);

  const form = useAppForm<{ username: string; password: string }>({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setIsPending(true);
      try {
        const result = await getMerchantToken({
          username: value.username,
          password: value.password,
          grant_type: 'password',
        });

        if (result?.isSuccess && result.data?.access_token) {
          localStorage.setItem('merchantToken', result.data.access_token);
          toast.success('ورود با موفقیت انجام شد');
          onSuccess(result.data.access_token);
        } else {
          toast.error(result?.message ?? 'خطا در ورود');
        }
      } finally {
        setIsPending(false);
      }
    },
  });

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle>ورود فروشنده</CardTitle>
        <CardDescription>با اطلاعات حساب فروشنده وارد شوید</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={e => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='flex flex-col gap-4'
        >
          <form.AppField
            name='username'
            children={(field: any) => (
              <field.TextField label='نام کاربری' placeholder='نام کاربری' dir='ltr' />
            )}
          />

          <form.AppField
            name='password'
            children={(field: any) => (
              <field.PasswordField label='رمز عبور' placeholder='رمز عبور' dir='ltr' />
            )}
          />

          <form.AppForm>
            <form.SubmitButton className='w-full' disabled={isPending}>
              {isPending ? <Loader2 className='size-4 animate-spin' /> : 'ورود'}
            </form.SubmitButton>
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  );
}
