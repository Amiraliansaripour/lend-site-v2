'use client';

import { Pencil, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
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
    <Card
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-0',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out',
        'hover:-translate-y-1.5 hover:border-border hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.25)]',
      )}
    >
      {/* ambient glow that only appears on hover, echoing the card's own gradient */}
      <div
        className='pointer-events-none absolute inset-0 -z-10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40'
        style={{
          background:
            'radial-gradient(120px circle at 30% 20%, var(--primary) 0%, transparent 70%)',
        }}
      />

      <CardContent className='p-0'>
        <BankCardPreview
          cardNumber={card.cardNumber}
          cvv2={card.cvv2}
          expiryDate={card.expiryDate}
          bankName={card.bankName}
          masked
          className='rounded-none shadow-none'
        />

        <div className='flex items-center justify-between gap-2 border-t border-border/50 bg-muted/30 px-3 py-2'>
          <span className='px-1 text-xs text-muted-foreground'>{card.bankName}</span>

          <div className='flex items-center gap-1'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-8 gap-1.5 rounded-lg px-2.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary'
              onClick={() => onEdit(card)}
            >
              <Pencil className='size-3.5' />
              ویرایش
            </Button>

            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-8 gap-1.5 rounded-lg px-2.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
              onClick={() => onDelete(card)}
            >
              <Trash2 className='size-3.5' />
              حذف
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
