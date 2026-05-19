import { useFieldContext } from '@/components/form';

import { Input } from '../ui/input';
import { Label } from '../ui/label';

import { FormFieldInfo } from './form-field-info';
import { FormFieldWrapper } from './form-field-wrapper';

import type { ComponentProps } from 'react';

type TextFieldProps = { label?: string; wrapperClassName?: string; className?: string } & Omit<
  ComponentProps<'input'>,
  'id' | 'value' | 'onChange' | 'onBlur'
>;

export const TextField = ({ label, wrapperClassName, className, ...props }: TextFieldProps) => {
  const field = useFieldContext<string>();

  return (
    <FormFieldWrapper className={wrapperClassName}>
      <Label htmlFor={field.name} className='capitalize'>
        {label}
      </Label>
      <Input
        id={field.name}
        value={field.state.value}
        onChange={e => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        className={className}
        {...props}
      />
      <FormFieldInfo meta={field.state.meta} />
    </FormFieldWrapper>
  );
};
