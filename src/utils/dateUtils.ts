/**
 * Utility functions for local timezone YYYY-MM-DD date calculations.
 * Avoids UTC timezone offsets introduced by Date.prototype.toISOString().
 */

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowLocalDateString(fromDate: Date = new Date()): string {
  const tomorrow = new Date(fromDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getLocalDateString(tomorrow);
}

export function getPastLocalDateString(daysAgo: number, fromDate: Date = new Date()): string {
  const past = new Date(fromDate);
  past.setDate(past.getDate() - daysAgo);
  return getLocalDateString(past);
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function addDaysToDateStr(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return getLocalDateString(d);
}
