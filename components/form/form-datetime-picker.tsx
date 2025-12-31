import { useFieldContext } from '@/components/form';

import { Label } from '../ui/label';
import { DatetimePicker } from '../ui/datetime-picker';

import { FormFieldInfo } from './form-field-info';
import { FormFieldWrapper } from './form-field-wrapper';

type DatetimePickerFieldProps = {
  label?: string;
  wrapperClassName?: string;
  noClearButton?: boolean;
  disabled?: boolean;
};

export const DatetimePickerField = ({
  label,
  wrapperClassName,
  noClearButton = false,
  disabled,
}: DatetimePickerFieldProps) => {
  const field = useFieldContext<Date | string | undefined>();

  return (
    <FormFieldWrapper className={wrapperClassName}>
      <Label htmlFor={field.name} className='capitalize'>
        {label ?? field.name}
      </Label>
      <DatetimePicker
        noClearButton={noClearButton}
        initialDate={field.state.value}
        onValueChange={value => field.handleChange(value == null ? '' : value)}
        disabled={disabled}
      />
      <FormFieldInfo meta={field.state.meta} />
    </FormFieldWrapper>
  );
};
