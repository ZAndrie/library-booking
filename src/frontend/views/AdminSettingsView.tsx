'use client';

import React, { useState, useEffect } from 'react';
import { invalidateClientPolicies } from '@/lib/clientDataCache';
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Users,
  ShieldCheck,
  Building,
} from 'lucide-react';

export default function AdminSettingsView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    minRoomCapacity: '3',
    maxRoomCapacity: '15',
    maxSlotDurationHours: '2',
    operatingHoursStart: '08:00',
    operatingHoursEnd: '17:00',
    overdueGraceMinutes: '15',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch policy settings');
      if (data.setting) {
        setFormData({
          minRoomCapacity: String(data.setting.minRoomCapacity ?? 3),
          maxRoomCapacity: String(data.setting.maxRoomCapacity ?? 15),
          maxSlotDurationHours: String(data.setting.maxSlotDurationHours ?? 2),
          operatingHoursStart: data.setting.operatingHoursStart || '08:00',
          operatingHoursEnd: data.setting.operatingHoursEnd || '17:00',
          overdueGraceMinutes: String(data.setting.overdueGraceMinutes ?? 15),
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccessMsg('');
      const minCap = Number(formData.minRoomCapacity);
      const maxCap = Number(formData.maxRoomCapacity);
      const maxHours = Number(formData.maxSlotDurationHours);
      const graceMinutes =
        formData.overdueGraceMinutes === '' ? NaN : Number(formData.overdueGraceMinutes);
      if (
        !minCap ||
        !maxCap ||
        !maxHours ||
        Number.isNaN(graceMinutes) ||
        minCap < 1 ||
        maxCap <= minCap ||
        maxHours < 1 ||
        graceMinutes < 0
      ) {
        throw new Error('Please enter valid capacity limits, slot duration hours, and grace period.');
      }
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          minRoomCapacity: minCap,
          maxRoomCapacity: maxCap,
          maxSlotDurationHours: maxHours,
          overdueGraceMinutes: graceMinutes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      invalidateClientPolicies();
      setSuccessMsg('Desk operating policies saved successfully.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl space-y-6">
        {/* Top Header */}
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-[#8B1515] border border-red-200">
              Super Admin Policy
            </span>
            <h1 className="font-serif font-bold text-2xl text-slate-900 tracking-tight">
              Desk Operating Policies & Parameters
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Configure system-wide constraints for discussion room group capacities, booking duration limits, and counter operating hours.
          </p>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-xs text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#8B1515] mb-2" />
            <span>Loading policies...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Discussion Room Group Constraints */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Users className="w-5 h-5 text-[#8B1515]" />
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Discussion Room Capacity Rules
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Default student group size thresholds enforced during walk-in reservation entry.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Minimum Student Group Size
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={formData.minRoomCapacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minRoomCapacity: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Default: 3 students</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Maximum Room Occupancy Cap
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={formData.maxRoomCapacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxRoomCapacity: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Default: 15 students</span>
                </div>
              </div>
            </div>

            {/* Operating Hours & Timers */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Clock className="w-5 h-5 text-[#8B1515]" />
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Desk Operating Hours & Session Limits
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Standard duration allotment and counter service hours.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Standard Slot Limit (Hours)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={formData.maxSlotDurationHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxSlotDurationHours: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Default: 2 Hours</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Desk Opens (Mon–Fri)
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.operatingHoursStart}
                    onChange={(e) =>
                      setFormData({ ...formData, operatingHoursStart: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Default: 08:00 AM</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Desk Closes (Mon–Fri)
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.operatingHoursEnd}
                    onChange={(e) =>
                      setFormData({ ...formData, operatingHoursEnd: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Default: 05:00 PM</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Overdue Grace Period (Mins)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={formData.overdueGraceMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        overdueGraceMinutes: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Default: 15 minutes</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#8B1515] hover:bg-[#721111] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Desk Policies</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
