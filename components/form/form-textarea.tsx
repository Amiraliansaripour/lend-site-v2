import { useFieldContext } from '@/components/form';

import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

import { FormFieldInfo } from './form-field-info';
import { FormFieldWrapper } from './form-field-wrapper';

type TextareaFieldProps = Omit<
  React.ComponentProps<'textarea'>,
  'id' | 'value' | 'onChange' | 'onBlur'
> &
  Partial<{
    label: string;
    wrapperClassName: string;
  }>;

export const TextareaField = ({ label, wrapperClassName, ...props }: TextareaFieldProps) => {
  const field = useFieldContext<string>();

  return (
    <FormFieldWrapper className={wrapperClassName}>
      <Label htmlFor={field.name} className='capitalize'>
        {label ?? field.name}
      </Label>
      <Textarea
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={e => field.handleChange(e.target.value)}
        {...props}
      />
      <FormFieldInfo meta={field.state.meta} />
    </FormFieldWrapper>
  );
};
