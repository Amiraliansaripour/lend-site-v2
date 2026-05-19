'use client';

import * as React from 'react';

import { CalendarIcon } from 'lucide-react';
import type { Matcher } from 'react-day-picker';

import { formatJalaliDate } from '@/utils/format';
import { normalizeDigits } from '@/utils/normalize';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { MaskInput } from '@/components/ui/mask-input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function formatDate(date: Date | undefined) {
  if (!date) {
    return '';
  }

  return normalizeDigits(
    formatJalaliDate(date, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
  );
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

function initDate(date: Date | string | undefined) {
  if (!date) return undefined;

  try {
    return typeof date === 'string' ? new Date(date) : date;
  } catch (err) {}
}

export type DatePickerProps = {
  id?: string;
  initialDate?: Date | string;
  disabled?: boolean;
  hideTodayButton?: boolean;
  calendarDisabled?: Matcher | Matcher[];
  onBlur?: () => void;
  onValueChange?: (date: Date | undefined, value: string) => void;
};

export function DatePicker({
  id,
  initialDate,
  onBlur,
  onValueChange,
  disabled,
  hideTodayButton = false,
  calendarDisabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(initDate(initialDate));
  const [month, setMonth] = React.useState<Date | undefined>(undefined);
  const [value, setValue] = React.useState(formatDate(date));

  return (
    <div className='relative flex gap-2'>
      <MaskInput
        id={id}
        value={value}
        disabled={disabled}
        placeholder='yyyy/MM/dd'
        mask={{
          pattern: '####/##/##',
          placeholder: 'yyyy/MM/dd',
        }}
        onBlur={onBlur}
        onValueChange={masked => {
          setValue(masked);

          const separatorIndex = masked.indexOf('/');
          const lastSeparatorIndex = masked.lastIndexOf('/');

          if (separatorIndex === lastSeparatorIndex) {
            setDate(undefined);
            setMonth(undefined);
            onValueChange?.(undefined, masked);
            return;
          }

          try {
            const newDate = new Date(masked);

            if (isValidDate(newDate)) {
              setDate(newDate);
              setMonth(newDate);
              onValueChange?.(newDate, masked);
              return;
            }

            throw new Error('Invalid Date'); // * to reach the catch clause
          } catch (_err) {
            setValue(masked);
            setDate(undefined);
            setMonth(undefined);
            onValueChange?.(undefined, masked);
          }
        }}
      />

      <Popover
        open={open}
        onOpenChange={open => {
          setOpen(open);
          onBlur?.();
        }}
      >
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            id='date-picker'
            variant='ghost'
            className='absolute top-1/2 right-2 rtl:right-auto rtl:left-2 size-6 -translate-y-1/2'
          >
            <CalendarIcon className='size-3.5' />
            <span className='sr-only'>Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-auto overflow-hidden p-0'
          align='end'
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode='single'
            selected={date}
            captionLayout='dropdown'
            month={month}
            disabled={calendarDisabled}
            onMonthChange={setMonth}
            onSelect={date => {
              const formattedDate = formatDate(date);
              setDate(date);
              setOpen(false);
              setValue(formattedDate);
              onValueChange?.(date, formattedDate);
            }}
            footer={
              !hideTodayButton && (
                <div className='w-full flex justif-end'>
                  <Button
                    type='button'
                    className='cursor-pointer mt-2 mr-auto'
                    onClick={() => {
                      const newDate = new Date();
                      const formatteDate = formatDate(new Date());

                      setDate(newDate);
                      setMonth(newDate);
                      setValue(formatteDate);
                      onValueChange?.(newDate, formatteDate);
                    }}
                  >
                    امروز
                  </Button>
                </div>
              )
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
