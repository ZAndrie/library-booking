'use client';

import React from 'react';
import { Clock } from 'lucide-react';

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

export interface RoomBookingFormState {
  roomId: string;
  borrowerName: string;
  courseAndYear: string;
  date: string;
  startTime: string;
  endTime: string;
  attendeesCount: number;
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

export function createDynamicBookingState(roomId = ''): RoomBookingFormState {
  const now = new Date();
  const startTime = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  const endTime = addMinutesToTime(startTime, 120);
  return {
    roomId,
    borrowerName: '',
    courseAndYear: '',
    date: getLocalDateString(now),
    startTime,
    endTime,
    attendeesCount: 3,
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
}

export default function RoomBookingFormFields({
  formData,
  setFormData,
  rooms,
  isAdmin,
}: RoomBookingFormFieldsProps) {
  const durationLabel = getDurationLabel(formData.startTime, formData.endTime);

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
    const now = new Date();
    const startTime = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    setFormData((prev) => ({
      ...prev,
      date: getLocalDateString(now),
      startTime,
      endTime: addMinutesToTime(startTime, 120),
    }));
  };

  return (
    <div className="space-y-3.5 text-xs">
      {rooms && (
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Discussion Room *
          </label>
          <select
            required
            value={formData.roomId}
            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
          >
            <option value="">-- Choose an available room --</option>
            {rooms
              .filter((r) => r.status === 'available')
              .map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.roomNumber}) - Cap: {r.capacity} users
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Name & Course and Year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
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
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
          />
        </div>
      </div>

      {/* Date (Dynamic) & No. of Users */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-700">Date *</label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, date: getLocalDateString() })}
              className="text-[10px] font-bold text-[#8B1515] hover:underline cursor-pointer"
            >
              Today
            </button>
          </div>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            No. of Users *
          </label>
          <input
            type="number"
            required
            min={formData.adminOverride ? 1 : 3}
            max={formData.adminOverride ? 50 : 15}
            value={formData.attendeesCount}
            onChange={(e) =>
              setFormData({
                ...formData,
                attendeesCount: Number(e.target.value),
              })
            }
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
          />
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Standard group size: 3 to 15 users
          </span>
        </div>
      </div>

      {/* Time of Use (Dynamic) */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8B1515]" />
            <span>Time of Use *</span>
            {durationLabel && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#8B1515]">
                {durationLabel}
              </span>
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
            {[
              { label: '+1h', mins: 60 },
              { label: '+1.5h', mins: 90 },
              { label: '+2h', mins: 120 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    endTime: addMinutesToTime(prev.startTime, preset.mins),
                  }))
                }
                className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:border-[#8B1515] text-[10px] font-semibold text-slate-700 hover:text-[#8B1515] cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <span className="block text-[10px] font-semibold text-slate-500 mb-1">Start Time</span>
            <input
              type="time"
              required
              value={formData.startTime}
              onChange={(e) => {
                const nextStart = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  startTime: nextStart,
                  endTime: addMinutesToTime(nextStart, 120),
                }));
              }}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-[#8B1515] outline-none"
            />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-slate-500 mb-1">End Time</span>
            <input
              type="time"
              required
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-[#8B1515] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Purpose Checklist */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <label className="block font-semibold text-slate-700">
          Purpose * <span className="text-[10px] font-normal text-slate-500">(Check all that apply)</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ROOM_PURPOSE_CHECKLIST.map((item) => {
            const checked = formData.selectedPurposes.includes(item);
            const isFullWidth =
              item === 'Group Study for Subject Assignment, Report, etc.' || item === 'Others';
            return (
              <label
                key={item}
                className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                  isFullWidth ? 'sm:col-span-2' : ''
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
                  className="mt-0.5 w-3.5 h-3.5 rounded text-[#8B1515] focus:ring-[#8B1515] border-slate-300 shrink-0"
                />
                <span className="leading-snug">{item}</span>
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
              className="w-full bg-white border border-[#8B1515]/40 rounded-lg p-2.5 text-slate-800 focus:ring-1 focus:ring-[#8B1515] outline-none"
            />
          </div>
        )}
      </div>

      {/* Administrative Override (Admin & Super Admin Only) */}
      {isAdmin && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
            <input
              type="checkbox"
              checked={formData.adminOverride}
              onChange={(e) =>
                setFormData({ ...formData, adminOverride: e.target.checked })
              }
              className="w-4 h-4 rounded text-[#8B1515] focus:ring-[#8B1515]"
            />
            <span>Administrative Override: Bypass 3 to 15 Student Rule</span>
          </label>
          <p className="text-[10px] text-amber-700 mt-1 ml-6">
            Bypasses user count limits for faculty sessions, individual research, or thesis exams.
          </p>
        </div>
      )}
    </div>
  );
}
