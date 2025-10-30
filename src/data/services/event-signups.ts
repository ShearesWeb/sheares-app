import { InMemoryCache } from '@/utils/cache';
import { Event } from '@/types/event';
import { fetchEventApi } from '../api/events';
import {
  createEventSignupApi,
  deleteEventSignupApi,
  isUserSignedUpApi,
} from '../api/event-signups';

// ---------------- Cache ----------------
const SignupsCache: InMemoryCache = new InMemoryCache();
const KEY_USER = (userId: number) => `event-signups:user:${userId}`; // value: Record<eventId, true>

// ---------------- Types ----------------
export interface CreateEventSignupInput {
  userId: number;
  eventId: number;
}

class SignupError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'SignupError';
    this.status = status;
  }
}

// ---------------- Internal helpers ----------------
function getNumber(obj: any, keys: string[]): number | null {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

function getDate(obj: any, keys: string[]): Date | null {
  for (const k of keys) {
    const v = obj?.[k];
    if (!v) continue;
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

async function assertWithinSignupWindow(eventId: number, now = new Date()): Promise<void> {
  const ev: Event | any = await fetchEventApi(eventId);

  // Support multiple field conventions to fit existing backends
  const start = getDate(ev, ['signupStartAt', 'signup_start_at', 'signupStart']);
  const end = getDate(ev, ['signupEndAt', 'signup_end_at', 'signupEnd']);

  if (start && now < start) {
    throw new SignupError('Signups have not opened yet.', 400);
  }
  if (end && now > end) {
    throw new SignupError('Signups have closed.', 400);
  }
}

async function assertCapacityAvailable(eventId: number): Promise<void> {
  const ev: Event | any = await fetchEventApi(eventId);

  const capacity = getNumber(ev, ['capacity', 'maxCapacity', 'max_capacity']);
  const attending = getNumber(ev, ['attendeesCount', 'attendee_count', 'currentAttendees']);

  if (capacity != null && attending != null && attending >= capacity) {
    throw new SignupError('Event is full.', 400);
  }
}

function cacheHas(userId: number, eventId: number): boolean | undefined {
  const key = KEY_USER(userId);
  const byId = SignupsCache.get<Record<string, true>>(key);
  if (!byId) return undefined;
  return !!byId[eventId.toString()];
}

function cacheSet(userId: number, eventId: number): void {
  const key = KEY_USER(userId);
  const byId = SignupsCache.get<Record<string, true>>(key) ?? {};
  // hset mirrors usage in announcements/events services
  SignupsCache.set(key, { ...byId, [eventId.toString()]: true });
}

function cacheDel(userId: number, eventId: number): void {
  const key = KEY_USER(userId);
  const byId = { ...(SignupsCache.get<Record<string, true>>(key) ?? {}) };
  delete byId[eventId.toString()];
  SignupsCache.set(key, byId);
}

// ---------------- Public API ----------------

/**
 * Checks if a user is already signed up for an event.
 * - Uses cache first; falls back to API.
 * - Matches API signature (positional args) and boolean return.
 */
export async function isUserSignedUp(userId: number, eventId: number): Promise<boolean> {
  const cached = cacheHas(userId, eventId);
  if (cached !== undefined) return cached;

  const signed = await isUserSignedUpApi(userId, eventId);
  if (signed) cacheSet(userId, eventId);
  return signed;
}

/**
 * Calls the API to create a signup.
 * Business rules applied:
 *  - Prevent duplicate signups
 *  - Check signup window (if fields present)
 *  - Check capacity (if fields present)
 *
 * After success, updates local cache and emits optional hooks.
 */
export async function signUpForEvent(userId: number, eventId: number, signedUpAt: Date): Promise<void> {
  // 1) Prevent duplicates
  if (await isUserSignedUp(userId, eventId)) {
    throw new SignupError('You are already signed up for this event.', 409);
  }

  // 2) Optional validations (no-ops if fields are absent)
  await assertWithinSignupWindow(eventId);
  await assertCapacityAvailable(eventId);

  // 3) Create signup via API (object param per API)
  await createEventSignupApi({ userId, eventId, signedUpAt });

  // 4) Update local cache and fire hooks
  cacheSet(userId, eventId);
}

/**
 * Calls the API to remove a signup.
 * - Validates existence first (prevents silent no-ops)
 * - Matches API signature: positional args
 */
export async function cancelSignup(userId: number, eventId: number): Promise<void> {
  const exists = await isUserSignedUp(userId, eventId);
  if (!exists) {
    throw new SignupError('No existing signup found to cancel.', 404);
  }

  await deleteEventSignupApi(userId, eventId);

  cacheDel(userId, eventId);
}

const EventSignupsService = {
  signUpForEvent,
  isUserSignedUp,
  cancelSignup,
};

export default EventSignupsService;
