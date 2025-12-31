import { useFieldContext } from '@/components/form';

import {
  Select,
  SelectItem,
  SelectLabel,
  SelectValue,
  SelectGroup,
  SelectTrigger,
  SelectContent,
} from '@/components/ui/select';

import { FormFieldInfo } from './form-field-info';
import { FormFieldWrapper } from './form-field-wrapper';
import { Label } from '../ui/label';

type SelectGroup = {
  label?: string;
  items: { value: string; label: React.ReactNode }[];
};

type SelectFieldSharedProps = {
  label?: string;
  placeholder: string;
  disabled?: boolean;
  defaultOpen?: boolean;
  triggerClassName?: string;
  wrapperClassName?: string;
};

type SelectFieldProps = SelectFieldSharedProps &
  (
    | {
        options: SelectGroup[];
        children?: never;
      }
    | {
        options?: never;
        children: React.ReactNode;
      }
  );

export const SelectField = ({
  label,
  options,
  children,
  placeholder,
  triggerClassName,
  wrapperClassName,
  ...props
}: SelectFieldProps) => {
  const field = useFieldContext<string>();

  return (
    <FormFieldWrapper className={wrapperClassName}>
      {label && <Label>{label}</Label>}
      <Select
        value={field.state.value}
        onValueChange={value => field.handleChange(value)}
        {...props}
      >
        <SelectTrigger onBlur={field.handleBlur} className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options
            ? options.map(option => (
                <SelectGroup key={option.label}>
                  {option.label && <SelectLabel>{option.label}</SelectLabel>}

                  {option.items.map(item => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))
            : children}
        </SelectContent>
      </Select>

      <FormFieldInfo meta={field.state.meta} />
    </FormFieldWrapper>
  );
};
