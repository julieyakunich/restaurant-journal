/** Parse a `YYYY-MM-DD` (or ISO) string as a LOCAL date, avoiding the
 * UTC-midnight off-by-one when only a date is given. */
export function parseDate(value: string): Date {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  return new Date(dateOnly ? `${value}T00:00:00` : value);
}

export function formatMonthYear(value: string): string {
  return parseDate(value).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortMonthYear(value: string): string {
  return parseDate(value).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${parseDate(start).toLocaleDateString(undefined, opts)} – ${parseDate(
    end,
  ).toLocaleDateString(undefined, opts)}`;
}
