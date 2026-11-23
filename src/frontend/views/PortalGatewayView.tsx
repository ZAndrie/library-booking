'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DoorOpen,
  Laptop,
  LayoutDashboard,
  LogOut,
  LogIn,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Clock,
  Shield,
  Layers,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        }

        if (availRes.ok) {
          const availData = await availRes.json();
          if (availData.success && availData.data?.counts) {
            setCounts(availData.data.counts);
          }
        }
      } catch (err) {
        console.error('Failed to load gateway data:', err);
      }
    }

    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-[#8B1515] selection:text-white flex flex-col justify-between">
      {/* Sticky Institutional Top Navigation (Compact h-14 / h-16) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo & School Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/cjc-logo.png"
                alt="Cor Jesu College Official Seal"
                width={38}
                height={38}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-serif font-bold text-base sm:text-lg text-[#8B1515] tracking-tight leading-tight flex items-center gap-2">
                COR JESU COLLEGE
                <span className="hidden sm:inline-block text-[10px] font-sans font-bold bg-red-100 text-[#8B1515] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  LIRC Desk
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Learning Information and Resource Center • Operations Portal Gateway
              </div>
              <div className="text-[10px] text-slate-500 font-medium sm:hidden">
                Portal Gateway
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/" className="hover:text-[#8B1515] transition-colors">
              Public Home
            </Link>
            <Link href="/#rooms" className="hover:text-[#8B1515] transition-colors">
              Discussion Rooms
            </Link>
            <Link href="/#laptops" className="hover:text-[#8B1515] transition-colors">
              Laptop Borrowing
            </Link>
            <Link href="/#guidelines" className="hover:text-[#8B1515] transition-colors">
              Operating Guidelines
            </Link>
          </nav>

          {/* User Auth or Sign In Button */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user.name}</div>
                  <div className="text-[9px] uppercase font-bold tracking-wider text-[#8B1515]">
                    {user.role ? user.role.replace('_', ' ') : 'STAFF DESK'}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#8B1515] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-[#8B1515] hover:bg-slate-100 rounded-lg transition-colors ml-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8B1515] hover:bg-[#721111] text-white rounded-lg text-xs font-bold shadow-xs transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Staff Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-slate-700 py-1"
            >
              Public Home
            </Link>
            <Link
              href="/#rooms"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-slate-700 py-1"
            >
              Discussion Rooms
            </Link>
            <Link
              href="/#laptops"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-slate-700 py-1"
            >
              Laptop Borrowing Services
            </Link>
            <Link
              href="/#guidelines"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-slate-700 py-1"
            >
              Operating Guidelines
            </Link>
            <div className="pt-2 border-t border-slate-100">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg"
                >
                  Sign Out ({user.name})
                </button>
              ) : (
                <Link
                  href="/login"
                  className="w-full block text-center py-2 bg-[#8B1515] text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Staff Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Sleek Compact Hero Header Area (Low vertical footprint so buttons are always above-the-fold) */}
      <section className="relative text-white overflow-hidden py-5 sm:py-6 border-b border-red-950/20 shadow-inner">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/cjc-campus.jpg"
            alt="Cor Jesu College Campus"
            className="w-full h-full object-cover object-[center_35%] filter brightness-95 contrast-105"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(
                  180deg,
                  rgba(139, 21, 21, 0.72) 0%,
                  rgba(125, 18, 18, 0.78) 50%,
                  rgba(80, 10, 10, 0.88) 100%
                )
              `,
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-300/40 text-rose-100 text-[11px] font-semibold mb-2 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Cor Jesu College • LIRC Operations Gateway
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Operations Portal Gateway
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-rose-100 max-w-xl mx-auto font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
            Select your operational counter desk below to access room reservations or laptop loans immediately.
          </p>
        </div>
      </section>

      {/* Main Subsystem Portals Area - Compact, Clean, Above-The-Fold */}
      <main className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center">
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {/* PORTAL 1: Discussion Rooms */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
              <div>
                {/* Header row: Badge + Live Availability */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-[#8B1515]">
                    Discussion Space
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {counts ? `${counts.availableRooms} of 5 Spaces Ready` : '5 Discussion Spaces'}
                  </span>
                </div>

                {/* Subsystem Title & Location */}
                <div className="flex items-center gap-3.5 mb-2.5">
                  <div className="w-11 h-11 rounded-xl bg-red-100 border border-red-200 text-[#8B1515] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <DoorOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900 group-hover:text-[#8B1515] transition-colors leading-snug">
                      Discussion Rooms Portal
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      📍 2nd Floor Left Wing, Norbert Building (Inside Library)
                    </p>
                  </div>
                </div>

                {/* Concise Summary */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3.5">
                  Manage collaborative discussion spaces, verify student groups, coordinate walk-ins, and prevent booking overlaps.
                </p>

                {/* Compact Feature Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 mb-4 text-[11px] text-slate-700 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>5 Spaces (DR-A to DR-E)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Min. 3 to Max. 15 Students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Table and Chairs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Collision-Free Scheduler</span>
                  </div>
                </div>
              </div>

              {/* Action Button & Shortcuts (Immediate access, no scroll needed) */}
              <div className="space-y-2 pt-1">
                <Link
                  href={user ? '/rooms' : '/login?portal=rooms'}
                  className="w-full py-3 px-4 bg-[#8B1515] hover:bg-[#721111] text-white font-bold text-sm rounded-xl shadow-md shadow-red-950/20 flex items-center justify-center gap-2 transition-all transform group-hover:translate-x-0.5"
                >
                  <span>Enter Discussion Rooms Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-medium">
                  <Link
                    href={user ? '/rooms?action=new' : '/login?portal=rooms'}
                    className="hover:text-[#8B1515] transition-colors"
                  >
                    + Add Walk-In
                  </Link>
                  <span>•</span>
                  <Link
                    href={user ? '/rooms?tab=plotter' : '/login?portal=rooms'}
                    className="hover:text-[#8B1515] transition-colors"
                  >
                    Time Plotter
                  </Link>
                  <span>•</span>
                  <Link
                    href={user ? '/rooms?tab=ledger' : '/login?portal=rooms'}
                    className="hover:text-[#8B1515] transition-colors"
                  >
                    Booking Ledger
                  </Link>
                </div>
              </div>
            </div>

            {/* PORTAL 2: Laptop Borrowing */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
              <div>
                {/* Header row: Badge + Live Availability */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-[#8B1515]">
                    Laptop Services
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {counts ? `${counts.availableLaptops} Laptops on Shelf` : 'Counter Ready'}
                  </span>
                </div>

                {/* Subsystem Title & Location */}
                <div className="flex items-center gap-3.5 mb-2.5">
                  <div className="w-11 h-11 rounded-xl bg-red-100 border border-red-200 text-[#8B1515] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900 group-hover:text-[#8B1515] transition-colors leading-snug">
                      Laptop Borrowing Portal
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      📍 LIRC Circulation Counter • Hardware Shelf A
                    </p>
                  </div>
                </div>

                {/* Concise Summary */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3.5">
                  Lend verified laptops to patrons, track loan countdown due times, record accessory custody, and inspect return conditions.
                </p>

                {/* Compact Feature Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 mb-4 text-[11px] text-slate-700 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dell, Lenovo, HP & Mac</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Return Condition Audits</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Due Countdown Alerts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Custody & Checklist Logs</span>
                  </div>
                </div>
              </div>

              {/* Action Button & Shortcuts (Immediate access, no scroll needed) */}
              <div className="space-y-2 pt-1">
                <Link
                  href={user ? '/laptops' : '/login?portal=laptops'}
                  className="w-full py-3 px-4 bg-[#8B1515] hover:bg-[#721111] text-white font-bold text-sm rounded-xl shadow-md shadow-red-950/20 flex items-center justify-center gap-2 transition-all transform group-hover:translate-x-0.5"
                >
                  <span>Enter Laptop Borrowing Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-medium">
                  <Link
                    href={user ? '/laptops' : '/login?portal=laptops'}
                    className="hover:text-[#8B1515] transition-colors"
                  >
                    + Issue Loan
                  </Link>
                  <span>•</span>
                  <Link
                    href={user ? '/laptops' : '/login?portal=laptops'}
                    className="hover:text-[#8B1515] transition-colors"
                  >
                    Overdue Tracker
                  </Link>
                  <span>•</span>
                  <Link
                    href={user ? '/laptops' : '/login?portal=laptops'}
                    className="hover:text-[#8B1515] transition-colors"
                  >
                    Condition Audit
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary: Slim Unified Operations Dashboard Strip */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 text-[#8B1515] flex items-center justify-center shrink-0 shadow-inner">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
                  Unified Operations Dashboard
                  <span className="text-[9px] font-sans font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Master Hub
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Consolidated supervisory desk for managing discussion rooms and hardware inventory side-by-side.
                </p>
              </div>
            </div>

            <Link
              href={user ? '/dashboard' : '/login?portal=dashboard'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all shrink-0"
            >
              <span>Open Master Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </main>

      {/* Compact Institutional Footer */}
      <footer className="bg-slate-900 text-slate-400 py-3 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2.5">
            <img
              src="/cjc-logo.png"
              alt="Cor Jesu College Logo"
              width={20}
              height={20}
              className="w-5 h-5 object-contain"
            />
            <span className="font-serif font-bold text-white">Cor Jesu College • LIRC</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Discussion Rooms & Laptop Borrowing Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Public Home
            </Link>
            <Link href="/#rooms" className="hover:text-white transition-colors">
              Rooms
            </Link>
            <Link href="/#laptops" className="hover:text-white transition-colors">
              Laptops
            </Link>
            <Link href="/#guidelines" className="hover:text-white transition-colors">
              Guidelines
            </Link>
            {user ? (
              <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 font-semibold transition-colors">
                Sign Out
              </button>
            ) : (
              <Link href="/login" className="text-rose-400 hover:text-rose-300 font-semibold transition-colors">
                Staff Sign In
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}