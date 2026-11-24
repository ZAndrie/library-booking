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
} from 'lucide-react';

export default function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';
  const portal = searchParams.get('portal'); // 'rooms' | 'laptops' | 'dashboard'

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Simplified portal target info
  const getPortalDetails = () => {
    switch (portal) {
      case 'rooms':
        return {
          name: 'Discussion Rooms Portal',
          icon: DoorOpen,
          badge: 'Discussion Space Desk',
        };
      case 'laptops':
        return {
          name: 'Laptop Borrowing Services',
          icon: Laptop,
          badge: 'Laptop Services Desk',
        };
      case 'dashboard':
        return {
          name: 'Unified Operations Dashboard',
          icon: LayoutDashboard,
          badge: 'Master Supervisory Desk',
        };
      default:
        return {
          name: 'Operations Portal',
          icon: Building2,
          badge: 'LIRC Staff Counter',
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
      {/* LEFT PANE: Clean, Atmospheric Campus Showcase */}
      {/* ============================================================== */}
      <div className="relative lg:w-1/2 xl:w-7/12 flex flex-col justify-between p-8 sm:p-12 lg:p-14 overflow-hidden text-white lg:h-full shrink-0">
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
                  rgba(139, 21, 21, 0.92) 0%,
                  rgba(110, 15, 15, 0.88) 50%,
                  rgba(30, 8, 8, 0.95) 100%
                )
              `,
            }}
          />
        </div>

        {/* Top: School Brand & Seal */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-white/20 shadow-md flex items-center justify-center shrink-0">
            <img
              src="/cjc-logo.png"
              alt="Cor Jesu College Official Seal"
              width={44}
              height={44}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="font-serif font-bold text-lg sm:text-xl text-white tracking-tight leading-tight flex items-center gap-2">
              COR JESU COLLEGE
              <span className="text-[10px] font-sans font-bold bg-white/20 text-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
                LIRC
              </span>
            </div>
            <div className="text-xs text-rose-100/80 font-medium">
              Learning Information & Resource Center
            </div>
          </div>
        </div>

        {/* Center: Simple, Bold Title & Subtle Desk Indicator */}
        <div className="relative z-10 my-auto py-6 max-w-lg">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            Library Booking System
          </h1>
          <p className="mt-3 text-base sm:text-lg text-rose-100/90 font-normal leading-relaxed">
            Discussion Room Bookings & Laptop Borrowing Services
          </p>

          {/* Simple Clean Portal Target Pill */}
          {portal && (
            <div className="mt-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium shadow-sm">
              <PortalIcon className="w-4 h-4 text-rose-200" />
              <span>Target Desk: <strong>{portalDetails.name}</strong></span>
            </div>
          )}
        </div>

        {/* Bottom: Minimal Footer */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-rose-200/80 font-medium">
          <div>Cor Jesu College • Digos City, Davao del Sur</div>
          <div>Founded 1959</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT PANE: Simple, Clean Authentication Form */}
      {/* ============================================================== */}
      <div className="lg:w-1/2 xl:w-5/12 bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 shadow-2xl relative z-10 lg:h-full overflow-y-auto lg:overflow-hidden">
        {/* Top Bar: Return to Portal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#8B1515] transition-colors group px-2.5 py-1 rounded-lg hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#8B1515]" />
            <span>Return to Portal</span>
          </Link>

          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            Staff Sign In
          </span>
        </div>

        {/* Center: Clean Simple Form */}
        <div className="max-w-md w-full mx-auto my-auto py-6">
          {/* Header */}
          <div className="text-center mb-7">
            {portal && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#8B1515] text-xs font-bold mb-3">
                <PortalIcon className="w-3.5 h-3.5" />
                <span>{portalDetails.name}</span>
              </div>
            )}
            <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">
              Sign In
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Enter your staff credentials to continue.
            </p>
          </div>

          {/* Registration Success Alert */}
          {isRegistered && !error && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs shadow-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="leading-relaxed font-medium">
                Registration successful! Sign in below with your credentials.
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#8B1515]" />
              <div className="leading-relaxed font-medium">
                {error}
              </div>
            </div>
          )}

          {/* Form */}
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
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515] transition-all shadow-xs"
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

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-5 bg-[#8B1515] hover:bg-[#721111] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-red-950/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              No account yet?{' '}
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
          <div>© 1959–2026 Cor Jesu College, Inc.</div>
          <Link href="/" className="hover:text-slate-600 transition-colors">
            Public Home
          </Link>
        </div>
      </div>
    </div>
  );
}