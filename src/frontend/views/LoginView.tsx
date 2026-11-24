'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  DoorOpen,
  Laptop,
  LayoutDashboard,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  Building2,
  KeyRound,
  Clock,
  Sparkles,
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

  // Portal metadata helper
  const getPortalInfo = () => {
    switch (portal) {
      case 'rooms':
        return {
          title: 'Discussion Rooms Portal',
          subtitle: 'Collaborative Space Reservations & Attendance Ledger',
          location: '2nd Floor Left Wing, Norbert Building (Inside Library)',
          icon: DoorOpen,
          badge: 'Discussion Space Desk',
          accent: 'text-amber-200 border-amber-300/30 bg-amber-950/40',
          summary: 'Manage room bookings, coordinate student study groups, and prevent schedule collisions across all 5 discussion spaces (DR-A to DR-E).',
          highlights: [
            '5 Dedicated Discussion Spaces',
            'Enforces 3 to 15 Student Capacity',
            'Equipped with Table & Chairs',
            'Automated Collision-Free Scheduler',
          ],
        };
      case 'laptops':
        return {
          title: 'Laptop Borrowing Services',
          subtitle: 'Circulation Desk & Hardware Custody Auditing',
          location: 'LIRC Circulation Counter • Hardware Shelf A',
          icon: Laptop,
          badge: 'Laptop Services Desk',
          accent: 'text-blue-200 border-blue-300/30 bg-blue-950/40',
          summary: 'Check out verified laptops to patrons, manage real-time loan countdown timers, and inspect hardware condition grading on return.',
          highlights: [
            'Dell, Lenovo, HP & Mac Inventory',
            'Multi-Point Return Condition Audit',
            'Real-Time Overdue Countdown Alerts',
            'Custody Checklists & Accessory Logs',
          ],
        };
      case 'dashboard':
        return {
          title: 'Unified Master Dashboard',
          subtitle: 'Consolidated Administrative Command Desk',
          location: 'LIRC Administrative Operations Hub',
          icon: LayoutDashboard,
          badge: 'Master Supervisory Hub',
          accent: 'text-rose-200 border-rose-300/30 bg-red-950/40',
          summary: 'Consolidated supervision desk providing simultaneous oversight over room reservations, laptop custody ledgers, and staff operations.',
          highlights: [
            'Full Simultaneous Multi-Desk View',
            'Cross-Subsystem Analytics & Ledger',
            'Staff Activity Audit Trails',
            'Live Room & Hardware Fleet Status',
          ],
        };
      default:
        return {
          title: 'Operations Desk',
          subtitle: 'LIRC Administrative Counter Console',
          location: 'Learning Information & Resource Center (LIRC)',
          icon: Building2,
          badge: 'Central Operations Gateway',
          accent: 'text-rose-200 border-rose-300/30 bg-red-950/40',
          summary: 'Sign in to access your designated operational desk for library room bookings and hardware borrowing services.',
          highlights: [
            'Discussion Space Reservations',
            'Laptop Lending Circulation',
            'Institutional Staff Credentials',
            'Authorized Personnel Access Only',
          ],
        };
    }
  };

  const portalInfo = getPortalInfo();
  const PortalIcon = portalInfo.icon;

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
      {/* LEFT PANE: Full-Width Utilized Campus Showcase & Two-Card Deck */}
      {/* ============================================================== */}
      <div className="relative lg:w-1/2 xl:w-7/12 flex flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-12 overflow-hidden text-white lg:h-full shrink-0">
        {/* Full Campus Background Image with Deep Crimson-and-Navy Gradient */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/cjc-campus.jpg"
            alt="Cor Jesu College Norbert Building Campus"
            className="w-full h-full object-cover object-[center_35%] filter brightness-95 contrast-105"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(
                  145deg,
                  rgba(139, 21, 21, 0.94) 0%,
                  rgba(100, 12, 12, 0.90) 45%,
                  rgba(26, 6, 6, 0.96) 100%
                )
              `,
            }}
          />
          {/* Subtle Institutional Grid Texture */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* Top: Institutional Brand & Seal + Counter Schedule Pill */}
        <div className="relative z-10 flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white p-1 border border-white/20 shadow-md flex items-center justify-center shrink-0">
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

          <div className="hidden sm:flex items-center gap-2 text-xs text-rose-200/90 bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Counter: Mon–Fri 8:00 AM – 5:00 PM</span>
          </div>
        </div>

        {/* Center: Full-Width Headings & Two-Card Side-by-Side Deck */}
        <div className="relative z-10 my-auto py-3 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-300/30 text-rose-100 text-xs font-semibold mb-2.5 backdrop-blur-md shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Administrative Operations Gateway
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] mb-2">
            Institutional Desk Authentication
          </h1>

          <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed font-normal mb-5 max-w-2xl">
            Cor Jesu College administrative portal uniting collaborative discussion spaces and hardware lending into a synchronized, conflict-free desk.
          </p>

          {/* Fully Utilized Two-Card Side-by-Side Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-5 w-full">
            {/* Card 1: Active Target Counter Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl p-5 shadow-xl text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${portalInfo.accent}`}>
                    {portalInfo.badge}
                  </span>
                  <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Target Active
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
                    <PortalIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-white tracking-tight leading-tight">
                      {portalInfo.title}
                    </h2>
                    <p className="text-[11px] text-rose-200/90 mt-0.5">
                      📍 {portalInfo.location}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-rose-100/85 leading-relaxed mb-3">
                  {portalInfo.summary}
                </p>

                <div className="space-y-1.5 pt-2.5 border-t border-white/15 text-xs text-rose-100">
                  {portalInfo.highlights.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-rose-200/80">
                <span>Counter Desk Ready</span>
                <span className="text-emerald-300 font-semibold">● Collision Engine Active</span>
              </div>
            </div>

            {/* Card 2: Operating Standards & Counter Guidelines */}
            <div className="bg-black/25 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-xl text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/20 bg-white/10 text-rose-100">
                    Desk Guidelines
                  </span>
                  <span className="text-xs text-rose-200 font-medium">
                    LIRC Policy
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-white tracking-tight leading-tight">
                      Operating Standards
                    </h2>
                    <p className="text-[11px] text-rose-200/80 mt-0.5">
                      Official Library Booking Policies
                    </p>
                  </div>
                </div>

                <p className="text-xs text-rose-100/85 leading-relaxed mb-3">
                  All room bookings and hardware borrowings are governed under official LIRC counter policies:
                </p>

                <div className="space-y-1.5 pt-2.5 border-t border-white/15 text-xs text-rose-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Patron Verification: Active CJC Student ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Discussion Space: Strictly 3 to 15 Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Amenities: Table & Chairs collaborative space</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Hardware Custody: Inspected before and on return</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-rose-200/80">
                <span>Standard Max Slot: 2 Hours</span>
                <span className="text-rose-200/90 font-medium">Inside Norbert Building</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Institutional Security Status & Heritage */}
        <div className="relative z-10 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-rose-200/80 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit SSL Encrypted Staff Operations Session</span>
          </div>
          <div>
            Cor Jesu College • Founded 1959
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT PANE: Modern High-End Authentication Card (Centered) */}
      {/* ============================================================== */}
      <div className="lg:w-1/2 xl:w-5/12 bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-10 xl:p-14 shadow-2xl relative z-10 lg:h-full overflow-y-auto lg:overflow-hidden">
        {/* Top Bar: Return to Portal Selection */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#8B1515] transition-colors group px-2.5 py-1 rounded-lg hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#8B1515]" />
            <span>Return to Portal Gateway</span>
          </Link>

          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            Staff Desk Access
          </span>
        </div>

        {/* Center: Auth Form Container (Centered & Well-Proportioned) */}
        <div className="max-w-md w-full mx-auto my-auto py-4 sm:py-6">
          {/* Centered Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#8B1515] text-xs font-bold mb-3 shadow-2xs">
              <PortalIcon className="w-3.5 h-3.5" />
              <span>Unlocking: {portalInfo.title}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Staff Sign In
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
              Authenticate with your verified employee credentials to open the {portalInfo.title.toLowerCase()}.
            </p>
          </div>

          {/* Registration Success Alert */}
          {isRegistered && !error && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="leading-relaxed font-medium">
                <strong>Registration successful!</strong> Your staff account is created. Sign in below to proceed.
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs shadow-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#8B1515]" />
              <div className="leading-relaxed font-medium">
                {error}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* USERNAME / EMPLOYEE ID */}
            <div>
              <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                <span>Username or Email</span>
                <span className="text-[11px] font-normal text-slate-400 lowercase">staff.desk@cjc.edu.ph</span>
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
                  placeholder="Enter employee username or email"
                  className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515] transition-all shadow-xs"
                />
              </div>
            </div>

            {/* PASSWORD WITH VISIBILITY TOGGLE */}
            <div>
              <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                <span>Password</span>
                <span className="text-[11px] font-normal text-slate-400">Confidential</span>
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
                  placeholder="Enter your confidential password"
                  className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1515]/20 focus:border-[#8B1515] transition-all shadow-xs"
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
              className="w-full mt-2 py-3.5 px-5 bg-[#8B1515] hover:bg-[#721111] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-red-950/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Unlock {portalInfo.title}</span>
                </>
              )}
            </button>
          </form>

          {/* New Staff Registration Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Need staff desk authorization?{' '}
              <Link
                href="/register"
                className="font-bold text-[#8B1515] hover:underline transition-colors inline-flex items-center gap-1"
              >
                Register new staff account
              </Link>
            </p>
          </div>

          {/* Security Notice Box */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-center gap-2.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#8B1515] shrink-0" />
            <span>Authorized Cor Jesu College library personnel only. Sessions are audited.</span>
          </div>
        </div>

        {/* Bottom Institutional Disclaimer */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs text-slate-400 shrink-0">
          <div>
            © 1959–2026 Cor Jesu College, Inc. LIRC
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:text-slate-600 transition-colors">
              Public Home
            </Link>
            <span>•</span>
            <Link href="/portal" className="hover:text-slate-600 transition-colors">
              Portal Gateway
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}