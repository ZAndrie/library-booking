'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DoorOpen,
  Laptop,
  LayoutDashboard,
  LogOut,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Home,
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'staff';
  employeeId: string;
}

interface AvailabilityCounts {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  totalLaptops: number;
  availableLaptops: number;
  borrowedLaptops: number;
}

export default function PortalGatewayView() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [counts, setCounts] = useState<AvailabilityCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, availRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/availability', { cache: 'no-store' }),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        } else {
          router.push('/login');
          return;
        }

        if (availRes.ok) {
          const availData = await availRes.json();
          if (availData.success && availData.data?.counts) {
            setCounts(availData.data.counts);
          }
        }
      } catch (err) {
        console.error('Failed to load gateway data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-[#8B1515] selection:text-white relative overflow-hidden">
      {/* Background Campus Image with Deep Crimson Tint Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/cjc-campus.jpg"
          alt="Cor Jesu College Campus"
          className="w-full h-full object-cover object-center filter brightness-50 contrast-110"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 50% 20%, rgba(139, 21, 21, 0.78) 0%, rgba(30, 5, 5, 0.94) 85%),
              linear-gradient(180deg, rgba(20, 3, 3, 0.6) 0%, rgba(15, 23, 42, 0.96) 100%)
            `,
          }}
        />
      </div>

      {/* Top Bar Navigation */}
      <header className="relative z-10 border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-white/20 shadow-md flex items-center justify-center shrink-0">
              <img
                src="/cjc-logo.png"
                alt="Cor Jesu College Seal"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-serif font-bold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                COR JESU COLLEGE
                <span className="text-[10px] font-sans font-bold bg-red-600/90 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  LIRC Portal Gateway
                </span>
              </div>
              <div className="text-xs text-rose-200/80 font-medium">
                Learning Information and Resource Center • Staff Counter Selection
              </div>
            </div>
          </div>

          {/* User Identity & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{user?.name || 'Authorized Staff'}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-rose-300">
                {user?.role ? user.role.replace('_', ' ') : 'STAFF DESK'}
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-red-700 border border-white/30 text-white flex items-center justify-center font-bold text-xs shadow-md">
              {user ? user.name.slice(0, 2).toUpperCase() : 'CJ'}
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-semibold text-rose-100 hover:text-white transition-all ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Gateway Hub Content */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col justify-center">
        {/* Gateway Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-rose-200 text-xs font-semibold mb-4 shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Institutional Counter Selection
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
            Select Your Operations Portal
          </h1>
          <p className="mt-3 text-sm sm:text-base text-rose-100/90 max-w-2xl mx-auto font-medium leading-relaxed">
            Welcome back, <strong>{user?.name || 'Library Officer'}</strong>. Choose the dedicated counter portal you wish to operate, or enter the unified dashboard for full library administration.
          </p>
        </div>

        {/* The 2 Primary Subsystem Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* PORTAL 1: Discussion Rooms */}
          <div className="group relative bg-slate-900/85 hover:bg-slate-900/95 border border-white/20 hover:border-red-400/60 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-red-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-red-600/20 transition-all" />

            <div>
              {/* Badge & Room Live Indicator */}
              <div className="flex items-center justify-between gap-2 mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-950/90 text-rose-200 border border-red-500/40">
                  SYSTEM 1 • DISCUSSION SPACES
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {counts ? `${counts.availableRooms} of 5 Spaces Ready` : '5 Discussion Spaces'}
                </span>
              </div>

              {/* Portal Icon & Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B1515] to-[#550808] border border-red-400/40 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-950/50 group-hover:scale-105 transition-transform">
                  <DoorOpen className="w-7 h-7 text-rose-100" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-white group-hover:text-rose-200 transition-colors">
                    Discussion Rooms Portal
                  </h2>
                  <p className="text-xs text-rose-200/90 font-medium mt-1">
                    📍 2nd Floor Left Wing, Norbert Building (Inside Library)
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Dedicated counter desk for booking collaborative discussion rooms, validating student attendance, managing schedule overlaps, and coordinating active study sessions.
              </p>

              {/* Feature Points */}
              <div className="space-y-2.5 pt-4 border-t border-white/10 mb-8">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>5 Dedicated Discussion Spaces (DR-A to DR-E)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Capacity: <strong>Min. 3 to Max. 15 Students</strong> per session</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Amenities: Equipped with institutional <strong>Table & Chairs</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated double-booking collision prevention</span>
                </div>
              </div>
            </div>

            {/* Portal Action Buttons */}
            <div className="space-y-2.5">
              <Link
                href="/rooms"
                className="w-full py-3.5 px-5 bg-gradient-to-r from-[#8B1515] to-[#A31818] hover:from-[#9D1717] hover:to-[#B51B1B] text-white font-bold text-sm rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all transform group-hover:translate-x-0.5"
              >
                <span>Enter Discussion Rooms Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center justify-between text-[11px] text-rose-200/70 px-1 pt-1 font-medium">
                <Link href="/rooms?action=new" className="hover:text-white transition-colors">
                  + Add Walk-In Booking
                </Link>
                <span>•</span>
                <Link href="/rooms?tab=plotter" className="hover:text-white transition-colors">
                  Open Time Plotter
                </Link>
                <span>•</span>
                <Link href="/rooms?tab=ledger" className="hover:text-white transition-colors">
                  Booking Ledger
                </Link>
              </div>
            </div>
          </div>

          {/* PORTAL 2: Laptop Borrowing */}
          <div className="group relative bg-slate-900/85 hover:bg-slate-900/95 border border-white/20 hover:border-blue-400/60 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/20 transition-all" />

            <div>
              {/* Badge & Laptop Live Indicator */}
              <div className="flex items-center justify-between gap-2 mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-950/90 text-blue-200 border border-blue-500/40">
                  SYSTEM 2 • LAPTOP SERVICES
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {counts ? `${counts.availableLaptops} Laptops on Shelf` : 'Hardware Counter Ready'}
                </span>
              </div>

              {/* Portal Icon & Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 border border-blue-400/40 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-950/50 group-hover:scale-105 transition-transform">
                  <Laptop className="w-7 h-7 text-blue-100" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">
                    Laptop Borrowing Portal
                  </h2>
                  <p className="text-xs text-blue-200/90 font-medium mt-1">
                    📍 LIRC Circulation Counter • Hardware Shelf A
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Dedicated checkout desk for lending verified laptops to patrons, tracking countdown due times, recording accessory handovers, and inspecting condition grades on return.
              </p>

              {/* Feature Points */}
              <div className="space-y-2.5 pt-4 border-t border-white/10 mb-8">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Dell, Lenovo, HP & Apple Silicon hardware inventory</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Return condition auditing (Excellent, Good, Fair, Damaged)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Real-time overdue countdown timers & loan alerts</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Counter custody inspection & accessory checklists</span>
                </div>
              </div>
            </div>

            {/* Portal Action Buttons */}
            <div className="space-y-2.5">
              <Link
                href="/laptops"
                className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2 transition-all transform group-hover:translate-x-0.5"
              >
                <span>Enter Laptop Borrowing Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center justify-between text-[11px] text-blue-200/70 px-1 pt-1 font-medium">
                <Link href="/laptops" className="hover:text-white transition-colors">
                  + Issue New Laptop Loan
                </Link>
                <span>•</span>
                <Link href="/laptops" className="hover:text-white transition-colors">
                  Overdue Tracker
                </Link>
                <span>•</span>
                <Link href="/laptops" className="hover:text-white transition-colors">
                  Condition Audit
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary: Unified Consolidated Dashboard */}
        <div className="mt-8 bg-slate-900/70 hover:bg-slate-900/85 border border-white/15 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl transition-all flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/15 flex items-center justify-center text-rose-300 shrink-0 shadow-inner">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif text-lg font-bold text-white flex items-center gap-2">
                Unified Operations Dashboard
                <span className="text-[10px] font-sans font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Master Oversight
                </span>
              </div>
              <p className="text-xs text-slate-300/80 mt-0.5 leading-relaxed">
                Need consolidated supervision? Access the unified administrative hub to monitor both discussion rooms and hardware loans side-by-side.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all shrink-0"
          >
            <span>Open Unified Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Return to Public Landing Page */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-rose-200/70 hover:text-white transition-colors font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Public Landing Page
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-rose-200/60 border-t border-white/10 bg-black/20">
        © 1959–2026 Cor Jesu College, Inc. • Learning Information and Resource Center (LIRC)
      </footer>
    </div>
  );
}
