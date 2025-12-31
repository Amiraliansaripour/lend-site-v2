import { useFieldContext } from '@/components/form';

import { Slider, type SliderProps } from '../ui/slider';

import { FormFieldInfo } from './form-field-info';
import { FormFieldWrapper } from './form-field-wrapper';

type SliderFieldProps = Omit<SliderProps, 'defaultValue' | 'onBlur' | 'onValueCommit'> & {
  wrapperClassName?: string;
};

export const SliderField = ({ wrapperClassName, ...props }: SliderFieldProps) => {
  const field = useFieldContext<number[]>();

  return (
    <FormFieldWrapper className={wrapperClassName}>
      <Slider
        defaultValue={field.state.value}
        onBlur={field.handleBlur}
        onValueCommit={field.handleChange}
        {...props}
      />
      <FormFieldInfo meta={field.state.meta} />
    </FormFieldWrapper>
  );
};
