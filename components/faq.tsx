'use client';

import { useMemo, useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useFaqs } from '@/queries/faq';
import { useSiteTemplate } from '@/providers/site-template';
import type { FaqAnswer, FaqItem } from '@/api/faq';

const ALL_CATEGORY = '__all__';

function sortAnswers(answers: FaqAnswer[] = []) {
  return [...answers].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
}

function FaqSkeleton({ landing }: { landing?: boolean }) {
  return (
    <div className='space-y-2.5'>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-14 rounded-2xl border faq-shimmer',
            landing ? 'border-white/10 bg-white/5' : 'border-border/60',
          )}
        />
      ))}
    </div>
  );
}

type FaqProps = {
  className?: string;
  variant?: 'default' | 'landing';
};

export function Faq({ className, variant = 'default' }: FaqProps) {
  const landing = variant === 'landing';
  const { withBrand } = useSiteTemplate();
  const { data, isLoading, isError } = useFaqs();
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [openItem, setOpenItem] = useState('');

  useEffect(() => {
    setOpenItem('');
  }, [activeCategory]);

  const items = useMemo(
    () =>
      (data ?? [])
        .filter(item => item.isActive !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [data],
  );

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const item of items) {
      const category = (item.category || 'سایر').trim() || 'سایر';
      seen.add(category);
    }
    return Array.from(seen);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const category = (item.category || 'سایر').trim() || 'سایر';
      return activeCategory === ALL_CATEGORY || category === activeCategory;
    });
  }, [items, activeCategory]);

  return (
    <section className={cn('faq relative', landing && 'landing-faq', className)}>
      <div className='mb-8 flex flex-col items-start gap-5 md:mb-10'>
        <div className='text-right'>
          <p
            className={cn(
              'mb-2 text-[11px] tracking-[0.28em]',
              landing ? 'text-navy/50 dark:text-gold' : 'text-muted-foreground',
            )}
          >
            FAQ
          </p>
          <h2
            className={cn(
              'text-2xl font-bold md:text-3xl',
              landing ? 'text-navy dark:text-white' : 'text-foreground',
            )}
          >
            سوالات متداول
          </h2>
        </div>

        {categories.length > 0 && (
          <nav className='flex max-w-full items-center justify-start gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            <CategoryChip
              landing={landing}
              label='همه'
              active={activeCategory === ALL_CATEGORY}
              onClick={() => setActiveCategory(ALL_CATEGORY)}
            />
            {categories.map(category => (
              <CategoryChip
                key={category}
                landing={landing}
                label={category}
                active={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              />
            ))}
          </nav>
        )}
      </div>

      {isLoading ? (
        <FaqSkeleton landing={landing} />
      ) : isError ? (
        <div
          className={cn(
            'rounded-3xl border px-5 py-8 text-center',
            landing
              ? 'border-rose-300/50 bg-rose-50 text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200'
              : 'border-rose-200 bg-rose-50 text-rose-700',
          )}
        >
          دریافت سوالات متداول با مشکل مواجه شد. لطفاً دوباره تلاش کنید.
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          className={cn(
            'rounded-3xl border border-dashed px-5 py-10 text-center',
            landing
              ? 'border-navy/20 text-navy/55 dark:border-white/20 dark:text-white/55'
              : 'text-muted-foreground',
          )}
        >
          سوالی برای نمایش پیدا نشد.
        </div>
      ) : (
        <Accordion
          type='single'
          collapsible
          value={openItem}
          onValueChange={setOpenItem}
          className='space-y-2.5'
        >
          {filteredItems.map((item, index) => (
            <FaqQuestionItem
              key={item.id}
              item={item}
              index={index}
              title={withBrand(item.question)}
              landing={landing}
            />
          ))}
        </Accordion>
      )}
    </section>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
  landing,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  landing?: boolean;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-4 py-1.5 text-sm transition-all duration-300',
        landing
          ? active
            ? 'border-gold bg-gold text-navy'
            : 'border-navy/15 bg-navy/5 text-navy/65 hover:border-gold/50 hover:text-navy dark:border-white/15 dark:bg-white/5 dark:text-white/65 dark:hover:border-gold/40 dark:hover:text-gold'
          : active
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground',
      )}
    >
      {label}
    </button>
  );
}

function FaqQuestionItem({
  item,
  index,
  title,
  landing,
}: {
  item: FaqItem;
  index: number;
  title: string;
  landing?: boolean;
}) {
  const { withBrand } = useSiteTemplate();
  const answers = sortAnswers(item.answers);
  const category = (item.category || 'سایر').trim() || 'سایر';

  return (
    <AccordionItem
      value={item.id}
      className={cn(
        'faq-item group overflow-hidden rounded-2xl border transition-all duration-300',
        landing
          ? 'border-navy/10 bg-white/70 hover:border-gold/40 data-[state=open]:border-gold/50 data-[state=open]:bg-white dark:border-white/12 dark:bg-white/5 dark:hover:border-gold/35 dark:data-[state=open]:border-gold/40 dark:data-[state=open]:bg-white/8'
          : 'border-border/80 bg-background hover:border-primary/25 hover:shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)] data-[state=open]:border-primary/40 data-[state=open]:bg-muted/50 data-[state=open]:shadow-[0_6px_20px_-14px_rgba(15,23,42,0.18)]',
      )}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <AccordionTrigger className='cursor-pointer items-center gap-3 px-3.5 py-2.5 hover:no-underline md:px-4 [&>svg:last-child]:hidden'>
        <span
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-lg text-[12px] font-semibold tabular-nums transition-colors duration-300',
            landing
              ? 'bg-gold/20 text-navy group-data-[state=open]:bg-gold group-data-[state=open]:text-navy dark:bg-gold/15 dark:text-gold'
              : 'bg-primary/10 text-primary group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground',
          )}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span
          className={cn(
            'min-w-0 flex-1 text-right text-[15px] font-medium leading-6 md:text-base',
            landing && 'text-navy dark:text-white',
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            'hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] sm:inline-flex',
            landing
              ? 'bg-navy/5 text-navy/50 dark:bg-white/10 dark:text-white/50'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {category}
        </span>
        <span
          className={cn(
            'relative grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-300',
            landing
              ? 'border-navy/15 text-navy/55 group-data-[state=open]:border-gold group-data-[state=open]:bg-gold group-data-[state=open]:text-navy dark:border-white/20 dark:text-white/60'
              : 'border-border text-muted-foreground group-data-[state=open]:border-primary group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground',
          )}
        >
          <Plus className='size-3.5 transition-all duration-300 group-data-[state=open]:scale-0 group-data-[state=open]:opacity-0' />
          <Minus className='absolute size-3.5 scale-0 opacity-0 transition-all duration-300 group-data-[state=open]:scale-100 group-data-[state=open]:opacity-100' />
        </span>
      </AccordionTrigger>
      <AccordionContent className='px-3.5 pb-3.5 md:px-4'>
        <div
          className={cn(
            'mr-11 space-y-3 border-t pt-3',
            landing ? 'border-navy/10 dark:border-white/10' : 'border-border/30',
          )}
        >
          {answers.length === 0 ? (
            <p
              className={cn(
                'text-sm',
                landing ? 'text-navy/50 dark:text-white/50' : 'text-muted-foreground',
              )}
            >
              پاسخی برای این سوال ثبت نشده است.
            </p>
          ) : (
            answers.map(answer => (
              <div key={answer.id} className='space-y-1'>
                {answers.length > 1 && (
                  <p
                    className={cn(
                      'text-[11px] font-medium',
                      landing ? 'text-navy/70 dark:text-gold/80' : 'text-primary/80',
                    )}
                  >
                    {answer.isPrimary ? 'پاسخ اصلی' : 'پاسخ دیگر'}
                  </p>
                )}
                <p
                  className={cn(
                    'text-sm leading-7 md:text-[15px]',
                    landing ? 'text-navy/70 dark:text-white/70' : 'text-foreground/80',
                  )}
                >
                  {withBrand(answer.answerText)}
                </p>
              </div>
            ))
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
