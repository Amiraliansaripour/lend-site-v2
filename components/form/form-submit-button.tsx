import { useStore } from '@tanstack/react-form';

import { cn } from '@/lib/utils';

import { useFormContext } from '@/components/form';

import { Button, buttonVariants } from '@/components/ui/button';

import { Ring } from 'ldrs/react';
import 'ldrs/react/Ring.css';

import type { VariantProps } from 'class-variance-authority';

type SubmitButtonProps = {
  size?: VariantProps<typeof buttonVariants>['size'];
  className?: string;
  noSpinner?: boolean;
  disabled?: boolean;
  children: React.ReactNode | ((isSubmitting: boolean) => React.ReactNode);
};

export const SubmitButton = ({
  children,
  className,
  disabled,
  noSpinner,
  ...props
}: SubmitButtonProps) => {
  const form = useFormContext();

  const [isSubmitting, canSubmit] = useStore(form.store, state => [
    state.isSubmitting,
    state.canSubmit,
  ]);

  return (
    <Button
      type='submit'
      disabled={disabled || isSubmitting || !canSubmit}
      className={cn('w-full relative cursor-pointer mt-4', className)}
      {...props}
    >
      {typeof children === 'function' ? (
        children(isSubmitting)
      ) : (
        <>
          {children}

          {!noSpinner && isSubmitting && (
            <span className='flex items-center absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2'>
              <Ring size='20' stroke='2' bgOpacity='0' speed='2' color='#ffffff' />
            </span>
          )}
        </>
      )}
    </Button>
  );
};
