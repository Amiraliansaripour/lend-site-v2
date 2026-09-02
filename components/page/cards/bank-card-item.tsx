'use client';

import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import type { BankCard } from '@/types/cards';

import { BankCardPreview } from './bank-card-preview';

type BankCardItemProps = {
  card: BankCard;
  onEdit: (card: BankCard) => void;
  onDelete: (card: BankCard) => void;
};

export function BankCardItem({ card, onEdit, onDelete }: BankCardItemProps) {
  return (
    <Card className='group overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
      <CardContent className='p-0'>
        <BankCardPreview
          cardNumber={card.cardNumber}
          cvv2={card.cvv2}
          expiryDate={card.expiryDate}
          bankName={card.bankName}
          masked
          className='rounded-none shadow-none'
        />

        <div className='flex items-center justify-end gap-2 p-3'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='gap-2'
            onClick={() => onEdit(card)}
          >
            <Pencil className='size-4' />
            ویرایش
          </Button>

          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='gap-2 text-destructive hover:text-destructive'
            onClick={() => onDelete(card)}
          >
            <Trash2 className='size-4' />
            حذف
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
