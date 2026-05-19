import * as React from 'react';

import { toast } from 'sonner';
import { format } from 'date-fns';

import { CalendarIcon, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const HOURS = Array.from({ length: 24 }, (_, i) => i).reverse();
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

type DatetimePickerProps = {
  initialDate?: Date | string;
  disabled?: boolean;
  noClearButton?: boolean;
  onValueChange?: (date: Date | undefined) => void;
};

export function DatetimePicker({
  initialDate: _initialDate,
  disabled,
  onValueChange,
  noClearButton = false,
}: DatetimePickerProps) {
  const initialDate = typeof _initialDate === 'string' ? new Date(_initialDate) : _initialDate;
  const [date, setDate] = React.useState<Date | undefined>(initialDate);
  const [currentMonth, setCurrentMonth] = React.useState<Date | undefined>(initialDate);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onValueChange?.(selectedDate);
  };

  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    if (date) {
      const newDate = new Date(date);
      if (type === 'hour') {
        newDate.setHours(parseInt(value));
      } else if (type === 'minute') {
        newDate.setMinutes(parseInt(value));
      }
      setDate(newDate);
      onValueChange?.(newDate);
      return;
    }

    toast.error('Select a date before selecting time');
  };

  const handleResetDatetime = () => {
    setDate(undefined);
    onValueChange?.(undefined);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className='relative flex items-center justify-end'>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal cursor-pointer',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className='ltr:mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4' />
            {date ? format(date, 'yyyy/MM/dd HH:mm') : <span>yyyy/MM/dd HH:MM</span>}
          </Button>
        </PopoverTrigger>

        {!noClearButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size='icon'
                variant='ghost'
                className='absolute cursor-pointer'
                onClick={handleResetDatetime}
              >
                <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent className='capitalize'>Clear</TooltipContent>
          </Tooltip>
        )}
      </div>
      <PopoverContent className='w-auto p-0'>
        <div className='sm:flex'>
          <div className='flex flex-col'>
            <Calendar
              mode='single'
              selected={date}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              onSelect={handleDateSelect}
              captionLayout='dropdown'
              autoFocus
            />

            <div className='flex sm:pb-3 pt-0 px-3'>
              <Button
                size='sm'
                className='cursor-pointer w-full sm:w-auto'
                onClick={() => {
                  const newDate = new Date();
                  newDate.setMinutes(0, 0, 0);

                  setDate(newDate);
                  setCurrentMonth(newDate);
                  onValueChange?.(newDate);
                }}
              >
                Today
              </Button>
            </div>
          </div>
          <div className='flex flex-col sm:flex-row sm:h-[335px] divide-y sm:divide-y-0 sm:divide-x'>
            <ScrollArea className='w-64 sm:w-auto'>
              <div className='flex sm:flex-col p-2'>
                {HOURS.map(hour => (
                  <Button
                    key={hour}
                    size='icon'
                    variant={date && date.getHours() === hour ? 'default' : 'ghost'}
                    className='sm:w-full shrink-0 aspect-square'
                    onClick={() => handleTimeChange('hour', hour.toString())}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation='horizontal' className='sm:hidden' />
            </ScrollArea>
            <ScrollArea className='w-64 sm:w-auto'>
              <div className='flex sm:flex-col p-2'>
                {MINUTES.map(minute => (
                  <Button
                    key={minute}
                    size='icon'
                    variant={date && date.getMinutes() === minute ? 'default' : 'ghost'}
                    className='sm:w-full shrink-0 aspect-square'
                    onClick={() => handleTimeChange('minute', minute.toString())}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation='horizontal' className='sm:hidden' />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
