import { useFieldContext } from '@/components/form';

import { Label } from '../ui/label';
import { MultiSelect, type MultiSelectProps } from '../ui/multi-select';

import { FormFieldInfo } from './form-field-info';
import { FormFieldWrapper } from './form-field-wrapper';

type MultiSelectFieldSharedProps = Omit<MultiSelectProps, 'onValueChange'> & {
  label?: string;
  wrapperClassName?: string;
};

type MultiSelectFieldProps = MultiSelectFieldSharedProps;

export const MultiSelectField = ({ label, wrapperClassName, ...props }: MultiSelectFieldProps) => {
  const field = useFieldContext<string[]>();

  return (
    <FormFieldWrapper className={wrapperClassName}>
      <Label>{label ?? field.name}</Label>

      <MultiSelect
        variant='default'
        onBlur={field.handleBlur}
        onValueChange={field.handleChange}
        maxCount={3}
        {...props}
      />

      <FormFieldInfo meta={field.state.meta} />
    </FormFieldWrapper>
  );
};
