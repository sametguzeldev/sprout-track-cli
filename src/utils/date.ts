import { format, parseISO, formatDistanceToNow, isValid } from 'date-fns';

/**
 * Get current time as ISO8601 string
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Parse a date string and return ISO8601 format
 * Accepts: ISO8601, YYYY-MM-DD, or relative strings like "now"
 */
export function parseDate(input: string): string {
  if (input.toLowerCase() === 'now') {
    return now();
  }

  // Try parsing as ISO8601 first
  const isoDate = parseISO(input);
  if (isValid(isoDate)) {
    return isoDate.toISOString();
  }

  // Try parsing as date only (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const date = new Date(input + 'T00:00:00');
    if (isValid(date)) {
      return date.toISOString();
    }
  }

  throw new Error(`Invalid date format: ${input}. Use ISO8601 format (e.g., 2024-01-15T14:30:00Z) or YYYY-MM-DD`);
}

/**
 * Format a date for display
 */
export function formatDate(dateStr: string, formatStr: string = 'yyyy-MM-dd HH:mm'): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) {
    return dateStr;
  }
  return format(date, formatStr);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelative(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) {
    return dateStr;
  }
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format duration in minutes to human readable string
 */
export function formatDuration(minutes: number | null): string {
  if (minutes === null || minutes === undefined) {
    return '-';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Format duration in seconds to human readable string
 */
export function formatDurationSeconds(seconds: number | null): string {
  if (seconds === null || seconds === undefined) {
    return '-';
  }
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }
  return `${secs}s`;
}

/**
 * Get start of day as ISO8601
 */
export function startOfDay(dateStr?: string): string {
  const date = dateStr ? parseISO(dateStr) : new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/**
 * Get end of day as ISO8601
 */
export function endOfDay(dateStr?: string): string {
  const date = dateStr ? parseISO(dateStr) : new Date();
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

/**
 * Validate that a string is a valid date
 */
export function isValidDate(input: string): boolean {
  if (input.toLowerCase() === 'now') return true;
  const date = parseISO(input);
  return isValid(date);
}

/**
 * Get date only (YYYY-MM-DD) from ISO string
 */
export function toDateOnly(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) {
    return dateStr;
  }
  return format(date, 'yyyy-MM-dd');
}
