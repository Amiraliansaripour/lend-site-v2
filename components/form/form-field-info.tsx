import type { ZodError } from 'zod';
import type { AnyFieldMeta } from '@tanstack/react-form';

import { cn } from '@/lib/utils';

type FormFieldInfoProps = React.ComponentProps<'div'> & { meta: AnyFieldMeta };

export const FormFieldInfo = ({ meta, className }: FormFieldInfoProps) => {
  if (!meta.isTouched || meta.isValid) return null;

  const error: ZodError = meta.errors[0];
  if (!error) return null;

  return (
    <div className={cn('flex flex-col gap-y-1 text-sm -mt-1', className)}>
      <p className='text-destructive'>{error.message}</p>
    </div>
  );
};
