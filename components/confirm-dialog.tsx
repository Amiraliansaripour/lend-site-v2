import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';

type CofirmDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  children?: React.ReactNode;
  onConfirm?: () => unknown | Promise<unknown>;
  onAfterConfirm?: () => void;
};

export function ConfirmDialog({
  open,
  setOpen,
  title,
  description = 'توجه کنید این عملیات غیرقابل بازگشت می باشد.',
  confirmText = 'تایید',
  cancelText = 'لغو',
  onConfirm,
  onAfterConfirm,
  isPending = false,
  children = null,
}: CofirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm?.();
    setOpen(false);
    onAfterConfirm?.();
  };

  const handelCancel = () => {
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent
        dir='rtl'
        className='overflow-hidden text-right grid grid-rows-[auto_1fr_auto] max-h-[min(calc(100dvh-64px),600px)]'
      >
        <AlertDialogHeader>
          <AlertDialogTitle className='text-right'>{title}</AlertDialogTitle>
          {!!description && (
            <AlertDialogDescription className='text-right'>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {children != null && (
          <ScrollArea className='min-h-full max-h-full overflow-hidden'>{children}</ScrollArea>
        )}
        <AlertDialogFooter>
          <Button disabled={isPending} size='sm' variant='destructive' onClick={handelCancel}>
            {cancelText}
          </Button>
          <Button disabled={isPending} size='sm' variant='secondary' onClick={handleConfirm}>
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
