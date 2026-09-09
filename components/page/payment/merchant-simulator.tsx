'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Copy, ExternalLink, Loader2, KeyRound, Link2 } from 'lucide-react';

import { useAppForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getMerchantToken, getOrderId } from '@/api/wallet';

type OrderFormValues = {
  nationalcode: string;
  mobile: string;
  amount: string;
  installmentNumber: string;
  rateValue: string;
  description: string;
  returnUrl: string;
  merchantOrderId: string;
  firstName: string;
  lastName: string;
};

export function MerchantSimulator() {
  const [merchantToken, setMerchantToken] = useState('');
  const [tokenDraft, setTokenDraft] = useState('');
  const [loginPending, setLoginPending] = useState(false);
  const [orderPending, setOrderPending] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('merchantToken');
    if (stored) {
      setMerchantToken(stored);
      setTokenDraft(stored);
    }
  }, []);

  const loginForm = useAppForm<{ username: string; password: string }>({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setLoginPending(true);
      try {
        const result = await getMerchantToken({
          username: value.username,
          password: value.password,
          grant_type: 'password',
        });

        if (result?.isSuccess && result.data?.access_token) {
          const token = result.data.access_token;
          localStorage.setItem('merchantToken', token);
          setMerchantToken(token);
          setTokenDraft(token);
          toast.success('توکن فروشنده دریافت شد');
        } else {
          toast.error(result?.message ?? 'خطا در دریافت توکن');
        }
      } finally {
        setLoginPending(false);
      }
    },
  });

  const applyToken = () => {
    const token = tokenDraft.trim();
    if (!token) {
      toast.error('توکن را وارد کنید');
      return;
    }
    localStorage.setItem('merchantToken', token);
    setMerchantToken(token);
    toast.success('توکن برای هدر API ذخیره شد');
  };

  const orderForm = useAppForm<OrderFormValues>({
    defaultValues: {
      nationalcode: '',
      mobile: '',
      amount: '',
      installmentNumber: '',
      rateValue: '',
      description: 'خریدکالا',
      returnUrl: '',
      merchantOrderId: '',
      firstName: '',
      lastName: '',
    },
    onSubmit: async ({ value }) => {
      if (!merchantToken.trim()) {
        toast.error('ابتدا توکن فروشنده را تنظیم کنید');
        return;
      }
      if (!value.nationalcode.trim()) {
        toast.error('کد ملی الزامی است');
        return;
      }
      if (!value.amount.trim() || Number(value.amount) <= 0) {
        toast.error('مبلغ معتبر وارد کنید');
        return;
      }

      const installmentNumber =
        value.installmentNumber.trim() !== '' ? Number(value.installmentNumber) : undefined;
      const rateValue = value.rateValue.trim() !== '' ? Number(value.rateValue) : undefined;

      setOrderPending(true);
      setPaymentLink(null);
      try {
        const result = await getOrderId(
          {
            nationalcode: value.nationalcode.trim(),
            amount: Number(value.amount),
            isOnline: true,
            ...(value.mobile.trim() ? { mobile: value.mobile.trim() } : {}),
            ...(installmentNumber != null && !Number.isNaN(installmentNumber)
              ? { InstallMentNumber: installmentNumber }
              : {}),
            ...(rateValue != null && !Number.isNaN(rateValue) ? { rateValue } : {}),
          },
          merchantToken.trim(),
        );

        if (result?.isSuccess && result.data) {
          const merchantId = result.data.id || result.data.merchantId;
          const { orderId } = result.data;

          if (!merchantId || !orderId) {
            toast.error('پاسخ سفارش ناقص است');
            return;
          }

          const origin = window.location.origin;
          const returnUrl = value.returnUrl.trim() || `${origin}/merchant-simulator/callback`;
          const params = new URLSearchParams({
            amount: String(Number(value.amount)),
            nationalcode: value.nationalcode.trim(),
            merchantId,
            orderId: String(orderId),
            description: value.description.trim() || 'خریدکالا',
            returnUrl,
          });

          if (installmentNumber != null && !Number.isNaN(installmentNumber)) {
            params.set('installmentNumber', String(installmentNumber));
          }
          if (rateValue != null && !Number.isNaN(rateValue)) {
            params.set('rateValue', String(rateValue));
          }
          if (value.mobile.trim()) {
            params.set('mobile', value.mobile.trim());
          }
          if (value.merchantOrderId.trim()) {
            params.set('merchantOrderId', value.merchantOrderId.trim());
          }
          if (value.firstName.trim()) {
            params.set('firstName', value.firstName.trim());
          }
          if (value.lastName.trim()) {
            params.set('lastName', value.lastName.trim());
          }

          const link = `${origin}/recipient?${params.toString()}`;
          setPaymentLink(link);
          toast.success(result.message ?? 'لینک پرداخت ایجاد شد');
        } else {
          toast.error(result?.message ?? 'خطا در ایجاد سفارش');
        }
      } catch {
        toast.error('خطا در ایجاد سفارش');
      } finally {
        setOrderPending(false);
      }
    },
  });

  const copyLink = () => {
    if (!paymentLink) return;
    navigator.clipboard.writeText(paymentLink);
    toast.success('لینک کپی شد');
  };

  return (
    <div className='mx-auto flex w-full max-w-xl flex-col gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>شبیه‌ساز پرداخت فروشنده</CardTitle>
          <CardDescription>
            توکن فروشنده را بگیرید یا وارد کنید، سپس سفارش بسازید و لینک recipient را کپی کنید
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <section className='flex flex-col gap-3'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <KeyRound className='size-4' />
              ۱. توکن فروشنده (MerchantToken)
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                loginForm.handleSubmit();
              }}
              className='flex flex-col gap-3 rounded-lg border p-3'
            >
              <p className='text-xs text-muted-foreground'>
                دریافت توکن از <span dir='ltr'>api/v1/User/MerchantToken</span>
              </p>
              <loginForm.AppField
                name='username'
                children={(field: any) => (
                  <field.TextField label='نام کاربری' placeholder='username' dir='ltr' />
                )}
              />
              <loginForm.AppField
                name='password'
                children={(field: any) => (
                  <field.PasswordField label='رمز عبور' placeholder='password' dir='ltr' />
                )}
              />
              <loginForm.AppForm>
                <loginForm.SubmitButton className='w-full' disabled={loginPending}>
                  {loginPending ? (
                    <Loader2 className='size-4 animate-spin' />
                  ) : (
                    'دریافت توکن فروشنده'
                  )}
                </loginForm.SubmitButton>
              </loginForm.AppForm>
            </form>

            <div className='flex flex-col gap-2 rounded-lg border p-3'>
              <p className='text-xs text-muted-foreground'>
                یا توکن را مستقیم برای هدر Step 2 وارد کنید
              </p>
              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='merchant-token'>Bearer Token</Label>
                <Textarea
                  id='merchant-token'
                  dir='ltr'
                  rows={3}
                  className='font-mono text-xs'
                  placeholder='paste merchant access_token here'
                  value={tokenDraft}
                  onChange={e => setTokenDraft(e.target.value)}
                />
              </div>
              <div className='flex items-center justify-between gap-2'>
                <p className='text-xs text-muted-foreground truncate' dir='ltr'>
                  {merchantToken ? `active: ${merchantToken.slice(0, 18)}…` : 'no token set'}
                </p>
                <Button type='button' size='sm' variant='secondary' onClick={applyToken}>
                  اعمال توکن
                </Button>
              </div>
            </div>
          </section>

          <Separator />

          <section className='flex flex-col gap-3'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <Link2 className='size-4' />
              ۲. ایجاد سفارش و لینک (GetOrderId)
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                orderForm.handleSubmit();
              }}
              className='flex flex-col gap-3'
            >
              <orderForm.AppField
                name='nationalcode'
                children={(field: any) => (
                  <field.TextField
                    label='کد ملی *'
                    placeholder='0025645137'
                    dir='ltr'
                    inputMode='numeric'
                    maxLength={10}
                  />
                )}
              />

              <orderForm.AppField
                name='mobile'
                children={(field: any) => (
                  <field.TextField
                    label='موبایل'
                    placeholder='+989102442108'
                    dir='ltr'
                    inputMode='tel'
                  />
                )}
              />

              <orderForm.AppField
                name='amount'
                children={(field: any) => (
                  <field.NumField label='مبلغ (ریال) *' placeholder='500000' />
                )}
              />

              <div className='grid grid-cols-2 gap-3'>
                <orderForm.AppField
                  name='installmentNumber'
                  children={(field: any) => <field.NumField label='تعداد اقساط' placeholder='4' />}
                />
                <orderForm.AppField
                  name='rateValue'
                  children={(field: any) => (
                    <field.TextField label='کارمزد (rateValue)' placeholder='3.5' dir='ltr' />
                  )}
                />
              </div>

              <orderForm.AppField
                name='description'
                children={(field: any) => (
                  <field.TextField label='توضیحات' placeholder='خریدکالا' />
                )}
              />

              <orderForm.AppField
                name='merchantOrderId'
                children={(field: any) => (
                  <field.TextField
                    label='merchantOrderId (فاکتور فروشنده)'
                    placeholder='invoice-001'
                    dir='ltr'
                  />
                )}
              />

              <div className='grid grid-cols-2 gap-3'>
                <orderForm.AppField
                  name='firstName'
                  children={(field: any) => <field.TextField label='نام' placeholder='نام' />}
                />
                <orderForm.AppField
                  name='lastName'
                  children={(field: any) => (
                    <field.TextField label='نام خانوادگی' placeholder='نام خانوادگی' />
                  )}
                />
              </div>

              <orderForm.AppField
                name='returnUrl'
                children={(field: any) => (
                  <field.TextField
                    label='returnUrl'
                    placeholder='خالی = /merchant-simulator/callback'
                    dir='ltr'
                  />
                )}
              />

              <orderForm.AppForm>
                <orderForm.SubmitButton
                  className='w-full'
                  disabled={orderPending || !merchantToken.trim()}
                >
                  {orderPending ? (
                    <>
                      <Loader2 className='size-4 animate-spin me-2' />
                      در حال ایجاد...
                    </>
                  ) : (
                    'ارسال OTP و ساخت لینک'
                  )}
                </orderForm.SubmitButton>
              </orderForm.AppForm>
            </form>
          </section>

          {paymentLink && (
            <>
              <Separator />
              <section className='flex flex-col gap-3'>
                <p className='text-sm font-medium'>لینک صفحه recipient</p>
                <div
                  className='rounded-md bg-muted p-3 text-xs break-all text-muted-foreground'
                  dir='ltr'
                >
                  {paymentLink}
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm' className='flex-1' onClick={copyLink}>
                    <Copy className='size-4 me-1' />
                    کپی
                  </Button>
                  <Button variant='outline' size='sm' className='flex-1' asChild>
                    <a href={paymentLink} target='_blank' rel='noreferrer'>
                      <ExternalLink className='size-4 me-1' />
                      باز کردن
                    </a>
                  </Button>
                </div>
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
