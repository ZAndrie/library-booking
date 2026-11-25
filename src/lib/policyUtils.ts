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

export interface RoomBookingDisplayState {
  kind: 'active_session' | 'reserved' | 'pending_checkout' | 'completed' | 'cancelled' | 'no_show';
  label: string;
  badgeClass: string;
}

export function getRoomBookingDisplayState(
  booking: { status: string; startTime: string; endTime: string },
  now: Date = new Date()
): RoomBookingDisplayState {
  if (booking.status === 'active') {
    const start = new Date(booking.startTime).getTime();
    const end = new Date(booking.endTime).getTime();
    const nowMs = now.getTime();
    if (!isNaN(start) && !isNaN(end)) {
      if (nowMs >= start && nowMs <= end) {
        return {
          kind: 'active_session',
          label: 'Active Session',
          badgeClass:
            'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse',
        };
      }
      if (nowMs < start) {
        return {
          kind: 'reserved',
          label: 'Reserved',
          badgeClass: 'bg-amber-100 text-amber-800 border border-amber-300',
        };
      }
      return {
        kind: 'pending_checkout',
        label: 'Pending Check-out',
        badgeClass: 'bg-orange-100 text-orange-800 border border-orange-300',
      };
    }
    return {
      kind: 'reserved',
      label: 'Reserved',
      badgeClass: 'bg-amber-100 text-amber-800 border border-amber-300',
    };
  }

  if (booking.status === 'completed') {
    return {
      kind: 'completed',
      label: 'Completed',
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    };
  }

  if (booking.status === 'no_show') {
    return {
      kind: 'no_show',
      label: 'No Show',
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-200',
    };
  }

  return {
    kind: 'cancelled',
    label: 'Cancelled',
    badgeClass: 'bg-rose-100 text-rose-800 border border-rose-200',
  };
}
