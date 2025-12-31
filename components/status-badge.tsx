import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';

export const BADGE_VARIANTS = {
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  error: 'bg-destructive/20 text-destructive',
  info: 'bg-info/20 text-info',
} as const;

// * types
export type StatusBadgeVariant = keyof typeof BADGE_VARIANTS;

type StatusBadgeProps = {
  variant: StatusBadgeVariant;
  children: React.ReactNode;
  className?: string;
};

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <Badge
      variant='outline'
      className={cn('gap-x-1 capitalize', className, BADGE_VARIANTS[variant])}
    >
      {children}
    </Badge>
  );
}
