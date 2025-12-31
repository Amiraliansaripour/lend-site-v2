import { useFieldContext } from '@/components/form';

import { Label } from '../ui/label';
import { MaskInput, type MaskInputProps } from '../ui/mask-input';

import { FormFieldInfo } from './form-field-info';
import { FormFieldWrapper } from './form-field-wrapper';

type MaskTextFieldProps = Omit<MaskInputProps, 'id' | 'value' | 'onValueChange'> & {
  label?: string;
  wrapperClassName?: string;
};

export const MaskTextField = ({ label, wrapperClassName, ...props }: MaskTextFieldProps) => {
  const field = useFieldContext<string>();

  return (
    <FormFieldWrapper className={wrapperClassName}>
      <Label htmlFor={field.name} className='capitalize'>
        {label ?? field.name}
      </Label>
      <MaskInput
        id={field.name}
        value={field.state.value}
        onValueChange={(_, unmasked) => field.handleChange(unmasked)}
        {...props}
      />
      <FormFieldInfo meta={field.state.meta} />
    </FormFieldWrapper>
  );
};
