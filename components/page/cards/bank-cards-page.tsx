'use client';

import { useState } from 'react';

import { CreditCard, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useUserCards } from '@/queries/cards';
import { useDeleteCard } from '@/mutations/cards';

import type { BankCard } from '@/types/cards';

import { BankCardForm } from './bank-card-form';
import { BankCardItem } from './bank-card-item';

export function BankCardsPage() {
  const { data: cards = [], isLoading, isFetching, refetch } = useUserCards();

  const deleteMutation = useDeleteCard();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<BankCard | null>(null);
  const [cardToDelete, setCardToDelete] = useState<BankCard | null>(null);

  const openCreateDialog = () => {
    setSelectedCard(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (card: BankCard) => {
    setSelectedCard(card);
    setIsFormOpen(true);
  };

  const closeFormDialog = () => {
    if (deleteMutation.isPending) return;

    setIsFormOpen(false);
    setSelectedCard(null);
  };

  const handleDelete = async () => {
    if (!cardToDelete?.id) return;

    const response = await deleteMutation.mutateAsync(cardToDelete.id);

    if (!response?.isSuccess) {
      toast.error(response?.message || 'خطا در حذف کارت بانکی');
      return;
    }

    toast.success('کارت بانکی با موفقیت حذف شد');
    setCardToDelete(null);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end'>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label='به‌روزرسانی'
          >
            <RefreshCw className={isFetching ? 'size-4 animate-spin' : 'size-4'} />
          </Button>

          <Button type='button' onClick={openCreateDialog} className='gap-2'>
            <Plus className='size-4' />
            افزودن کارت
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className='flex min-h-90 items-center justify-center rounded-2xl border bg-card'>
          <div className='flex flex-col items-center gap-3 text-muted-foreground'>
            <Loader2 className='size-8 animate-spin' />
            <span className='text-sm'>در حال دریافت کارت‌ها...</span>
          </div>
        </div>
      )}

      {!isLoading && cards.length === 0 && (
        <div className='flex min-h-105 flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 text-center'>
          <div className='flex size-20 items-center justify-center rounded-3xl bg-primary/10'>
            <CreditCard className='size-9 text-primary' />
          </div>

          <h2 className='mt-6 text-lg font-bold'>هنوز کارتی ثبت نکرده‌اید</h2>

          <p className='mt-2 max-w-md text-sm leading-6 text-muted-foreground'>
            برای شروع، اولین کارت بانکی خود را اضافه کنید.
          </p>

          <Button type='button' className='mt-6 gap-2' onClick={openCreateDialog}>
            <Plus className='size-4' />
            افزودن کارت
          </Button>
        </div>
      )}

      {!isLoading && cards.length > 0 && (
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
          {cards.map(card => (
            <BankCardItem
              key={card.id}
              card={card}
              onEdit={openEditDialog}
              onDelete={setCardToDelete}
            />
          ))}
        </div>
      )}

      <Dialog
        open={isFormOpen}
        onOpenChange={open => {
          if (!open) {
            closeFormDialog();
          }
        }}
      >
        <DialogContent dir='rtl' className='max-h-[95vh] overflow-y-auto sm:max-w-140'>
          <DialogHeader className='items-start pl-10 text-right sm:text-right'>
            <DialogTitle>{selectedCard ? 'ویرایش کارت بانکی' : 'افزودن کارت بانکی'}</DialogTitle>

            <DialogDescription>اطلاعات کارت بانکی خود را وارد کنید.</DialogDescription>
          </DialogHeader>

          <BankCardForm
            key={selectedCard?.id ?? 'create'}
            card={selectedCard}
            onSuccess={closeFormDialog}
            onCancel={closeFormDialog}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(cardToDelete)}
        onOpenChange={open => {
          if (!open && !deleteMutation.isPending) {
            setCardToDelete(null);
          }
        }}
      >
        <AlertDialogContent dir='rtl'>
          <AlertDialogHeader className='items-end text-right sm:text-right'>
            <AlertDialogTitle className='flex items-center gap-2'>
              <Trash2 className='size-5 text-destructive' />
              حذف کارت بانکی
            </AlertDialogTitle>

            <AlertDialogDescription>
              آیا از حذف این کارت بانکی اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>انصراف</AlertDialogCancel>

            <AlertDialogAction
              onClick={event => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={deleteMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteMutation.isPending && <Loader2 className='ml-2 size-4 animate-spin' />}
              حذف کارت
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
