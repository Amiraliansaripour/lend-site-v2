import { useFieldContext } from '@/components/form';

import { Label } from '../ui/label';
import { DatePicker } from '../ui/date-picker';
import { FormFieldInfo } from './form-field-info';
import { FormFieldWrapper } from './form-field-wrapper';

import type { DayPicker } from 'react-day-picker';

type DatePickerFieldProps = {
  label?: string;
  wrapperClassName?: string;
  disabled?: boolean;
  outputType?: 'date' | 'date-string';
  hideTodayButton?: boolean;
  calendarDisabled?: React.ComponentProps<typeof DayPicker>['disabled'];
};

export const DatePickerField = ({
  label,
  wrapperClassName,
  outputType = 'date',
  disabled,
  hideTodayButton,
  calendarDisabled,
}: DatePickerFieldProps) => {
  const field = useFieldContext<Date | string | undefined>();

  return (
    <FormFieldWrapper className={wrapperClassName}>
      <Label htmlFor={field.name} className='capitalize'>
        {label ?? field.name}
      </Label>
      <DatePicker
        disabled={disabled}
        calendarDisabled={calendarDisabled}
        hideTodayButton={hideTodayButton}
        id={field.name}
        initialDate={field.state.value}
        onBlur={field.handleBlur}
        // * passing undefined to `field.handleChange` will just reset the field to its default value
        onValueChange={(date, value) => {
          field.handleChange(
            outputType === 'date-string' ? (value == null ? '' : value) : date == null ? '' : date,
          );
        }}
      />
      <FormFieldInfo meta={field.state.meta} />
    </FormFieldWrapper>
  );
};
