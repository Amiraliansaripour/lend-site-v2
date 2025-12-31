import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import { compact, type CompactOptions } from '@/utils/format';

import { CopyButton } from '@/components/copy-button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type CompactorProps = CompactOptions & {
  children: string | number;
  className?: string;
};

export const Compactor = ({ children, className, ...options }: CompactorProps) => {
  const [compacted, hasBeenCompacted] = useMemo<[string, boolean]>(() => {
    const input = String(children);
    const compacted = compact(input, options);
    return [compacted, input.length !== compacted.length];
  }, [children, options]);

  if (!hasBeenCompacted) return <div>{children}</div>;

  return (
    <div className={cn('flex items-center gap-x-2', className)}>
      <Tooltip>
        <TooltipTrigger>{compacted}</TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
      <CopyButton variant='ghost' text={children} />
    </div>
  );
};
