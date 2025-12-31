import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type EditorActionButtonProps = Omit<React.ComponentProps<'button'>, 'type'> & {
  action: string;
  isActive?: boolean;
};

export function EditorActionButton({
  action,
  isActive,
  children,
  className,
  ...props
}: EditorActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className={cn(isActive && 'bg-muted', className)}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{action}</TooltipContent>
    </Tooltip>
  );
}
