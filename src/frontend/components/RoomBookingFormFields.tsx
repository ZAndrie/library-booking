'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import {
  DEFAULT_SYSTEM_POLICIES,
  SystemPolicyData,
  formatTime12h,
} from '@/lib/policyUtils';

export const ROOM_PURPOSE_CHECKLIST = [
  'Thesis Preparation',
  'Debate',
  'Term Paper',
  'Research Paper',
  'Project Proposal',
  'Group Study for Subject Assignment, Report, etc.',
  'Others',
] as const;

export interface RoomOption {
  _id: string;
  name: string;
  roomNumber: string;
  capacity: number;
  status: string;
}

export interface ActiveRoomSlot {
  _id?: string;
  roomId: string | { _id: string };
  startTime: string;
  endTime: string;
  status: string;
}

export interface RoomBookingFormState {
  roomId: string;
  borrowerName: string;
  courseAndYear: string;
  date: string;
  startTime: string;
  endTime: string;
  attendeesCount: string;
  selectedPurposes: string[];
  otherPurpose: string;
  adminOverride: boolean;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function getLocalDateString(date = new Date()): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const [hStr, mStr] = timeStr.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const total = Math.min(h * 60 + m + minutesToAdd, 23 * 60 + 59);
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}

export function getDurationLabel(startTime: string, endTime: string): string | null {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  if ([sh, sm, eh, em].some(isNaN)) return null;
  const diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) return null;
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  return `${mins} mins`;
}

function toMinutes(hhmm: string): number {
  const [hStr, mStr] = (hhmm || '').split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return -1;
  return h * 60 + m;
}

function minutesToHHMM(totalMins: number): string {
  const clamped = Math.max(0, Math.min(totalMins, 23 * 60 + 59));
  return `${pad2(Math.floor(clamped / 60))}:${pad2(clamped % 60)}`;
}

export function findNextAvailableSlot(
  bookings: ActiveRoomSlot[],
  roomId: string,
  dateStr: string,
  policies: SystemPolicyData,
  preferredStartHHMM?: string
): {
  startTime: string;
  endTime: string;
  adjustedFromConflict: boolean;
  noSlotsLeftInHours: boolean;
} {
  const slotMins = Math.max(30, Math.round(policies.maxSlotDurationHours * 60));
  const openMins = toMinutes(policies.operatingHoursStart);
  const closeMins = toMinutes(policies.operatingHoursEnd);
  const hasValidHours = openMins >= 0 && closeMins > openMins;

  let baseStartMins: number;
  if (preferredStartHHMM && toMinutes(preferredStartHHMM) >= 0) {
    baseStartMins = toMinutes(preferredStartHHMM);
  } else if (dateStr === getLocalDateString()) {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    baseStartMins = hasValidHours && nowMins < openMins ? openMins : nowMins;
  } else {
    baseStartMins = openMins >= 0 ? openMins : 8 * 60;
  }

  const dayStartMs = new Date(`${dateStr}T00:00:00`).getTime();
  const intervals =
    !roomId || isNaN(dayStartMs)
      ? []
      : bookings
          .filter((b) => {
            if (b.status !== 'active') return false;
            const bRoomId = typeof b.roomId === 'string' ? b.roomId : b.roomId?._id;
            return bRoomId === roomId;
          })
          .map((b) => ({
            startMins: Math.floor((new Date(b.startTime).getTime() - dayStartMs) / 60000),
            endMins: Math.ceil((new Date(b.endTime).getTime() - dayStartMs) / 60000),
          }))
          .filter((b) => !isNaN(b.startMins) && !isNaN(b.endMins) && b.endMins > 0 && b.startMins < 1440)
          .sort((a, b) => a.startMins - b.startMins || a.endMins - b.endMins);

  let startMins = baseStartMins;
  let endMins =
    hasValidHours && startMins < closeMins
      ? Math.min(startMins + slotMins, closeMins)
      : startMins + slotMins;
  if (endMins <= startMins) endMins = startMins + slotMins;

  let adjustedFromConflict = false;
  for (const b of intervals) {
    if (b.startMins < endMins && b.endMins > startMins) {
      startMins = Math.max(startMins, b.endMins);
      adjustedFromConflict = true;
      endMins =
        hasValidHours && startMins < closeMins
          ? Math.min(startMins + slotMins, closeMins)
          : startMins + slotMins;
      if (endMins <= startMins) endMins = startMins + slotMins;
    }
  }

  const noSlotsLeftInHours = hasValidHours && startMins >= closeMins;
  return {
    startTime: minutesToHHMM(startMins),
    endTime: minutesToHHMM(endMins),
    adjustedFromConflict,
    noSlotsLeftInHours,
  };
}

export function createDynamicBookingState(
  roomId = '',
  defaultHours = DEFAULT_SYSTEM_POLICIES.maxSlotDurationHours
): RoomBookingFormState {
  const now = new Date();
  const startTime = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  const endTime = addMinutesToTime(startTime, Math.max(30, Math.round(defaultHours * 60)));
  return {
    roomId,
    borrowerName: '',
    courseAndYear: '',
    date: getLocalDateString(now),
    startTime,
    endTime,
    attendeesCount: '',
    selectedPurposes: [],
    otherPurpose: '',
    adminOverride: false,
  };
}

export function buildBookingPurpose(
  selectedPurposes: string[],
  otherPurpose: string
): { error?: string; purpose: string; purposes: string[] } {
  if (selectedPurposes.length === 0) {
    return {
      error: 'Please check at least one Purpose for the booking.',
      purpose: '',
      purposes: [],
    };
  }

  const trimmedOther = otherPurpose.trim();
  if (selectedPurposes.includes('Others') && !trimmedOther) {
    return {
      error: 'Please fill in the details for "Others".',
      purpose: '',
      purposes: [],
    };
  }

  const purposes = selectedPurposes.map((item) =>
    item === 'Others' ? `Others: ${trimmedOther}` : item
  );

  return {
    purpose: purposes.join(', '),
    purposes,
  };
}

interface RoomBookingFormFieldsProps {
  formData: RoomBookingFormState;
  setFormData: React.Dispatch<React.SetStateAction<RoomBookingFormState>>;
  rooms?: RoomOption[];
  isAdmin: boolean;
  policies?: SystemPolicyData;
  existingBookings?: ActiveRoomSlot[];
}

export default function RoomBookingFormFields({
  formData,
  setFormData,
  rooms,
  isAdmin,
  policies,
  existingBookings,
}: RoomBookingFormFieldsProps) {
  const activePolicies = policies || DEFAULT_SYSTEM_POLICIES;
  const defaultDurationMins = Math.max(30, Math.round(activePolicies.maxSlotDurationHours * 60));
  const durationLabel = getDurationLabel(formData.startTime, formData.endTime);

  const [fetchedDayBookings, setFetchedDayBookings] = React.useState<ActiveRoomSlot[]>([]);
  const [slotStatusHint, setSlotStatusHint] = React.useState<{
    type: 'adjusted' | 'full' | '';
    text: string;
  }>({ type: '', text: '' });
  const manualTimeEditedRef = React.useRef(false);

  React.useEffect(() => {
    if (!formData.date) return;
    let cancelled = false;
    fetch(`/api/room-bookings?date=${encodeURIComponent(formData.date)}&status=active`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && Array.isArray(d?.bookings)) {
          setFetchedDayBookings(d.bookings);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [formData.date]);

  const mergedBookings = React.useMemo(() => {
    const map = new Map<string, ActiveRoomSlot>();
    for (const b of existingBookings || []) {
      const key = b._id || `${b.startTime}-${b.endTime}`;
      map.set(key, b);
    }
    for (const b of fetchedDayBookings) {
      const key = b._id || `${b.startTime}-${b.endTime}`;
      map.set(key, b);
    }
    return Array.from(map.values());
  }, [existingBookings, fetchedDayBookings]);

  const applyNextAvailableSlot = React.useCallback(
    (roomId: string, dateStr: string, preferredStartHHMM?: string) => {
      const next = findNextAvailableSlot(
        mergedBookings,
        roomId,
        dateStr,
        activePolicies,
        preferredStartHHMM
      );
      setFormData((prev) => ({
        ...prev,
        date: dateStr,
        startTime: next.startTime,
        endTime: next.endTime,
      }));
      if (next.noSlotsLeftInHours && next.adjustedFromConflict) {
        setSlotStatusHint({
          type: 'full',
          text: `Booked until closing (${formatTime12h(activePolicies.operatingHoursEnd)})`,
        });
      } else if (next.adjustedFromConflict) {
        setSlotStatusHint({
          type: 'adjusted',
          text: `Auto-set to next free slot: ${formatTime12h(next.startTime)} – ${formatTime12h(next.endTime)}`,
        });
      } else {
        setSlotStatusHint({ type: '', text: '' });
      }
    },
    [mergedBookings, activePolicies, setFormData]
  );

  React.useEffect(() => {
    if (!formData.roomId || !formData.date || manualTimeEditedRef.current) {
      if (!formData.roomId) setSlotStatusHint({ type: '', text: '' });
      return;
    }
    applyNextAvailableSlot(formData.roomId, formData.date);
  }, [formData.roomId, formData.date, mergedBookings, activePolicies.maxSlotDurationHours, activePolicies.operatingHoursStart, activePolicies.operatingHoursEnd, applyNextAvailableSlot]);

  const manualConflict = React.useMemo(() => {
    if (!formData.roomId || !formData.date || !formData.startTime || !formData.endTime) return null;
    const reqStart = new Date(`${formData.date}T${formData.startTime}:00`).getTime();
    const reqEnd = new Date(`${formData.date}T${formData.endTime}:00`).getTime();
    if (isNaN(reqStart) || isNaN(reqEnd) || reqStart >= reqEnd) return null;

    const overlapping = mergedBookings.find((b) => {
      if (b.status !== 'active') return false;
      const bRoomId = typeof b.roomId === 'string' ? b.roomId : b.roomId?._id;
      if (bRoomId !== formData.roomId) return false;
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return bStart < reqEnd && bEnd > reqStart;
    });
    if (!overlapping) return null;

    const next = findNextAvailableSlot(
      mergedBookings,
      formData.roomId,
      formData.date,
      activePolicies,
      formData.startTime
    );
    return {
      nextStart: next.startTime,
      nextEnd: next.endTime,
      nextLabel: formatTime12h(next.startTime),
    };
  }, [formData.roomId, formData.date, formData.startTime, formData.endTime, mergedBookings, activePolicies]);

  const durationPresets = [
    { label: '+1h', mins: 60 },
    { label: '+1.5h', mins: 90 },
    { label: '+2h', mins: 120 },
    ...(activePolicies.maxSlotDurationHours > 2
      ? [
          {
            label: `+${activePolicies.maxSlotDurationHours}h`,
            mins: Math.round(activePolicies.maxSlotDurationHours * 60),
          },
        ]
      : []),
  ].filter(
    (p) => p.mins <= Math.round(activePolicies.maxSlotDurationHours * 60) || p.mins === 60
  );

  const togglePurpose = (item: string) => {
    setFormData((prev) => {
      const exists = prev.selectedPurposes.includes(item);
      const next = exists
        ? prev.selectedPurposes.filter((p) => p !== item)
        : [...prev.selectedPurposes, item];
      return {
        ...prev,
        selectedPurposes: next,
        otherPurpose: item === 'Others' && exists ? '' : prev.otherPurpose,
      };
    });
  };

  const snapToCurrentTime = () => {
    manualTimeEditedRef.current = false;
    const todayStr = getLocalDateString();
    applyNextAvailableSlot(formData.roomId, todayStr);
  };

  return (
    <div className="space-y-2.5 text-xs">
      {/* Row 1 & 2: Room (when selectable), Name, Course & Year, Date, No. of Users */}
      {rooms ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Discussion Room *
              </label>
              <select
                required
                value={formData.roomId}
                onChange={(e) => {
                  manualTimeEditedRef.current = false;
                  setFormData({ ...formData, roomId: e.target.value });
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
              >
                <option value="">-- Choose an available room --</option>
                {rooms
                  .filter((r) => r.status === 'available')
                  .map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.roomNumber}) - Cap: {r.capacity}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Juan Dela Cruz"
                value={formData.borrowerName}
                onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Course and Year *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BSIT - 3rd Year"
                value={formData.courseAndYear}
                onChange={(e) => setFormData({ ...formData, courseAndYear: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Date *</label>
                <button
                  type="button"
                  onClick={() => {
                    manualTimeEditedRef.current = false;
                    setFormData({ ...formData, date: getLocalDateString() });
                  }}
                  className="text-[10px] font-bold text-[#8B1515] hover:underline cursor-pointer"
                >
                  Today
                </button>
              </div>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => {
                  manualTimeEditedRef.current = false;
                  setFormData({ ...formData, date: e.target.value });
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">No. of Users *</label>
                <span className="text-[10px] text-slate-400">
                  {activePolicies.minRoomCapacity}–{activePolicies.maxRoomCapacity} policy
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="e.g. 5"
                value={formData.attendeesCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    attendeesCount: e.target.value.replace(/\D/g, ''),
                  })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Juan Dela Cruz"
              value={formData.borrowerName}
              onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Course and Year *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BSIT - 3rd Year"
              value={formData.courseAndYear}
              onChange={(e) => setFormData({ ...formData, courseAndYear: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Date *</label>
              <button
                type="button"
                onClick={() => {
                  manualTimeEditedRef.current = false;
                  setFormData({ ...formData, date: getLocalDateString() });
                }}
                className="text-[10px] font-bold text-[#8B1515] hover:underline cursor-pointer"
              >
                Today
              </button>
            </div>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => {
                manualTimeEditedRef.current = false;
                setFormData({ ...formData, date: e.target.value });
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">No. of Users *</label>
              <span className="text-[10px] text-slate-400">
                {activePolicies.minRoomCapacity}–{activePolicies.maxRoomCapacity} policy
              </span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              required
              placeholder="e.g. 5"
              value={formData.attendeesCount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attendeesCount: e.target.value.replace(/\D/g, ''),
                })
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
            />
          </div>
        </div>
      )}

      {/* Time of Use (Dynamic) */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="font-semibold text-slate-700 flex items-center gap-1.5 flex-wrap">
            <Clock className="w-3.5 h-3.5 text-[#8B1515]" />
            <span>Time of Use *</span>
            {durationLabel && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#8B1515]">
                {durationLabel}
              </span>
            )}
            {manualConflict ? (
              <button
                type="button"
                onClick={() => {
                  manualTimeEditedRef.current = false;
                  setFormData((prev) => ({
                    ...prev,
                    startTime: manualConflict.nextStart,
                    endTime: manualConflict.nextEnd,
                  }));
                  setSlotStatusHint({
                    type: 'adjusted',
                    text: `Auto-set to next free slot: ${formatTime12h(manualConflict.nextStart)} – ${formatTime12h(manualConflict.nextEnd)}`,
                  });
                }}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 cursor-pointer"
              >
                Conflict • Use {manualConflict.nextLabel}
              </button>
            ) : (
              slotStatusHint.text && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    slotStatusHint.type === 'full'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {slotStatusHint.text}
                </span>
              )
            )}
          </label>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={snapToCurrentTime}
              className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:border-[#8B1515] text-[10px] font-semibold text-slate-700 hover:text-[#8B1515] cursor-pointer"
            >
              Now
            </button>
            {durationPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  manualTimeEditedRef.current = true;
                  setSlotStatusHint({ type: '', text: '' });
                  setFormData((prev) => ({
                    ...prev,
                    endTime: addMinutesToTime(prev.startTime, preset.mins),
                  }));
                }}
                className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:border-[#8B1515] text-[10px] font-semibold text-slate-700 hover:text-[#8B1515] cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <span className="block text-[10px] font-semibold text-slate-500 mb-0.5">
              Start Time (Opens {formatTime12h(activePolicies.operatingHoursStart)})
            </span>
            <input
              type="time"
              required
              value={formData.startTime}
              onChange={(e) => {
                manualTimeEditedRef.current = true;
                setSlotStatusHint({ type: '', text: '' });
                const nextStart = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  startTime: nextStart,
                  endTime: addMinutesToTime(nextStart, defaultDurationMins),
                }));
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-[#8B1515] outline-none"
            />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-slate-500 mb-0.5">
              End Time (Max {activePolicies.maxSlotDurationHours}h • Closes {formatTime12h(activePolicies.operatingHoursEnd)})
            </span>
            <input
              type="time"
              required
              value={formData.endTime}
              onChange={(e) => {
                manualTimeEditedRef.current = true;
                setSlotStatusHint({ type: '', text: '' });
                setFormData({ ...formData, endTime: e.target.value });
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-[#8B1515] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Purpose Checklist */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
        <label className="block font-semibold text-slate-700">
          Purpose * <span className="text-[10px] font-normal text-slate-500">(Check all that apply)</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {ROOM_PURPOSE_CHECKLIST.map((item) => {
            const checked = formData.selectedPurposes.includes(item);
            const isGroupStudy = item === 'Group Study for Subject Assignment, Report, etc.';
            return (
              <label
                key={item}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                  isGroupStudy ? 'col-span-2' : ''
                } ${
                  checked
                    ? 'bg-red-50/70 border-[#8B1515]/40 text-slate-900 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePurpose(item)}
                  className="w-3.5 h-3.5 rounded text-[#8B1515] focus:ring-[#8B1515] border-slate-300 shrink-0"
                />
                <span className="leading-tight text-[11px]">{item}</span>
              </label>
            );
          })}
        </div>

        {formData.selectedPurposes.includes('Others') && (
          <div className="pt-1">
            <input
              type="text"
              required
              placeholder="Please specify other purpose..."
              value={formData.otherPurpose}
              onChange={(e) => setFormData({ ...formData, otherPurpose: e.target.value })}
              className="w-full bg-white border border-[#8B1515]/40 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-[#8B1515] outline-none"
            />
          </div>
        )}
      </div>

      {/* Administrative Override (Admin & Super Admin Only) */}
      {isAdmin && (
        <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
            <input
              type="checkbox"
              checked={formData.adminOverride}
              onChange={(e) =>
                setFormData({ ...formData, adminOverride: e.target.checked })
              }
              className="w-3.5 h-3.5 rounded text-[#8B1515] focus:ring-[#8B1515]"
            />
            <span>
              Administrative Override: Bypass Capacity ({activePolicies.minRoomCapacity}–{activePolicies.maxRoomCapacity}), Hours & {activePolicies.maxSlotDurationHours}h Limit
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
