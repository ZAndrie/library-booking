import { DEFAULT_SYSTEM_POLICIES, SystemPolicyData } from '@/lib/policyUtils';

export interface ClientUserProfile {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'staff';
  employeeId: string;
  portal?: 'rooms' | 'laptops';
}

const USER_CACHE_KEY = 'lirc_desk_user';
const CLIENT_CACHE_TTL_MS = 30_000;

let cachedUser: ClientUserProfile | null = null;
let userFetchedAt = 0;
let userInFlight: Promise<ClientUserProfile | null> | null = null;

let cachedPolicies: SystemPolicyData | null = null;
let policiesFetchedAt = 0;
let policiesInFlight: Promise<SystemPolicyData> | null = null;

export function getStoredClientUser(): ClientUserProfile | null {
  if (cachedUser) return cachedUser;
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY);
    if (raw) {
      cachedUser = JSON.parse(raw) as ClientUserProfile;
      return cachedUser;
    }
  } catch {
    // Ignore malformed cache
  }
  return null;
}

export function clearClientUserCache() {
  cachedUser = null;
  userFetchedAt = 0;
  userInFlight = null;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(USER_CACHE_KEY);
    } catch {
      // Ignore storage error
    }
  }
}

export async function fetchClientUser(force = false): Promise<ClientUserProfile | null> {
  const now = Date.now();
  if (!force && cachedUser && now - userFetchedAt < CLIENT_CACHE_TTL_MS) {
    return cachedUser;
  }
  if (!force && userInFlight) {
    return userInFlight;
  }

  userInFlight = fetch('/api/auth/me')
    .then(async (res) => {
      if (!res.ok) {
        clearClientUserCache();
        return null;
      }
      const data = await res.json();
      const user = (data?.user as ClientUserProfile) || null;
      if (user) {
        cachedUser = user;
        userFetchedAt = Date.now();
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
          } catch {
            // Ignore storage quota errors
          }
        }
      }
      return user;
    })
    .catch(() => null)
    .finally(() => {
      userInFlight = null;
    });

  return userInFlight;
}

export function invalidateClientPolicies() {
  cachedPolicies = null;
  policiesFetchedAt = 0;
  policiesInFlight = null;
}

export async function fetchClientPolicies(force = false): Promise<SystemPolicyData> {
  const now = Date.now();
  if (!force && cachedPolicies && now - policiesFetchedAt < CLIENT_CACHE_TTL_MS) {
    return cachedPolicies;
  }
  if (!force && policiesInFlight) {
    return policiesInFlight;
  }

  policiesInFlight = fetch('/api/admin/settings')
    .then(async (res) => {
      if (!res.ok) return DEFAULT_SYSTEM_POLICIES;
      const d = await res.json();
      if (!d?.setting) return DEFAULT_SYSTEM_POLICIES;
      const next: SystemPolicyData = {
        minRoomCapacity: d.setting.minRoomCapacity ?? DEFAULT_SYSTEM_POLICIES.minRoomCapacity,
        maxRoomCapacity: d.setting.maxRoomCapacity ?? DEFAULT_SYSTEM_POLICIES.maxRoomCapacity,
        maxSlotDurationHours:
          d.setting.maxSlotDurationHours ?? DEFAULT_SYSTEM_POLICIES.maxSlotDurationHours,
        operatingHoursStart:
          d.setting.operatingHoursStart || DEFAULT_SYSTEM_POLICIES.operatingHoursStart,
        operatingHoursEnd:
          d.setting.operatingHoursEnd || DEFAULT_SYSTEM_POLICIES.operatingHoursEnd,
        overdueGraceMinutes:
          d.setting.overdueGraceMinutes ?? DEFAULT_SYSTEM_POLICIES.overdueGraceMinutes,
      };
      cachedPolicies = next;
      policiesFetchedAt = Date.now();
      return next;
    })
    .catch(() => DEFAULT_SYSTEM_POLICIES)
    .finally(() => {
      policiesInFlight = null;
    });

  return policiesInFlight;
}
