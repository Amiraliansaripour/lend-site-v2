import { useState, type ComponentProps } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useFieldContext } from '@/components/form';

import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

import { FormFieldInfo } from './form-field-info';
import { FormFieldWrapper } from './form-field-wrapper';

type PasswordFieldProps = { label?: string; wrapperClassName?: string } & Omit<
  ComponentProps<'input'>,
  'id' | 'type' | 'value' | 'onChange' | 'onBlur'
>;

export const PasswordField = ({
  label,
  className,
  wrapperClassName,
  ...props
}: PasswordFieldProps) => {
  const field = useFieldContext<string>();

  const [visible, setVisible] = useState<boolean>(false);

  return (
    <FormFieldWrapper className={wrapperClassName}>
      <Label htmlFor={field.name} className='capitalize'>
        {label ?? field.name}
      </Label>
      <div className='flex items-center relative'>
        <Input
          type={visible ? 'text' : 'password'}
          id={field.name}
          value={field.state.value}
          onChange={e => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          className={cn('ltr:pr-10 rtl:pl-10', className)}
          {...props}
        />

        <Button
          type='button'
          variant='ghost'
          onClick={() => setVisible(prev => !prev)}
          className='flex items-center absolute ltr:right-0 rtl:left-0 inset-y-0 cursor-pointer'
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </Button>
      </div>
      <FormFieldInfo meta={field.state.meta} />
    </FormFieldWrapper>
  );
};
