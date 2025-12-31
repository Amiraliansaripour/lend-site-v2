import { hasLocale } from 'next-intl';
import { defineRouting } from 'next-intl/routing';

export type Direction = 'ltr' | 'rtl';

export type Locale = (typeof routing.locales)[number];

export const routing = defineRouting({
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  localeDetection: false,
});

const RTL_LOCALES: Set<Locale> = new Set(['fa']);

export const dirFor = (maybeLocale: string): Direction => {
  if (!hasLocale(routing.locales, maybeLocale)) {
    return dirFor(routing.defaultLocale);
  }

  return RTL_LOCALES.has(maybeLocale) ? 'rtl' : 'ltr';
};

export const isLocale = (maybeLocale: string) => {
  return hasLocale(routing.locales, maybeLocale);
};
