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
  CheckCircle2,
  Menu,
  X,
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#8B1515] selection:text-white flex flex-col justify-between">
      {/* Sticky Institutional Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & School Branding */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/cjc-logo.png"
                alt="Cor Jesu College Official Seal"
                width={48}
                height={48}
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
              <div className="text-xs text-slate-500 font-medium hidden sm:block">
                Learning Information and Resource Center • Operations Portal Gateway
              </div>
              <div className="text-[11px] text-slate-500 font-medium sm:hidden">
                Portal Gateway
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
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

          {/* User Auth (Only shown when already logged in; mandatory to choose portal first to sign in) */}
          <div className="hidden sm:flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user.name}</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#8B1515]">
                    {user.role ? user.role.replace('_', ' ') : 'STAFF DESK'}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#8B1515] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-[#8B1515] hover:bg-slate-100 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
              className="block text-sm font-medium text-slate-700 py-1.5"
            >
              Public Home
            </Link>
            <Link
              href="/#rooms"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 py-1.5"
            >
              Discussion Rooms
            </Link>
            <Link
              href="/#laptops"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 py-1.5"
            >
              Laptop Borrowing Services
            </Link>
            <Link
              href="/#guidelines"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 py-1.5"
            >
              Operating Guidelines
            </Link>
            {user && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg"
                >
                  Sign Out ({user.name})
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Hero Header Area with Campus Background & Elegant Breathing Room */}
      <section className="relative text-white overflow-hidden py-10 sm:py-14 border-b border-red-950/20 shadow-md">
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
                  rgba(139, 21, 21, 0.75) 0%,
                  rgba(125, 18, 18, 0.82) 50%,
                  rgba(80, 10, 10, 0.90) 100%
                )
              `,
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-300/40 text-rose-100 text-xs font-semibold mb-3.5 shadow-md backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Cor Jesu College • LIRC Multi-Subsystem Desk
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            Operations Portal Gateway
          </h1>
          <p className="mt-3 text-sm sm:text-base text-rose-100 max-w-2xl mx-auto font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] leading-relaxed">
            Select your operational counter desk below to authenticate and enter the staff management console.
          </p>
        </div>
      </section>

      {/* Main Subsystem Portals Area - Balanced, Spacious, and Accessible */}
      <main className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* PORTAL 1: Discussion Rooms */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                {/* Header row: Badge + Live Availability */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-red-200 bg-red-50 text-[#8B1515]">
                    Discussion Space
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {counts ? `${counts.availableRooms} of 5 Spaces Ready` : '5 Discussion Spaces'}
                  </span>
                </div>

                {/* Subsystem Title & Location */}
                <div className="flex items-start gap-4 mb-3.5">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-red-100 border border-red-200 text-[#8B1515] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <DoorOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-slate-900 group-hover:text-[#8B1515] transition-colors leading-tight">
                      Discussion Rooms Portal
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      📍 2nd Floor Left Wing, Norbert Building (Inside Library)
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  Dedicated counter desk for reserving collaborative discussion spaces, verifying group attendance, managing schedule overlaps, and coordinating active study sessions.
                </p>

                {/* Key Policy Highlights */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 mb-6 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>5 Dedicated Discussion Spaces (DR-A to DR-E)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Capacity: <strong>Min. 3 to Max. 15 Students</strong> per room</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Amenities: Equipped with institutional <strong>Table & Chairs</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Automated collision prevention & schedule validation</span>
                  </div>
                </div>
              </div>

              {/* Action Button & Shortcuts */}
              <div className="space-y-3 pt-2">
                <Link
                  href={user ? '/rooms' : '/login?portal=rooms'}
                  className="w-full py-3.5 px-6 bg-[#8B1515] hover:bg-[#721111] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-red-950/20 flex items-center justify-center gap-2.5 transition-all transform group-hover:translate-x-0.5 hover:shadow-lg"
                >
                  <span>Enter Discussion Rooms Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1 font-medium">
                  <Link
                    href={user ? '/rooms?action=new' : '/login?portal=rooms'}
                    className="hover:text-[#8B1515] transition-colors"
                  >
                    + Add Walk-In Booking
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
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                {/* Header row: Badge + Live Availability */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-red-200 bg-red-50 text-[#8B1515]">
                    Laptop Borrowing Services
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {counts ? `${counts.availableLaptops} Laptops on Shelf` : 'Counter Ready'}
                  </span>
                </div>

                {/* Subsystem Title & Location */}
                <div className="flex items-start gap-4 mb-3.5">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-red-100 border border-red-200 text-[#8B1515] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <Laptop className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-slate-900 group-hover:text-[#8B1515] transition-colors leading-tight">
                      Laptop Borrowing Portal
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      📍 LIRC Circulation Counter • Hardware Shelf A
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  Dedicated checkout desk for lending verified laptops to patrons, tracking countdown due times, recording accessory handovers, and inspecting condition grades on return.
                </p>

                {/* Key Policy Highlights */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 mb-6 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dell, Lenovo, HP & Apple Silicon hardware inventory</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Return condition auditing (Excellent, Good, Fair, Damaged)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-time overdue countdown timers & loan alerts</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Counter custody inspection & accessory checklists</span>
                  </div>
                </div>
              </div>

              {/* Action Button & Shortcuts */}
              <div className="space-y-3 pt-2">
                <Link
                  href={user ? '/laptops' : '/login?portal=laptops'}
                  className="w-full py-3.5 px-6 bg-[#8B1515] hover:bg-[#721111] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-red-950/20 flex items-center justify-center gap-2.5 transition-all transform group-hover:translate-x-0.5 hover:shadow-lg"
                >
                  <span>Enter Laptop Borrowing Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1 font-medium">
                  <Link
                    href={user ? '/laptops' : '/login?portal=laptops'}
                    className="hover:text-[#8B1515] transition-colors"
                  >
                    + Issue Laptop Loan
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

          {/* Secondary: Unified Operations Dashboard Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-[#8B1515] flex items-center justify-center shrink-0 shadow-inner">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <div className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2.5">
                  Unified Operations Dashboard
                  <span className="text-[10px] font-sans font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Master Hub
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
                  Consolidated supervisory desk for managing discussion spaces and hardware loans side-by-side.
                </p>
              </div>
            </div>

            <Link
              href={user ? '/dashboard' : '/login?portal=dashboard'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 transition-all shrink-0"
            >
              <span>Open Master Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 sm:py-8 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                <img
                  src="/cjc-logo.png"
                  alt="Cor Jesu College Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="font-serif font-bold text-white text-xs sm:text-sm">COR JESU COLLEGE, INC. • LIRC</div>
                <div className="text-[11px] text-slate-400">Discussion Room Booking & Laptop Borrowing Platform</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-slate-400 font-medium text-xs">
              <Link href="/" className="hover:text-white transition-colors">
                Public Home
              </Link>
              <Link href="/#rooms" className="hover:text-white transition-colors">
                Discussion Rooms
              </Link>
              <Link href="/#laptops" className="hover:text-white transition-colors">
                Laptop Borrowing
              </Link>
              <Link href="/#guidelines" className="hover:text-white transition-colors">
                Operating Guidelines
              </Link>
              {user && (
                <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 font-bold transition-colors">
                  Sign Out
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
            <div>
              © 1959–2026 Cor Jesu College, Inc. • Learning Information and Resource Center (LIRC). All rights reserved.
            </div>
            <div>
              Digos City, Davao del Sur • Founded 1959
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}