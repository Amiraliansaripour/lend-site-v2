import { useRef, useState, useEffect } from 'react';

import { toast } from 'sonner';

import { Copy, Check } from 'lucide-react';

import { log } from '@/lib/log';
import { cn } from '@/lib/utils';

import { Button, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';

type CopyButtonProps = {
  variant?: VariantProps<typeof buttonVariants>['variant'];
  text: string | number;
  className?: string;
  onCopy?: () => void;
};

export const CopyButton = ({ text, variant = 'outline', className, onCopy }: CopyButtonProps) => {
  const [copied, setCopied] = useState<boolean>(false);
  const timerId = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleCopy = () => {
    if (!('clipboard' in navigator)) {
      return toast.error('Your browser does not support copying content');
    }

    navigator.clipboard
      .writeText(String(text))
      .then(() => {
        setCopied(true);
        onCopy?.();
      })
      .catch(err => {
        log.error(err);
        toast.error('Failed copying content');
      });
  };

  useEffect(() => {
    if (!copied) {
      clearTimeout(timerId.current);
      timerId.current = undefined;
      return;
    }

    timerId.current = setTimeout(() => setCopied(false), 1_000);
  }, [copied]);

  return (
    <Button
      size='icon'
      variant={variant}
      onClick={handleCopy}
      className={cn('shrink-0', className)}
    >
      {copied ? <Check /> : <Copy />}
      <span className='sr-only'>copy</span>
    </Button>
  );
};
