import { cn } from '@/lib/utils';

type FormFieldWrapperProps = { className?: string; children: React.ReactNode };

export const FormFieldWrapper = ({ children, className }: FormFieldWrapperProps) => {
  return <div className={cn('flex flex-col gap-y-3', className)}>{children}</div>;
};
