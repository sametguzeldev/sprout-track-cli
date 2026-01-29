import { ValidationError } from './errors.js';
import type {
  Gender,
  SleepType,
  SleepQuality,
  FeedType,
  BreastSide,
  DiaperType,
  MilestoneCategory,
  MeasurementType,
  CalendarEventType,
  OutputFormat,
} from '../types/index.js';

/**
 * Validate and parse a required string
 */
export function requireString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`${name} is required`);
  }
  return value.trim();
}

/**
 * Validate and parse an optional string
 */
export function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * Validate and parse a required number
 */
export function requireNumber(value: unknown, name: string): number {
  const num = Number(value);
  if (isNaN(num)) {
    throw new ValidationError(`${name} must be a valid number`);
  }
  return num;
}

/**
 * Validate and parse an optional number
 */
export function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

/**
 * Validate and parse a boolean
 */
export function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'yes') return true;
    if (lower === 'false' || lower === '0' || lower === 'no') return false;
  }
  return false;
}

/**
 * Validate gender enum
 */
export function validateGender(value: string): Gender {
  const upper = value.toUpperCase();
  if (upper !== 'MALE' && upper !== 'FEMALE') {
    throw new ValidationError(`Invalid gender: ${value}. Must be MALE or FEMALE`);
  }
  return upper as Gender;
}

/**
 * Validate sleep type enum
 */
export function validateSleepType(value: string): SleepType {
  const upper = value.toUpperCase().replace('-', '_');
  if (upper !== 'NAP' && upper !== 'NIGHT_SLEEP') {
    throw new ValidationError(`Invalid sleep type: ${value}. Must be NAP or NIGHT_SLEEP`);
  }
  return upper as SleepType;
}

/**
 * Validate sleep quality enum
 */
export function validateSleepQuality(value: string): SleepQuality {
  const upper = value.toUpperCase();
  const valid: SleepQuality[] = ['POOR', 'FAIR', 'GOOD', 'EXCELLENT'];
  if (!valid.includes(upper as SleepQuality)) {
    throw new ValidationError(`Invalid sleep quality: ${value}. Must be one of: ${valid.join(', ')}`);
  }
  return upper as SleepQuality;
}

/**
 * Validate feed type enum
 */
export function validateFeedType(value: string): FeedType {
  const upper = value.toUpperCase();
  if (upper !== 'BREAST' && upper !== 'BOTTLE' && upper !== 'SOLIDS') {
    throw new ValidationError(`Invalid feed type: ${value}. Must be BREAST, BOTTLE, or SOLIDS`);
  }
  return upper as FeedType;
}

/**
 * Validate breast side enum
 */
export function validateBreastSide(value: string): BreastSide {
  const upper = value.toUpperCase();
  if (upper !== 'LEFT' && upper !== 'RIGHT') {
    throw new ValidationError(`Invalid breast side: ${value}. Must be LEFT or RIGHT`);
  }
  return upper as BreastSide;
}

/**
 * Validate diaper type enum
 */
export function validateDiaperType(value: string): DiaperType {
  const upper = value.toUpperCase();
  if (upper !== 'WET' && upper !== 'DIRTY' && upper !== 'BOTH') {
    throw new ValidationError(`Invalid diaper type: ${value}. Must be WET, DIRTY, or BOTH`);
  }
  return upper as DiaperType;
}

/**
 * Validate milestone category enum
 */
export function validateMilestoneCategory(value: string): MilestoneCategory {
  const upper = value.toUpperCase();
  const valid: MilestoneCategory[] = ['MOTOR', 'COGNITIVE', 'SOCIAL', 'LANGUAGE', 'CUSTOM'];
  if (!valid.includes(upper as MilestoneCategory)) {
    throw new ValidationError(`Invalid milestone category: ${value}. Must be one of: ${valid.join(', ')}`);
  }
  return upper as MilestoneCategory;
}

/**
 * Validate measurement type enum
 */
export function validateMeasurementType(value: string): MeasurementType {
  const upper = value.toUpperCase().replace('-', '_');
  const valid: MeasurementType[] = ['HEIGHT', 'WEIGHT', 'HEAD_CIRCUMFERENCE', 'TEMPERATURE'];
  if (!valid.includes(upper as MeasurementType)) {
    throw new ValidationError(`Invalid measurement type: ${value}. Must be one of: ${valid.join(', ')}`);
  }
  return upper as MeasurementType;
}

/**
 * Validate calendar event type enum
 */
export function validateCalendarEventType(value: string): CalendarEventType {
  const upper = value.toUpperCase().replace('-', '_');
  const valid: CalendarEventType[] = ['APPOINTMENT', 'CARETAKER_SCHEDULE', 'REMINDER', 'CUSTOM'];
  if (!valid.includes(upper as CalendarEventType)) {
    throw new ValidationError(`Invalid event type: ${value}. Must be one of: ${valid.join(', ')}`);
  }
  return upper as CalendarEventType;
}

/**
 * Validate output format
 */
export function validateOutputFormat(value: string): OutputFormat {
  const lower = value.toLowerCase();
  if (lower !== 'json' && lower !== 'table' && lower !== 'plain') {
    throw new ValidationError(`Invalid output format: ${value}. Must be json, table, or plain`);
  }
  return lower as OutputFormat;
}

/**
 * Validate URL format
 */
export function validateUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error();
    }
    return url.origin;
  } catch {
    throw new ValidationError(`Invalid URL: ${value}. Must be a valid HTTP/HTTPS URL`);
  }
}

/**
 * Validate PIN format (numeric string)
 */
export function validatePin(value: string): string {
  if (!/^\d+$/.test(value)) {
    throw new ValidationError('PIN must contain only digits');
  }
  return value;
}

/**
 * Validate email format
 */
export function validateEmail(value: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new ValidationError(`Invalid email format: ${value}`);
  }
  return value.toLowerCase();
}

/**
 * Validate UUID format
 */
export function validateUuid(value: string, name: string = 'ID'): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  // Also accept CUIDs which don't follow UUID format
  const cuidRegex = /^c[a-z0-9]{24,}$/i;
  if (!uuidRegex.test(value) && !cuidRegex.test(value)) {
    throw new ValidationError(`Invalid ${name}: ${value}`);
  }
  return value;
}
