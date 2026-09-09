'use client';

import { useEffect } from 'react';

import { z } from 'zod';
import { useStore } from '@tanstack/react-form';
import { toast } from 'sonner';

import { useAppForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormFieldWrapper } from '@/components/form/form-field-wrapper';

import { useCreateCard, useUpdateCard } from '@/mutations/cards';

import type { BankCard } from '@/types/cards';

import {
  formatCardNumber,
  formatExpiryInput,
  getCardBankInfo,
  normalizeCardNumber,
  normalizeDigits,
  toExpiryApi,
  toExpiryDisplay,
} from './cards-utils';

import { BankCardPreview } from './bank-card-preview';

type BankCardFormProps = {
  card?: BankCard | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const CardSchema = z.object({
  cardNumber: z.string().length(16, {
    error: 'شماره کارت باید 16 رقم باشد',
  }),

  iban: z.string().length(24, {
    error: 'شماره شبا باید 24 رقم باشد',
  }),

  expiryDate: z.string().regex(/^\d{4}\/(0[1-9]|1[0-2])$/, {
    error: 'فرمت تاریخ انقضا باید مانند 1405/12 باشد',
  }),

  bankName: z.string().min(1, {
    error: 'بانک کارت شناسایی نشد',
  }),
});

export function BankCardForm({ card, onSuccess, onCancel }: BankCardFormProps) {
  const isEditMode = Boolean(card);

  const createMutation = useCreateCard();
  const updateMutation = useUpdateCard();

  const form = useAppForm({
    defaultValues: {
      cardNumber: card?.cardNumber || '',
      iban: card?.iban || '',
      expiryDate: toExpiryDisplay(card?.expiryDate || ''),
      bankName: card?.bankName || '',
    },

    onSubmit: async ({ value }) => {
      const validation = CardSchema.safeParse(value);

      if (!validation.success) {
        toast.error(validation.error.issues[0]?.message || 'اطلاعات کارت صحیح نیست');
        return;
      }

      const bankInfo = getCardBankInfo(value.cardNumber);

      if (!bankInfo?.name) {
        toast.error('بانک کارت شناسایی نشد');
        return;
      }

      const payload = {
        ...value,
        expiryDate: toExpiryApi(value.expiryDate),
        bankName: bankInfo.name,
      };

      if (isEditMode && card?.id) {
        const response = await updateMutation.mutateAsync({
          id: card.id,
          payload,
        });

        if (!response?.isSuccess) {
          toast.error(response?.message || 'خطا در ویرایش کارت بانکی');
          return;
        }

        toast.success('کارت بانکی با موفقیت ویرایش شد');
      } else {
        const response = await createMutation.mutateAsync(payload);

        if (!response?.isSuccess) {
          toast.error(response?.message || 'خطا در ثبت کارت بانکی');
          return;
        }

        toast.success('کارت بانکی با موفقیت ثبت شد');
      }

      onSuccess();
    },
  });

  const cardNumber = useStore(form.store, state => state.values.cardNumber);

  const iban = useStore(form.store, state => state.values.iban);

  const expiryDate = useStore(form.store, state => state.values.expiryDate);

  const bankName = useStore(form.store, state => state.values.bankName);

  const bankInfo = getCardBankInfo(cardNumber);

  useEffect(() => {
    form.setFieldValue('bankName', bankInfo?.name || '');
  }, [bankInfo?.name]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      noValidate
      autoComplete='off'
      dir='rtl'
      className='space-y-6'
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <BankCardPreview
        cardNumber={cardNumber}
        iban={iban}
        expiryDate={expiryDate}
        bankName={bankName}
      />

      <div className='space-y-5'>
        <form.AppField name='cardNumber'>
          {field => (
            <FormFieldWrapper>
              <Label htmlFor={field.name} className='mb-2 block'>
                شماره کارت
                <span className='mr-1 text-red-500'>*</span>
              </Label>

              <Input
                id='bank-pan'
                name='bank-pan'
                value={formatCardNumber(field.state.value)}
                onChange={event => field.handleChange(normalizeCardNumber(event.target.value))}
                placeholder='6037 9912 3456 7890'
                inputMode='numeric'
                autoComplete='one-time-code'
                data-lpignore='true'
                data-form-type='other'
                dir='ltr'
                maxLength={19}
                className='text-center font-mono tracking-wider'
              />

              {bankInfo?.name && (
                <div className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'>
                  {bankInfo.logo && (
                    <img
                      src={bankInfo.logo}
                      alt={bankInfo.name}
                      className='size-5 object-contain'
                    />
                  )}

                  <span>{bankInfo.name}</span>
                </div>
              )}
            </FormFieldWrapper>
          )}
        </form.AppField>

        {/* شماره شبا */}
        <form.AppField name='iban'>
          {field => {
            const digits = normalizeDigits(field.state.value || '')
              .replace(/\D/g, '')
              .slice(0, 24);

            const formattediban = digits.replace(/(.{4})/g, '$1 ').trim();

            return (
              <FormFieldWrapper>
                <Label htmlFor={field.name} className='mb-2 block'>
                  شماره شبا
                  <span className='mr-1 text-red-500'>*</span>
                </Label>

                <div className='relative'>
                  <span className='pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 font-mono text-sm font-semibold text-muted-foreground'>
                    IR
                  </span>

                  <Input
                    id='bank-iban'
                    name='bank-iban'
                    value={formattediban}
                    onChange={event => {
                      const value = normalizeDigits(event.target.value)
                        .replace(/\D/g, '')
                        .slice(0, 24);

                      field.handleChange(value);
                    }}
                    placeholder='12 0170 0000 1234 5678 9012'
                    inputMode='numeric'
                    autoComplete='one-time-code'
                    data-lpignore='true'
                    data-form-type='other'
                    dir='ltr'
                    maxLength={29}
                    className='pl-10 font-mono tracking-wider'
                  />
                </div>
              </FormFieldWrapper>
            );
          }}
        </form.AppField>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <form.AppField name='expiryDate'>
            {field => (
              <FormFieldWrapper>
                <Label htmlFor={field.name} className='mb-2 block'>
                  تاریخ انقضا
                  <span className='mr-1 text-red-500'>*</span>
                </Label>

                <Input
                  id='bank-exp'
                  name='bank-exp'
                  value={field.state.value}
                  onChange={event => {
                    field.handleChange(formatExpiryInput(event.target.value));
                  }}
                  placeholder='1405/12'
                  inputMode='numeric'
                  autoComplete='one-time-code'
                  data-lpignore='true'
                  data-form-type='other'
                  maxLength={7}
                  dir='ltr'
                  className='font-mono'
                />
              </FormFieldWrapper>
            )}
          </form.AppField>
        </div>
      </div>

      <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending}>
          انصراف
        </Button>

        <form.AppForm>
          <form.SubmitButton className='mt-0 w-auto' disabled={isPending} noSpinner>
            {isPending ? 'در حال ذخیره...' : isEditMode ? 'ذخیره تغییرات' : 'ثبت کارت'}
          </form.SubmitButton>
        </form.AppForm>
      </div>
    </form>
  );
}
