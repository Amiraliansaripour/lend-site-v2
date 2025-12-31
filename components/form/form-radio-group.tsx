import { useId } from 'react';

import { useFieldContext } from '@/components/form';

import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { FormFieldWrapper } from './form-field-wrapper';
import { FormFieldInfo } from './form-field-info';

type RadioGroupOption = { label: string; value: string };

type RadioGroupFieldProps = {
  label?: string;
  defaultValue?: string;
  wrapperClassName?: string;
  options: RadioGroupOption[];
  disabled?: boolean;
};

export const RadioGroupField = ({
  label,
  options,
  defaultValue,
  wrapperClassName,
  ...props
}: RadioGroupFieldProps) => {
  const field = useFieldContext<string>();

  return (
    <FormFieldWrapper className={wrapperClassName}>
      {label && <Label>{label}</Label>}
      <RadioGroup
        onValueChange={field.setValue}
        defaultValue={field.state.value || (defaultValue ?? options[0].value)}
        {...props}
      >
        {options.map(option => (
          <RadioGroupFieldItem key={option.value} option={option} />
        ))}
      </RadioGroup>
      <FormFieldInfo meta={field.state.meta} />
    </FormFieldWrapper>
  );
};

type RadioGroupFieldItemProps = { option: RadioGroupOption; disabled?: boolean };

const RadioGroupFieldItem = ({ option, ...props }: RadioGroupFieldItemProps) => {
  const id = useId();

  return (
    <div className='flex items-center gap-x-2'>
      <RadioGroupItem id={id} value={option.value} className='cursor-pointer' {...props} />
      <Label htmlFor={id} className='cursor-pointer'>
        {option.label}
      </Label>
    </div>
  );
};
