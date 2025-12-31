import { useFieldContext } from '@/components/form';

import { Input } from '../ui/input';
import { Label } from '../ui/label';

import { FormFieldInfo } from './form-field-info';
import { FormFieldWrapper } from './form-field-wrapper';

import { useCallback, type ComponentProps } from 'react';
import { normalizeDigits } from '@/utils/normalize';
import { formatFloat, formatInt } from '@/utils/format';

type NumFieldProps = Partial<{
  label: string;
  float: boolean;
  nonNegative: boolean;
  wrapperClassName: string;
}> &
  Omit<ComponentProps<'input'>, 'id' | 'type' | 'value' | 'onChange' | 'onBlur'>;

export const NumField = ({
  label,
  float = false,
  nonNegative = false,
  wrapperClassName,
  ...props
}: NumFieldProps) => {
  const field = useFieldContext<string>();
  const value = field.state.value;

  const formattedValue =
    value && value !== '-' ? (float ? formatFloat(value) : formatInt(value)) : value;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = normalizeDigits(e.target.value.trim());

    if (nonNegative) value = value.replace(/-/g, '');

    const isNegative = value.startsWith('-');
    if (isNegative) value = value.slice(1);

    if (float) {
      if (value === '.') value = '';

      let dotFound = false;

      value = value.replace(/\./g, dot => {
        if (dotFound) return '';
        dotFound = true;
        return dot;
      });
    }

    value = value.replace(float ? /[^\d.]/g : /\D/g, '');

    field.handleChange(`${isNegative ? '-' : ''}${value}`);
  }, []);

  return (
    <FormFieldWrapper className={wrapperClassName}>
      <Label htmlFor={field.name} className='capitalize'>
        {label ?? field.name}
      </Label>
      <Input
        type='text'
        inputMode='numeric'
        id={field.name}
        value={formattedValue}
        onChange={handleChange}
        onBlur={field.handleBlur}
        {...props}
      />
      <FormFieldInfo meta={field.state.meta} />
    </FormFieldWrapper>
  );
};
