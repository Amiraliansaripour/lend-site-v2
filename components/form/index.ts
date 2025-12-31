import { createFormHook, createFormHookContexts, type FormOptions } from '@tanstack/react-form';

import { SwitchField } from './form-switch';
import { SliderField } from './form-slider';
import { NumField } from './form-num-field';
import { SelectField } from './form-select';
import { TextField } from './form-text-field';
import { TextareaField } from './form-textarea';
import { CheckboxField } from './form-checkbox';
import { DatePickerField } from './form-date-picker';
import { FileUploadField } from './form-file-upload';
import { RadioGroupField } from './form-radio-group';
import { PasswordField } from './form-password-field';
import { MaskTextField } from './form-mask-text-field';
import { MultiSelectField } from './form-multi-select';
import { DatetimePickerField } from './form-datetime-picker';

import { SubmitButton } from './form-submit-button';

const { fieldContext, useFieldContext, formContext, useFormContext } = createFormHookContexts();

const { useAppForm: useUntypedAppForm } = createFormHook({
  fieldComponents: {
    NumField,
    TextField,
    PasswordField,
    MaskTextField,
    TextareaField,
    CheckboxField,
    RadioGroupField,
    FileUploadField,
    SelectField,
    MultiSelectField,
    SliderField,
    SwitchField,
    DatePickerField,
    DatetimePickerField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

export const useAppForm = <TFormData>(
  props: FormOptions<TFormData, any, any, any, any, any, any, any, any, any, any, any>,
) => {
  return useUntypedAppForm(props);
};

export { useFieldContext, useFormContext };
