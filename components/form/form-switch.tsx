import { useFieldContext } from '@/components/form';

import { Switch, type SwitchProps } from '../ui/switch';

import { FormFieldInfo } from './form-field-info';
import { FormFieldWrapper } from './form-field-wrapper';

import { cn } from '@/lib/utils';

type SwitchFieldProps = Omit<SwitchProps, 'checked' | 'onBlur' | 'onCheckedChange'> & {
  wrapperClassName?: string;
};

export const SwitchField = ({ className, wrapperClassName, ...props }: SwitchFieldProps) => {
  const field = useFieldContext<boolean>();

  return (
    <FormFieldWrapper className={wrapperClassName}>
      <Switch
        checked={field.state.value}
        onCheckedChange={field.handleChange}
        className={cn('cursor-pointer', className)}
        onBlur={field.handleBlur}
        {...props}
      />
      <FormFieldInfo meta={field.state.meta} />
    </FormFieldWrapper>
  );
};
