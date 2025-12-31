import { useFieldContext } from '@/components/form';

import { cn } from '@/lib/utils';

import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

import { FormFieldInfo } from './form-field-info';
import { FormFieldWrapper } from './form-field-wrapper';

type CheckboxFieldProps = {
  label: string;
  className?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  disabled?: boolean;
};

export const CheckboxField = ({
  label,
  className,
  labelClassName,
  wrapperClassName,
  ...props
}: CheckboxFieldProps) => {
  const field = useFieldContext<boolean>();

  return (
    <FormFieldWrapper className={wrapperClassName}>
      <div className={cn('flex items-center gap-x-3', className)}>
        <Checkbox
          id={field.name}
          defaultChecked={field.state.value}
          onCheckedChange={checked =>
            field.handleChange(checked === 'indeterminate' ? false : checked)
          }
          {...props}
        />
        <Label htmlFor={field.name} className={labelClassName}>
          {label}
        </Label>
      </div>

      <FormFieldInfo meta={field.state.meta} />
    </FormFieldWrapper>
  );
};
