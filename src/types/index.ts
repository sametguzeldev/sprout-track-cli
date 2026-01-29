// Enums matching Prisma schema
export type Gender = 'MALE' | 'FEMALE';
export type SleepType = 'NAP' | 'NIGHT_SLEEP';
export type SleepQuality = 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
export type FeedType = 'BREAST' | 'BOTTLE' | 'SOLIDS';
export type BreastSide = 'LEFT' | 'RIGHT';
export type DiaperType = 'WET' | 'DIRTY' | 'BOTH';
export type UserRole = 'USER' | 'ADMIN';
export type MilestoneCategory = 'MOTOR' | 'COGNITIVE' | 'SOCIAL' | 'LANGUAGE' | 'CUSTOM';
export type MeasurementType = 'HEIGHT' | 'WEIGHT' | 'HEAD_CIRCUMFERENCE' | 'TEMPERATURE';
export type CalendarEventType = 'APPOINTMENT' | 'CARETAKER_SCHEDULE' | 'REMINDER' | 'CUSTOM';
export type RecurrencePattern = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

// API Response wrapper
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// Config types
export interface CliConfig {
  server: string;
  token?: string;
  tokenExpires?: string;
  familySlug?: string;
  defaultBabyId?: string;
  outputFormat: 'json' | 'table' | 'plain';
}

// Auth types
export interface AuthResponse {
  id: string;
  name: string;
  type: string | null;
  role: string;
  token: string;
  familyId: string | null;
  familySlug: string | null;
  isSysAdmin?: boolean;
}

export interface AccountLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    verified: boolean;
    hasFamily: boolean;
    familyId?: string;
    familySlug?: string;
  };
}

// Family types
export interface FamilyResponse {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// Baby types
export interface BabyResponse {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender | null;
  inactive: boolean;
  feedWarningTime: string;
  diaperWarningTime: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  familyId: string | null;
}

export interface BabyCreate {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender?: Gender;
  inactive?: boolean;
  feedWarningTime?: string;
  diaperWarningTime?: string;
}

export interface BabyUpdate extends Partial<BabyCreate> {
  id: string;
}

// Sleep log types
export interface SleepLogResponse {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  type: SleepType;
  location: string | null;
  quality: SleepQuality | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  babyId: string;
  caretakerId: string | null;
}

export interface SleepLogCreate {
  babyId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  type: SleepType;
  location?: string;
  quality?: SleepQuality;
}

// Feed log types
export interface FeedLogResponse {
  id: string;
  time: string;
  startTime: string | null;
  endTime: string | null;
  feedDuration: number | null;
  type: FeedType;
  amount: number | null;
  unitAbbr: string | null;
  side: BreastSide | null;
  food: string | null;
  notes: string | null;
  bottleType: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  babyId: string;
  caretakerId: string | null;
}

export interface FeedLogCreate {
  babyId: string;
  time: string;
  type: FeedType;
  amount?: number;
  unitAbbr?: string;
  side?: BreastSide;
  food?: string;
  startTime?: string;
  endTime?: string;
  feedDuration?: number;
  notes?: string;
  bottleType?: string;
}

// Diaper log types
export interface DiaperLogResponse {
  id: string;
  time: string;
  type: DiaperType;
  condition: string | null;
  color: string | null;
  blowout: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  babyId: string;
  caretakerId: string | null;
}

export interface DiaperLogCreate {
  babyId: string;
  time: string;
  type: DiaperType;
  condition?: string;
  color?: string;
  blowout?: boolean;
}

// Note types
export interface NoteResponse {
  id: string;
  time: string;
  content: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  babyId: string;
  caretakerId: string | null;
}

export interface NoteCreate {
  babyId: string;
  time: string;
  content: string;
  category?: string;
}

// Caretaker types
export interface CaretakerResponse {
  id: string;
  loginId: string;
  name: string;
  type: string | null;
  role: UserRole;
  inactive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  familyId: string | null;
}

export interface CaretakerCreate {
  loginId: string;
  name: string;
  type?: string;
  inactive?: boolean;
  securityPin: string;
  role?: UserRole;
}

export interface CaretakerUpdate extends Partial<CaretakerCreate> {
  id: string;
}

// Bath log types
export interface BathLogResponse {
  id: string;
  time: string;
  soapUsed: boolean;
  shampooUsed: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  babyId: string;
  caretakerId: string | null;
}

export interface BathLogCreate {
  babyId: string;
  time: string;
  soapUsed?: boolean;
  shampooUsed?: boolean;
  notes?: string;
}

// Pump log types
export interface PumpLogResponse {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  leftAmount: number | null;
  rightAmount: number | null;
  totalAmount: number | null;
  unitAbbr: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  babyId: string;
  caretakerId: string | null;
}

export interface PumpLogCreate {
  babyId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  leftAmount?: number;
  rightAmount?: number;
  totalAmount?: number;
  unitAbbr?: string;
  notes?: string;
}

// Milestone types
export interface MilestoneResponse {
  id: string;
  date: string;
  title: string;
  description: string | null;
  category: MilestoneCategory;
  ageInDays: number | null;
  photo: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  babyId: string;
  caretakerId: string | null;
}

export interface MilestoneCreate {
  babyId: string;
  date: string;
  title: string;
  description?: string;
  category: MilestoneCategory;
  ageInDays?: number;
  photo?: string;
}

// Measurement types
export interface MeasurementResponse {
  id: string;
  date: string;
  type: MeasurementType;
  value: number;
  unit: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  babyId: string;
  caretakerId: string | null;
}

export interface MeasurementCreate {
  babyId: string;
  date: string;
  type: MeasurementType;
  value: number;
  unit: string;
  notes?: string;
}

// Medicine types
export interface MedicineResponse {
  id: string;
  name: string;
  typicalDoseSize: number | null;
  unitAbbr: string | null;
  doseMinTime: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  familyId: string | null;
}

export interface MedicineCreate {
  name: string;
  typicalDoseSize?: number;
  unitAbbr?: string;
  doseMinTime?: string;
  notes?: string;
  active?: boolean;
  contactIds?: string[];
}

export interface MedicineUpdate extends Partial<MedicineCreate> {
  id: string;
}

// Medicine log types
export interface MedicineLogResponse {
  id: string;
  time: string;
  doseAmount: number;
  unitAbbr: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  medicineId: string;
  babyId: string;
  caretakerId: string | null;
}

export interface MedicineLogCreate {
  babyId: string;
  medicineId: string;
  time: string;
  doseAmount: number;
  unitAbbr?: string;
  notes?: string;
}

// Contact types
export interface ContactResponse {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  familyId: string | null;
}

export interface ContactCreate {
  name: string;
  role: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

// Calendar event types
export interface CalendarEventResponse {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  allDay: boolean;
  type: CalendarEventType;
  location: string | null;
  color: string | null;
  recurring: boolean;
  recurrencePattern: RecurrencePattern | null;
  recurrenceEnd: string | null;
  customRecurrence: string | null;
  reminderTime: number | null;
  notificationSent: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  familyId: string | null;
}

export interface CalendarEventCreate {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  allDay?: boolean;
  type: CalendarEventType;
  location?: string;
  color?: string;
  recurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceEnd?: string;
  customRecurrence?: string;
  reminderTime?: number;
  babyIds?: string[];
  caretakerIds?: string[];
  contactIds?: string[];
}

// Settings types
export interface SettingsResponse {
  id: string;
  familyName: string;
  securityPin?: string;
  authType: string | null;
  defaultBottleUnit: string;
  defaultSolidsUnit: string;
  defaultHeightUnit: string;
  defaultWeightUnit: string;
  defaultTempUnit: string;
  activitySettings: string | null;
  createdAt: string;
  updatedAt: string;
  familyId: string | null;
}

export interface SettingsUpdate {
  familyName?: string;
  defaultBottleUnit?: string;
  defaultSolidsUnit?: string;
  defaultHeightUnit?: string;
  defaultWeightUnit?: string;
  defaultTempUnit?: string;
  activitySettings?: string;
}

// Unit types
export interface UnitResponse {
  id: string;
  unitAbbr: string;
  unitName: string;
  activityTypes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Timeline types
export interface TimelineItem {
  id: string;
  type: 'feed' | 'sleep' | 'diaper' | 'bath' | 'note' | 'medicine' | 'pump' | 'milestone' | 'measurement';
  time: string;
  data: FeedLogResponse | SleepLogResponse | DiaperLogResponse | BathLogResponse | NoteResponse | MedicineLogResponse | PumpLogResponse | MilestoneResponse | MeasurementResponse;
}

// Output format type
export type OutputFormat = 'json' | 'table' | 'plain';
