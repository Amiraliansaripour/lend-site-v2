'use client';

import { useMemo, useState } from 'react';
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

function FaqSkeleton() {
  return (
    <div className='space-y-2.5'>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className='h-14 rounded-2xl border border-border/60 faq-shimmer' />
      ))}
    </div>
  );
}

type FaqProps = {
  className?: string;
};

export function Faq({ className }: FaqProps) {
  const { withBrand } = useSiteTemplate();
  const { data, isLoading, isError } = useFaqs();
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);

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
    <section className={cn('faq relative', className)}>
      <div className='mb-8 flex flex-col items-start gap-5 md:mb-10'>
        <div className='text-right'>
          <p className='mb-2 text-[11px] tracking-[0.28em] text-muted-foreground'>FAQ</p>
          <h2 className='text-2xl font-bold md:text-3xl'>سوالات متداول</h2>
        </div>

        {categories.length > 0 && (
          <nav className='flex max-w-full items-center justify-start gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            <CategoryChip
              label='همه'
              active={activeCategory === ALL_CATEGORY}
              onClick={() => setActiveCategory(ALL_CATEGORY)}
            />
            {categories.map(category => (
              <CategoryChip
                key={category}
                label={category}
                active={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              />
            ))}
          </nav>
        )}
      </div>

      {isLoading ? (
        <FaqSkeleton />
      ) : isError ? (
        <div className='rounded-3xl border border-rose-200 bg-rose-50 px-5 py-8 text-center text-rose-700'>
          دریافت سوالات متداول با مشکل مواجه شد. لطفاً دوباره تلاش کنید.
        </div>
      ) : filteredItems.length === 0 ? (
        <div className='rounded-3xl border border-dashed px-5 py-10 text-center text-muted-foreground'>
          سوالی برای نمایش پیدا نشد.
        </div>
      ) : (
        <Accordion key={activeCategory} type='single' collapsible className='space-y-2.5'>
          {filteredItems.map((item, index) => (
            <FaqQuestionItem
              key={item.id}
              item={item}
              index={index}
              title={withBrand(item.question)}
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
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-4 py-1.5 text-sm transition-all duration-300',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground',
      )}
    >
      {label}
    </button>
  );
}

function FaqQuestionItem({ item, index, title }: { item: FaqItem; index: number; title: string }) {
  const { withBrand } = useSiteTemplate();
  const answers = sortAnswers(item.answers);
  const category = (item.category || 'سایر').trim() || 'سایر';

  return (
    <AccordionItem
      value={item.id}
      className='faq-item group overflow-hidden rounded-2xl border border-border/80 bg-background transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)] data-[state=open]:border-primary/40 data-[state=open]:bg-muted/50 data-[state=open]:shadow-[0_6px_20px_-14px_rgba(15,23,42,0.18)]'
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <AccordionTrigger className='items-center gap-3 px-3.5 py-2.5 hover:no-underline cursor-pointer md:px-4 [&>svg:last-child]:hidden'>
        <span className='grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-[12px] font-semibold tabular-nums text-primary transition-colors duration-300 group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground'>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className='min-w-0 flex-1 text-right text-[15px] font-medium leading-6 md:text-base'>
          {title}
        </span>
        <span className='hidden shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground sm:inline-flex'>
          {category}
        </span>
        <span className='relative grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-all duration-300 group-data-[state=open]:border-primary group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground'>
          <Plus className='size-3.5 transition-all duration-300 group-data-[state=open]:scale-0 group-data-[state=open]:opacity-0' />
          <Minus className='absolute size-3.5 scale-0 opacity-0 transition-all duration-300 group-data-[state=open]:scale-100 group-data-[state=open]:opacity-100' />
        </span>
      </AccordionTrigger>
      <AccordionContent className='px-3.5 pb-3.5 md:px-4'>
        <div className='mr-11 space-y-3 border-t border-border/30 pt-3'>
          {answers.length === 0 ? (
            <p className='text-sm text-muted-foreground'>پاسخی برای این سوال ثبت نشده است.</p>
          ) : (
            answers.map(answer => (
              <div key={answer.id} className='space-y-1'>
                {answers.length > 1 && (
                  <p className='text-[11px] font-medium text-primary/80'>
                    {answer.isPrimary ? 'پاسخ اصلی' : 'پاسخ دیگر'}
                  </p>
                )}
                <p className='text-sm leading-7 text-foreground/80 md:text-[15px]'>
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
