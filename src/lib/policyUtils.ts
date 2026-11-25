export interface SystemPolicyData {
  minRoomCapacity: number;
  maxRoomCapacity: number;
  maxSlotDurationHours: number;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  overdueGraceMinutes: number;
}

export const DEFAULT_SYSTEM_POLICIES: SystemPolicyData = {
  minRoomCapacity: 3,
  maxRoomCapacity: 15,
  maxSlotDurationHours: 2,
  operatingHoursStart: '08:00',
  operatingHoursEnd: '17:00',
  overdueGraceMinutes: 15,
};

export function formatTime12h(hhmm: string): string {
  const [hStr, mStr] = (hhmm || '').split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function getManilaTimeHHMM(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  }).format(date);
}

export function getManilaDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getManilaDayBounds(dateStr?: string): { startOfDay: Date; endOfDay: Date } {
  const targetDate =
    dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr : getManilaDateString();
  return {
    startOfDay: new Date(`${targetDate}T00:00:00+08:00`),
    endOfDay: new Date(`${targetDate}T23:59:59.999+08:00`),
  };
}
