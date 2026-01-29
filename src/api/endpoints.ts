import { get, post, put, del, requireAuth } from './client.js';
import type {
  AuthResponse,
  AccountLoginResponse,
  FamilyResponse,
  BabyResponse,
  BabyCreate,
  BabyUpdate,
  SleepLogResponse,
  SleepLogCreate,
  FeedLogResponse,
  FeedLogCreate,
  DiaperLogResponse,
  DiaperLogCreate,
  NoteResponse,
  NoteCreate,
  CaretakerResponse,
  CaretakerCreate,
  CaretakerUpdate,
  BathLogResponse,
  BathLogCreate,
  PumpLogResponse,
  PumpLogCreate,
  MilestoneResponse,
  MilestoneCreate,
  MeasurementResponse,
  MeasurementCreate,
  MedicineResponse,
  MedicineCreate,
  MedicineUpdate,
  MedicineLogResponse,
  MedicineLogCreate,
  ContactResponse,
  ContactCreate,
  CalendarEventResponse,
  CalendarEventCreate,
  SettingsResponse,
  SettingsUpdate,
  UnitResponse,
} from '../types/index.js';

// ============================================
// Auth Endpoints
// ============================================

export async function authWithPin(params: {
  securityPin: string;
  loginId?: string;
  familySlug?: string;
}): Promise<AuthResponse> {
  return post<AuthResponse>('/api/auth', params);
}

export async function authWithAccount(params: {
  email: string;
  password: string;
}): Promise<AccountLoginResponse> {
  return post<AccountLoginResponse>('/api/accounts/login', params);
}

export async function refreshToken(): Promise<AuthResponse> {
  requireAuth();
  return post<AuthResponse>('/api/auth/refresh');
}

// ============================================
// Baby Endpoints
// ============================================

export async function getBabies(params?: { active?: boolean }): Promise<BabyResponse[]> {
  requireAuth();
  return get<BabyResponse[]>('/api/baby', params);
}

export async function getBaby(id: string): Promise<BabyResponse> {
  requireAuth();
  return get<BabyResponse>('/api/baby', { id });
}

export async function createBaby(data: BabyCreate): Promise<BabyResponse> {
  requireAuth();
  return post<BabyResponse>('/api/baby', data as unknown as Record<string, unknown>);
}

export async function updateBaby(data: BabyUpdate): Promise<BabyResponse> {
  requireAuth();
  const { id, ...rest } = data;
  return put<BabyResponse>('/api/baby', { id, ...rest } as unknown as Record<string, unknown>);
}

export async function deleteBaby(id: string): Promise<void> {
  requireAuth();
  return del<void>('/api/baby', { id });
}

// ============================================
// Feed Log Endpoints
// ============================================

export async function getFeedLogs(params: {
  babyId: string;
  startDate?: string;
  endDate?: string;
  type?: string;
}): Promise<FeedLogResponse[]> {
  requireAuth();
  return get<FeedLogResponse[]>('/api/feed-log', params);
}

export async function getFeedLog(id: string): Promise<FeedLogResponse> {
  requireAuth();
  return get<FeedLogResponse>('/api/feed-log', { id });
}

export async function createFeedLog(data: FeedLogCreate): Promise<FeedLogResponse> {
  requireAuth();
  return post<FeedLogResponse>('/api/feed-log', data as unknown as Record<string, unknown>);
}

export async function updateFeedLog(id: string, data: Partial<FeedLogCreate>): Promise<FeedLogResponse> {
  requireAuth();
  return put<FeedLogResponse>('/api/feed-log', { id, ...data } as unknown as Record<string, unknown>);
}

export async function deleteFeedLog(id: string): Promise<void> {
  requireAuth();
  return del<void>('/api/feed-log', { id });
}

// ============================================
// Sleep Log Endpoints
// ============================================

export async function getSleepLogs(params: {
  babyId: string;
  startDate?: string;
  endDate?: string;
}): Promise<SleepLogResponse[]> {
  requireAuth();
  return get<SleepLogResponse[]>('/api/sleep-log', params);
}

export async function getSleepLog(id: string): Promise<SleepLogResponse> {
  requireAuth();
  return get<SleepLogResponse>('/api/sleep-log', { id });
}

export async function createSleepLog(data: SleepLogCreate): Promise<SleepLogResponse> {
  requireAuth();
  return post<SleepLogResponse>('/api/sleep-log', data as unknown as Record<string, unknown>);
}

export async function updateSleepLog(id: string, data: Partial<SleepLogCreate>): Promise<SleepLogResponse> {
  requireAuth();
  return put<SleepLogResponse>('/api/sleep-log', { id, ...data } as unknown as Record<string, unknown>);
}

export async function deleteSleepLog(id: string): Promise<void> {
  requireAuth();
  return del<void>('/api/sleep-log', { id });
}

// ============================================
// Diaper Log Endpoints
// ============================================

export async function getDiaperLogs(params: {
  babyId: string;
  startDate?: string;
  endDate?: string;
}): Promise<DiaperLogResponse[]> {
  requireAuth();
  return get<DiaperLogResponse[]>('/api/diaper-log', params);
}

export async function getDiaperLog(id: string): Promise<DiaperLogResponse> {
  requireAuth();
  return get<DiaperLogResponse>('/api/diaper-log', { id });
}

export async function createDiaperLog(data: DiaperLogCreate): Promise<DiaperLogResponse> {
  requireAuth();
  return post<DiaperLogResponse>('/api/diaper-log', data as unknown as Record<string, unknown>);
}

export async function updateDiaperLog(id: string, data: Partial<DiaperLogCreate>): Promise<DiaperLogResponse> {
  requireAuth();
  return put<DiaperLogResponse>('/api/diaper-log', { id, ...data } as unknown as Record<string, unknown>);
}

export async function deleteDiaperLog(id: string): Promise<void> {
  requireAuth();
  return del<void>('/api/diaper-log', { id });
}

// ============================================
// Note Endpoints
// ============================================

export async function getNotes(params: {
  babyId: string;
  startDate?: string;
  endDate?: string;
}): Promise<NoteResponse[]> {
  requireAuth();
  return get<NoteResponse[]>('/api/note', params);
}

export async function getNote(id: string): Promise<NoteResponse> {
  requireAuth();
  return get<NoteResponse>('/api/note', { id });
}

export async function createNote(data: NoteCreate): Promise<NoteResponse> {
  requireAuth();
  return post<NoteResponse>('/api/note', data as unknown as Record<string, unknown>);
}

export async function updateNote(id: string, data: Partial<NoteCreate>): Promise<NoteResponse> {
  requireAuth();
  return put<NoteResponse>('/api/note', { id, ...data } as unknown as Record<string, unknown>);
}

export async function deleteNote(id: string): Promise<void> {
  requireAuth();
  return del<void>('/api/note', { id });
}

// ============================================
// Bath Log Endpoints
// ============================================

export async function getBathLogs(params: {
  babyId: string;
  startDate?: string;
  endDate?: string;
}): Promise<BathLogResponse[]> {
  requireAuth();
  return get<BathLogResponse[]>('/api/bath-log', params);
}

export async function getBathLog(id: string): Promise<BathLogResponse> {
  requireAuth();
  return get<BathLogResponse>('/api/bath-log', { id });
}

export async function createBathLog(data: BathLogCreate): Promise<BathLogResponse> {
  requireAuth();
  return post<BathLogResponse>('/api/bath-log', data as unknown as Record<string, unknown>);
}

export async function updateBathLog(id: string, data: Partial<BathLogCreate>): Promise<BathLogResponse> {
  requireAuth();
  return put<BathLogResponse>('/api/bath-log', { id, ...data } as unknown as Record<string, unknown>);
}

export async function deleteBathLog(id: string): Promise<void> {
  requireAuth();
  return del<void>('/api/bath-log', { id });
}

// ============================================
// Pump Log Endpoints
// ============================================

export async function getPumpLogs(params: {
  babyId: string;
  startDate?: string;
  endDate?: string;
}): Promise<PumpLogResponse[]> {
  requireAuth();
  return get<PumpLogResponse[]>('/api/pump-log', params);
}

export async function getPumpLog(id: string): Promise<PumpLogResponse> {
  requireAuth();
  return get<PumpLogResponse>('/api/pump-log', { id });
}

export async function createPumpLog(data: PumpLogCreate): Promise<PumpLogResponse> {
  requireAuth();
  return post<PumpLogResponse>('/api/pump-log', data as unknown as Record<string, unknown>);
}

export async function updatePumpLog(id: string, data: Partial<PumpLogCreate>): Promise<PumpLogResponse> {
  requireAuth();
  return put<PumpLogResponse>('/api/pump-log', { id, ...data } as unknown as Record<string, unknown>);
}

export async function deletePumpLog(id: string): Promise<void> {
  requireAuth();
  return del<void>('/api/pump-log', { id });
}

// ============================================
// Milestone Endpoints
// ============================================

export async function getMilestones(params: {
  babyId: string;
  category?: string;
}): Promise<MilestoneResponse[]> {
  requireAuth();
  return get<MilestoneResponse[]>('/api/milestone', params);
}

export async function getMilestone(id: string): Promise<MilestoneResponse> {
  requireAuth();
  return get<MilestoneResponse>('/api/milestone', { id });
}

export async function createMilestone(data: MilestoneCreate): Promise<MilestoneResponse> {
  requireAuth();
  return post<MilestoneResponse>('/api/milestone', data as unknown as Record<string, unknown>);
}

export async function updateMilestone(id: string, data: Partial<MilestoneCreate>): Promise<MilestoneResponse> {
  requireAuth();
  return put<MilestoneResponse>('/api/milestone', { id, ...data } as unknown as Record<string, unknown>);
}

export async function deleteMilestone(id: string): Promise<void> {
  requireAuth();
  return del<void>('/api/milestone', { id });
}

// ============================================
// Measurement Endpoints
// ============================================

export async function getMeasurements(params: {
  babyId: string;
  type?: string;
}): Promise<MeasurementResponse[]> {
  requireAuth();
  return get<MeasurementResponse[]>('/api/measurement', params);
}

export async function getMeasurement(id: string): Promise<MeasurementResponse> {
  requireAuth();
  return get<MeasurementResponse>('/api/measurement', { id });
}

export async function createMeasurement(data: MeasurementCreate): Promise<MeasurementResponse> {
  requireAuth();
  return post<MeasurementResponse>('/api/measurement', data as unknown as Record<string, unknown>);
}

export async function updateMeasurement(id: string, data: Partial<MeasurementCreate>): Promise<MeasurementResponse> {
  requireAuth();
  return put<MeasurementResponse>('/api/measurement', { id, ...data } as unknown as Record<string, unknown>);
}

export async function deleteMeasurement(id: string): Promise<void> {
  requireAuth();
  return del<void>('/api/measurement', { id });
}

// ============================================
// Medicine Endpoints
// ============================================

export async function getMedicines(params?: { active?: boolean }): Promise<MedicineResponse[]> {
  requireAuth();
  return get<MedicineResponse[]>('/api/medicine', params);
}

export async function getMedicine(id: string): Promise<MedicineResponse> {
  requireAuth();
  return get<MedicineResponse>('/api/medicine', { id });
}

export async function createMedicine(data: MedicineCreate): Promise<MedicineResponse> {
  requireAuth();
  return post<MedicineResponse>('/api/medicine', data as unknown as Record<string, unknown>);
}

export async function updateMedicine(data: MedicineUpdate): Promise<MedicineResponse> {
  requireAuth();
  return put<MedicineResponse>('/api/medicine', data as unknown as Record<string, unknown>);
}

export async function deleteMedicine(id: string): Promise<void> {
  requireAuth();
  return del<void>('/api/medicine', { id });
}

// ============================================
// Medicine Log Endpoints
// ============================================

export async function getMedicineLogs(params: {
  babyId: string;
  medicineId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<MedicineLogResponse[]> {
  requireAuth();
  return get<MedicineLogResponse[]>('/api/medicine-log', params);
}

export async function getMedicineLog(id: string): Promise<MedicineLogResponse> {
  requireAuth();
  return get<MedicineLogResponse>('/api/medicine-log', { id });
}

export async function createMedicineLog(data: MedicineLogCreate): Promise<MedicineLogResponse> {
  requireAuth();
  return post<MedicineLogResponse>('/api/medicine-log', data as unknown as Record<string, unknown>);
}

export async function updateMedicineLog(id: string, data: Partial<MedicineLogCreate>): Promise<MedicineLogResponse> {
  requireAuth();
  return put<MedicineLogResponse>('/api/medicine-log', { id, ...data } as unknown as Record<string, unknown>);
}

export async function deleteMedicineLog(id: string): Promise<void> {
  requireAuth();
  return del<void>('/api/medicine-log', { id });
}

// ============================================
// Caretaker Endpoints
// ============================================

export async function getCaretakers(): Promise<CaretakerResponse[]> {
  requireAuth();
  return get<CaretakerResponse[]>('/api/caretaker');
}

export async function getCaretaker(id: string): Promise<CaretakerResponse> {
  requireAuth();
  return get<CaretakerResponse>('/api/caretaker', { id });
}

export async function createCaretaker(data: CaretakerCreate): Promise<CaretakerResponse> {
  requireAuth();
  return post<CaretakerResponse>('/api/caretaker', data as unknown as Record<string, unknown>);
}

export async function updateCaretaker(data: CaretakerUpdate): Promise<CaretakerResponse> {
  requireAuth();
  return put<CaretakerResponse>('/api/caretaker', data as unknown as Record<string, unknown>);
}

export async function deleteCaretaker(id: string): Promise<void> {
  requireAuth();
  return del<void>('/api/caretaker', { id });
}

// ============================================
// Contact Endpoints
// ============================================

export async function getContacts(params?: { role?: string }): Promise<ContactResponse[]> {
  requireAuth();
  return get<ContactResponse[]>('/api/contact', params);
}

export async function getContact(id: string): Promise<ContactResponse> {
  requireAuth();
  return get<ContactResponse>('/api/contact', { id });
}

export async function createContact(data: ContactCreate): Promise<ContactResponse> {
  requireAuth();
  return post<ContactResponse>('/api/contact', data as unknown as Record<string, unknown>);
}

export async function updateContact(id: string, data: Partial<ContactCreate>): Promise<ContactResponse> {
  requireAuth();
  return put<ContactResponse>('/api/contact', { id, ...data } as unknown as Record<string, unknown>);
}

export async function deleteContact(id: string): Promise<void> {
  requireAuth();
  return del<void>('/api/contact', { id });
}

// ============================================
// Calendar Event Endpoints
// ============================================

export async function getCalendarEvents(params?: {
  babyId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<CalendarEventResponse[]> {
  requireAuth();
  return get<CalendarEventResponse[]>('/api/calendar', params);
}

export async function getCalendarEvent(id: string): Promise<CalendarEventResponse> {
  requireAuth();
  return get<CalendarEventResponse>('/api/calendar', { id });
}

export async function createCalendarEvent(data: CalendarEventCreate): Promise<CalendarEventResponse> {
  requireAuth();
  return post<CalendarEventResponse>('/api/calendar', data as unknown as Record<string, unknown>);
}

export async function updateCalendarEvent(id: string, data: Partial<CalendarEventCreate>): Promise<CalendarEventResponse> {
  requireAuth();
  return put<CalendarEventResponse>('/api/calendar', { id, ...data } as unknown as Record<string, unknown>);
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  requireAuth();
  return del<void>('/api/calendar', { id });
}

// ============================================
// Settings Endpoints
// ============================================

export async function getSettings(): Promise<SettingsResponse> {
  requireAuth();
  return get<SettingsResponse>('/api/settings');
}

export async function updateSettings(data: SettingsUpdate): Promise<SettingsResponse> {
  requireAuth();
  return put<SettingsResponse>('/api/settings', data as unknown as Record<string, unknown>);
}

// ============================================
// Family Endpoints
// ============================================

export async function getFamily(): Promise<FamilyResponse> {
  requireAuth();
  return get<FamilyResponse>('/api/family');
}

export async function updateFamily(data: { name?: string; slug?: string }): Promise<FamilyResponse> {
  requireAuth();
  return put<FamilyResponse>('/api/family', data);
}

// ============================================
// Unit Endpoints
// ============================================

export async function getUnits(params?: { activityType?: string }): Promise<UnitResponse[]> {
  requireAuth();
  return get<UnitResponse[]>('/api/units', params);
}

// ============================================
// Timeline Endpoint
// ============================================

export async function getTimeline(params: {
  babyId: string;
  limit?: number;
  startDate?: string;
  endDate?: string;
}): Promise<unknown[]> {
  requireAuth();
  return get<unknown[]>('/api/timeline', params);
}
