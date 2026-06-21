/** Returns YYYY-MM-DD for a Date in local time (not UTC) — matches what a date input shows the user. */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayDateString(): string {
  return toDateString(new Date());
}

/** Monday-start week containing `date`, as 7 YYYY-MM-DD strings. */
export function currentWeekDates(date: Date = new Date()): string[] {
  const day = date.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(date);
  monday.setDate(monday.getDate() - diffToMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return toDateString(d);
  });
}

export function weekdayLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2);
}

export function dayOfMonth(dateStr: string): number {
  return Number(dateStr.slice(8, 10));
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Full month name, 1-indexed (1 = January). */
export function monthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? '';
}

/** 3-letter month abbreviation, 1-indexed (1 = Jan). */
export function monthAbbr(month: number): string {
  return MONTH_ABBR[month - 1] ?? '';
}

/** Number of days in the given month (1-indexed) of the given year. */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
