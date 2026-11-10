'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/frontend/components/AppShell';
import {
  DoorOpen,
  Laptop,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface StatsData {
  rooms: {
    total: number;
    available: number;
    maintenance: number;
    currentlyOccupied: number;
    todayTotal: number;
  };
  laptops: {
    total: number;
    available: number;
    borrowed: number;
    maintenance: number;
    overdue: number;
  };
}

export default function DashboardView() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentRooms, setRecentRooms] = useState<any[]>([]);
  const [recentLaptops, setRecentLaptops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentRooms(data.recentRoomBookings || []);
        setRecentLaptops(data.recentLaptopLoans || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome & Subsystem Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Activity className="w-3 h-3" /> Live Operations
                </span>
                <span className="text-xs text-slate-400">Desk Operations Console</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Unified Library Administration Desk
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl mt-1">
                Central command combining <strong>Discussion Room Reservations</strong> and{' '}
                <strong>Laptop Borrowing Desk Operations</strong> into a single interface for library officers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/rooms"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-900/30 transition-all"
              >
                <DoorOpen className="w-4 h-4" />
                Book Discussion Room
              </Link>
              <Link
                href="/laptops"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all"
              >
                <Laptop className="w-4 h-4" />
                Checkout Laptop
              </Link>
            </div>
          </div>
        </div>

        {/* Dual Subsystem Metric Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SUBSYSTEM 1: Discussion Rooms Overview */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <DoorOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">System 1: Discussion Rooms</h2>
                    <p className="text-[11px] text-slate-400">Room schedule & reservation load</p>
                  </div>
                </div>
                <Link
                  href="/rooms"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
                >
                  Manage Rooms <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block mb-1">Total Rooms</span>
                  <span className="text-xl font-bold text-white">
                    {loading ? '...' : stats?.rooms.total ?? 0}
                  </span>
                </div>
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60">
                  <span className="text-[11px] text-emerald-400 block mb-1">Ready for Use</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {loading ? '...' : stats?.rooms.available ?? 0}
                  </span>
                </div>
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60">
                  <span className="text-[11px] text-blue-400 block mb-1">In Session Now</span>
                  <span className="text-xl font-bold text-blue-400">
                    {loading ? '...' : stats?.rooms.currentlyOccupied ?? 0}
                  </span>
                </div>
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60">
                  <span className="text-[11px] text-amber-400 block mb-1">Maintenance</span>
                  <span className="text-xl font-bold text-amber-400">
                    {loading ? '...' : stats?.rooms.maintenance ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span>Today&apos;s Reservations Scheduled:</span>
              <span className="font-semibold text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                {loading ? '...' : stats?.rooms.todayTotal ?? 0} sessions
              </span>
            </div>
          </div>

          {/* SUBSYSTEM 2: Laptop Borrowing Overview */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">System 2: Laptop Borrowing Desk</h2>
                    <p className="text-[11px] text-slate-400">Hardware inventory & active loans</p>
                  </div>
                </div>
                <Link
                  href="/laptops"
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
                >
                  Loan Desk <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block mb-1">Total Fleet</span>
                  <span className="text-xl font-bold text-white">
                    {loading ? '...' : stats?.laptops.total ?? 0}
                  </span>
                </div>
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60">
                  <span className="text-[11px] text-emerald-400 block mb-1">On Shelf Ready</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {loading ? '...' : stats?.laptops.available ?? 0}
                  </span>
                </div>
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60">
                  <span className="text-[11px] text-blue-400 block mb-1">Checked Out</span>
                  <span className="text-xl font-bold text-blue-400">
                    {loading ? '...' : stats?.laptops.borrowed ?? 0}
                  </span>
                </div>
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60">
                  <span className="text-[11px] text-rose-400 block mb-1">Overdue Loans</span>
                  <span
                    className={`text-xl font-bold ${
                      (stats?.laptops.overdue ?? 0) > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'
                    }`}
                  >
                    {loading ? '...' : stats?.laptops.overdue ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span>Devices in Repair / Maintenance:</span>
              <span className="font-semibold text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                {loading ? '...' : stats?.laptops.maintenance ?? 0} units
              </span>
            </div>
          </div>
        </div>

        {/* Operational Feeds: Active Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Discussion Rooms Feed */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-blue-400" />
                Latest Room Reservations
              </h3>
              <Link href="/rooms" className="text-xs text-blue-400 hover:underline">
                View All
              </Link>
            </div>

            {recentRooms.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No room reservations recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentRooms.map((rb) => (
                  <div
                    key={rb._id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{rb.roomId?.name || 'Room'}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          {rb.roomId?.roomNumber}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {rb.borrowerName} • ID: {rb.borrowerId}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-slate-300 font-medium">
                        {new Date(rb.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(rb.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <span
                        className={`inline-block text-[10px] uppercase font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                          rb.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : rb.status === 'completed'
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {rb.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Laptop Loans Feed */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-emerald-400" />
                Latest Laptop Checkouts & Returns
              </h3>
              <Link href="/laptops" className="text-xs text-emerald-400 hover:underline">
                View All
              </Link>
            </div>

            {recentLaptops.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No laptop loan transactions logged yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentLaptops.map((loan) => (
                  <div
                    key={loan._id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {loan.laptopId?.assetTag || 'Asset'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {loan.laptopId?.brand} {loan.laptopId?.model}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Borrower: {loan.borrowerName} ({loan.borrowerId})
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-slate-300 font-medium">
                        Due: {new Date(loan.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <span
                        className={`inline-block text-[10px] uppercase font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                          loan.status === 'returned'
                            ? 'bg-slate-700 text-slate-300'
                            : new Date(loan.dueAt) < new Date()
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {loan.status === 'active' && new Date(loan.dueAt) < new Date()
                          ? 'OVERDUE'
                          : loan.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
