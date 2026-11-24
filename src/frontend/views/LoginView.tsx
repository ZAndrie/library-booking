'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Lock,
  ArrowLeft,
  DoorOpen,
  Laptop,
  LayoutDashboard,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2,
  ShieldCheck,
  KeyRound,
  MapPin,
} from 'lucide-react';

export default function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';
  const portal = searchParams.get('portal'); // 'rooms' | 'laptops' | 'dashboard'

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Portal metadata helper
  const getPortalDetails = () => {
    switch (portal) {
      case 'rooms':
        return {
          name: 'Discussion Rooms Portal',
          subtitle: 'Collaborative Space Reservations',
          location: '2nd Floor Left Wing, Norbert Building (Inside Library)',
          icon: DoorOpen,
          badge: 'Discussion Space Desk',
          status: '5 of 5 Spaces Ready',
          chips: [
            '5 Spaces (DR-A to DR-E)',
            'Capacity: 3 to 15 Students',
            'Equipped with Table & Chairs',
            'Collision-Free Scheduler',
          ],
        };
      case 'laptops':
        return {
          name: 'Laptop Borrowing Services',
          subtitle: 'Circulation & Hardware Custody Desk',
          location: 'LIRC Circulation Counter • Hardware Shelf A',
          icon: Laptop,
          badge: 'Laptop Services Desk',
          status: '5 Laptops on Shelf',
          chips: [
            'Dell, Lenovo, HP & Mac Fleet',
            'Real-Time Overdue Timers',
            'Return Condition Audits',
            'Hardware Custody Logs',
          ],
        };
      case 'dashboard':
        return {
          name: 'Unified Operations Dashboard',
          subtitle: 'Consolidated Administrative Command',
          location: 'LIRC Administrative Operations Hub',
          icon: LayoutDashboard,
          badge: 'Master Supervisory Desk',
          status: 'All Systems Online',
          chips: [
            'Simultaneous Multi-Desk View',
            'Unified Booking & Loan Ledgers',
            'Staff Activity Audit Trails',
            'Real-Time Facility Analytics',
          ],
        };
      default:
        return {
          name: 'Operations Portal',
          subtitle: 'LIRC Counter Administration Desk',
          location: 'Learning Information & Resource Center (LIRC)',
          icon: Building2,
          badge: 'Central Desk Gateway',
          status: 'Ready for Authentication',
          chips: [
            'Discussion Space Reservations',
            'Laptop Lending Circulation',
            'Verified Staff Access Only',
            'Authorized Desk Access',
          ],
        };
    }
  };

  const portalDetails = getPortalDetails();
  const PortalIcon = portalDetails.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      if (portal === 'rooms') {
        router.push('/rooms');
      } else if (portal === 'laptops') {
        router.push('/laptops');
      } else if (portal === 'dashboard') {
        router.push('/dashboard');
      } else {
        router.push('/portal');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-slate-900 font-sans selection:bg-[#8B1515] selection:text-white">
      {/* ============================================================== */}
      {/* LEFT PANE: Centered Text & Atmospheric Campus Showcase */}
      {/* ============================================================== */}
      <div className="relative lg:w-1/2 xl:w-7/12 flex flex-col justify-between p-6 sm:p-10 lg:p-10 xl:p-12 overflow-hidden text-white lg:h-full shrink-0">
        {/* Full Campus Background Image with Cor Jesu Crimson Gradient */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/cjc-campus.jpg"
            alt="Cor Jesu College Norbert Building"
            className="w-full h-full object-cover object-[center_35%] filter brightness-95 contrast-105"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(
                  145deg,
                  rgba(139, 21, 21, 0.93) 0%,
                  rgba(110, 15, 15, 0.89) 50%,
                  rgba(26, 6, 6, 0.95) 100%
                )
              `,
            }}
          />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* Top: School Brand & Seal */}
        <div className="relative z-10 flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white p-1 border border-white/20 shadow-md flex items-center justify-center shrink-0">
              <img
                src="/cjc-logo.png"
                alt="Cor Jesu College Official Seal"
                width={44}
                height={44}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-serif font-bold text-base sm:text-lg xl:text-xl text-white tracking-tight leading-tight flex items-center gap-2">
                COR JESU COLLEGE
                <span className="text-[10px] font-sans font-bold bg-white/20 text-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
                  LIRC
                </span>
              </div>
              <div className="text-xs text-rose-100/80 font-medium">
                Learning Information & Resource Center • Digos City, Davao del Sur
              </div>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-rose-100/90 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Staff Portal</span>
          </div>
        </div>

        {/* Center: Centered Text & Centered Frosted Card */}
        <div className="relative z-10 my-auto py-4 max-w-xl w-full mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-300/30 text-rose-100 text-xs font-semibold mb-3 backdrop-blur-md shadow-xs mx-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Administrative Operations Gateway
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] mb-2.5 text-center">
            Library Booking System
          </h1>

          <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed font-normal mb-6 max-w-lg mx-auto text-center">
            Unified administrative desk for Discussion Room Bookings & Laptop Borrowing Services.
          </p>

          {/* Centered Frosted Glassmorphism Feature Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-6 shadow-2xl text-white w-full max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
                  <PortalIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-rose-200">
                    {portalDetails.badge}
                  </div>
                  <h2 className="font-serif text-lg font-bold text-white tracking-tight">
                    {portalDetails.name}
                  </h2>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-400/40 text-emerald-300 text-xs font-semibold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {portalDetails.status}
              </span>
            </div>

            <p className="text-xs text-rose-100/85 mb-3 text-center sm:text-left font-medium flex items-center justify-center sm:justify-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span>{portalDetails.location}</span>
            </p>

            {/* 4 Clean Feature Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-white/15 text-xs text-rose-100 text-left">
              {portalDetails.chips.map((chip, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{chip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Institutional Heritage */}
        <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-rose-200/80 font-medium w-full">
          <div>Cor Jesu College • Founded 1959</div>
          <div>Digos City, Davao del Sur</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT PANE: Clean Pure White Background Sign In Console */}
      {/* ============================================================== */}
      <div className="lg:w-1/2 xl:w-5/12 bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-10 xl:p-14 shadow-2xl relative z-10 lg:h-full overflow-y-auto lg:overflow-hidden">
        {/* Top Bar: Return to Portal Selection */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#8B1515] transition-colors group px-2.5 py-1 rounded-lg hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#8B1515]" />
            <span>Return to Portal Gateway</span>
          </Link>

          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            Staff Authentication
          </span>
        </div>

        {/* Center: Clean Sign In Form (Pure White Background) */}
        <div className="max-w-md w-full mx-auto my-auto py-4 sm:py-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#8B1515] text-xs font-bold mb-3 shadow-2xs">
              <PortalIcon className="w-3.5 h-3.5" />
              <span>{portalDetails.name}</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">
              Staff Sign In
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Enter your verified credentials to access the desk.
            </p>
          </div>

          {/* Registration Success Alert */}
          {isRegistered && !error && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs shadow-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="leading-relaxed font-medium">
                Registration successful! Sign in below with your credentials.
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#8B1515]" />
              <div className="leading-relaxed font-medium">
                {error}
              </div>
            </div>
          )}

          {/* Form with Clean White Input Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* USERNAME / EMAIL */}
            <div>
              <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  autoCapitalize="none"
                  spellCheck="false"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515] transition-all shadow-xs"
                />
              </div>
            </div>

            {/* PASSWORD WITH VISIBILITY TOGGLE */}
            <div>
              <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515] transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}
            <div className="flex items-center text-xs text-slate-500 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8B1515] focus:ring-[#8B1515] border-slate-300"
                />
                <span>Remember session</span>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-5 bg-[#8B1515] hover:bg-[#721111] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-red-950/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to Desk</span>
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Need a staff account?{' '}
              <Link
                href="/register"
                className="font-bold text-[#8B1515] hover:underline transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div>© 1959–2026 Cor Jesu College, Inc. LIRC</div>
          <Link href="/" className="hover:text-slate-600 transition-colors">
            Public Home
          </Link>
        </div>
      </div>
    </div>
  );
}