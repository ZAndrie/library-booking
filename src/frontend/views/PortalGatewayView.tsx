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
  Menu,
  X,
  MapPin,
  Lock,
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'staff';
  employeeId: string;
  portal?: 'rooms' | 'laptops';
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
  const [selectingPortal, setSelectingPortal] = useState<'rooms' | 'laptops' | null>(null);

  const isStaff = user?.role === 'staff';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isRoomsLockedForStaff = isStaff && user?.portal === 'laptops';
  const isLaptopsLockedForStaff = isStaff && user?.portal === 'rooms';

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
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('lirc_desk_user');
      }
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  const handleSelectStaffPortal = async (targetPortal: 'rooms' | 'laptops') => {
    setSelectingPortal(targetPortal);
    try {
      const res = await fetch('/api/auth/select-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portal: targetPortal }),
      });
      if (res.ok) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('lirc_desk_user');
        }
        router.push(targetPortal === 'rooms' ? '/rooms' : '/laptops');
        router.refresh();
      }
    } finally {
      setSelectingPortal(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#8B1515] selection:text-white flex flex-col justify-between">
      {/* Compact Sticky Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/cjc-logo.png"
                alt="Cor Jesu College Official Seal"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-serif font-bold text-base text-[#8B1515] tracking-tight leading-tight flex items-center gap-2 whitespace-nowrap">
                <span>COR JESU COLLEGE</span>
                <span className="hidden sm:inline-block text-[10px] font-sans font-bold bg-red-100 text-[#8B1515] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Staff Portal
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                LIRC • Library Booking System
              </div>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-[#8B1515] transition-colors whitespace-nowrap"
            >
              Public Home
            </Link>

            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user.name}</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#8B1515]">
                    {user.role ? user.role.replace('_', ' ') : 'STAFF DESK'}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#8B1515] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-[#8B1515] hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 py-1.5"
            >
              Public Home
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

      {/* Focused Zero-Scroll Service Desk Selector */}
      <main className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 flex-1 flex items-center">
        <div className="max-w-5xl w-full mx-auto space-y-6">
          {/* Compact Page Heading */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Select Service Desk
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Choose a counter portal to sign in and manage operations.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Mon–Fri 8:00 AM – 5:00 PM</span>
            </div>
          </div>

          {/* 2 Primary Service Desk Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* PORTAL 1: Discussion Rooms */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-lg hover:border-[#8B1515]/30 transition-all duration-200 flex flex-col justify-between gap-5 group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-red-200 bg-red-50 text-[#8B1515]">
                    Discussion Space
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {counts ? `${counts.availableRooms} / ${counts.totalRooms} Ready` : 'Ready'}
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-200 text-[#8B1515] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <DoorOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900 group-hover:text-[#8B1515] transition-colors leading-tight">
                      Discussion Rooms Portal
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>2nd Floor Left Wing, Norbert Building</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                {isRoomsLockedForStaff ? (
                  <div className="space-y-2">
                    <div className="w-full py-3 px-4 bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Locked — Laptop Session Active</span>
                    </div>
                    <p className="text-[11px] text-center text-slate-500">
                      Sign out first to switch desks.
                    </p>
                  </div>
                ) : isStaff && !user?.portal ? (
                  <button
                    type="button"
                    disabled={selectingPortal !== null}
                    onClick={() => handleSelectStaffPortal('rooms')}
                    className="w-full py-3 px-5 bg-[#8B1515] hover:bg-[#721111] text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <span>
                      {selectingPortal === 'rooms' ? 'Entering Desk...' : 'Enter Discussion Rooms'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href={user ? '/rooms' : '/login?portal=rooms'}
                    className="w-full py-3 px-5 bg-[#8B1515] hover:bg-[#721111] text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Enter Discussion Rooms</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* PORTAL 2: Laptop Borrowing */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-lg hover:border-[#8B1515]/30 transition-all duration-200 flex flex-col justify-between gap-5 group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-red-200 bg-red-50 text-[#8B1515]">
                    Laptop Borrowing
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {counts ? `${counts.availableLaptops} / ${counts.totalLaptops} On Shelf` : 'Ready'}
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-200 text-[#8B1515] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900 group-hover:text-[#8B1515] transition-colors leading-tight">
                      Laptop Borrowing Portal
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Circulation Counter • Hardware Shelf A</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                {isLaptopsLockedForStaff ? (
                  <div className="space-y-2">
                    <div className="w-full py-3 px-4 bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Locked — Discussion Rooms Active</span>
                    </div>
                    <p className="text-[11px] text-center text-slate-500">
                      Sign out first to switch desks.
                    </p>
                  </div>
                ) : isStaff && !user?.portal ? (
                  <button
                    type="button"
                    disabled={selectingPortal !== null}
                    onClick={() => handleSelectStaffPortal('laptops')}
                    className="w-full py-3 px-5 bg-[#8B1515] hover:bg-[#721111] text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <span>
                      {selectingPortal === 'laptops' ? 'Entering Desk...' : 'Enter Laptop Borrowing'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href={user ? '/laptops' : '/login?portal=laptops'}
                    className="w-full py-3 px-5 bg-[#8B1515] hover:bg-[#721111] text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Enter Laptop Borrowing</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Admin & Super Admin Supervisory Hub */}
          {(!user || isAdmin) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-[#8B1515] flex items-center justify-center shrink-0">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                    <span>Unified Operations Dashboard</span>
                    <span className="text-[10px] font-sans font-bold bg-red-100 text-[#8B1515] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Admin & Super Admin Only
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Supervisory overview for both desks, staff accounts, and audit logs.
                  </p>
                </div>
              </div>

              <Link
                href={user ? '/dashboard' : '/login?portal=dashboard'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all shrink-0"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Minimal 1-Line Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-4 sm:px-6 text-[11px] text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>© 1959–2026 Cor Jesu College, Inc. • Learning Information and Resource Center</span>
          <span>Digos City, Davao del Sur</span>
        </div>
      </footer>
    </div>
  );
}