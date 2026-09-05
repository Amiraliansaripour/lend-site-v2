/**
 * Calendar-date helpers for date-only values (e.g. birthDate).
 * Avoids the classic UTC/local off-by-one when using toISOString() / new Date(iso).
 */

const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

/** Local calendar day at noon — stable across timezones for display & pickers. */
export const toLocalNoon = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
};

/**
 * Parse an API date string or Date into a local calendar Date at noon.
 * Uses the local calendar day of the instant (no +1/-1 hacks).
 */
export const parseCalendarDate = (value?: string | Date | null): Date | undefined => {
  if (value == null || value === '') return undefined;

  if (value instanceof Date) {
    if (!isValidDate(value)) return undefined;
    return toLocalNoon(value);
  }

  const parsed = new Date(value);
  if (!isValidDate(parsed)) return undefined;

  return toLocalNoon(parsed);
};

/**
 * Serialize a picker Date for APIs as UTC noon of the selected local day.
 * Prevents day boundary shifts on save/reload (unlike local-midnight toISOString).
 */
export const toApiDateString = (date: Date): string => {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0),
  ).toISOString();
};
