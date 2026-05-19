import type { JSX } from 'react';

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  icon: JSX.Element;
};

type FaqProps = {
  items: FaqItem[];
  defaultValue?: string;
  markup?: boolean | 'question' | 'answer';
};

export function Faq({ items, markup, defaultValue }: FaqProps) {
  const isAnswerMarkup = markup === true || markup === 'answer';
  const isQuestionMarkup = markup === true || markup === 'question';

  return (
    <Accordion
      collapsible
      type='single'
      defaultValue={defaultValue}
      className='faq w-full space-y-4'
    >
      {items.map(({ id, icon, question, answer }) => (
        <AccordionItem key={id} value={id} className='transition-colors shadow-md rounded-md'>
          <AccordionTrigger className='items-center gap-x-2 px-6 hover:no-underline cursor-pointer'>
            <span data-slot='icon'>{icon}</span>

            {isQuestionMarkup ? (
              <div
                className='grow text-base rtl:text-right me-4'
                dangerouslySetInnerHTML={{ __html: question }}
              />
            ) : (
              <span className='grow text-base rtl:text-right me-4'>{question}</span>
            )}
          </AccordionTrigger>

          <AccordionContent className='flex flex-col gap-4 text-balance text-base px-6'>
            {isAnswerMarkup ? (
              <div dangerouslySetInnerHTML={{ __html: answer }} />
            ) : (
              <p>{answer}</p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
