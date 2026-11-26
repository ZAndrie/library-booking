'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  ArrowLeft,
  DoorOpen,
  Laptop,
  LayoutDashboard,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { clearClientUserCache } from '@/lib/clientDataCache';
import { useToast } from '@/frontend/components/ToastProvider';

export default function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const portalParam = searchParams.get('portal'); // optional redirect hint: 'rooms' | 'laptops' | 'dashboard'
  const [selectedDesk, setSelectedDesk] = useState<'rooms' | 'laptops'>(
    portalParam === 'laptops' ? 'laptops' : 'rooms'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Portal metadata helper
  const getPortalDetails = () => {
    if (portalParam === 'dashboard') {
      return {
        name: 'Operations Dashboard',
        subtitle: 'Administrative Operations Hub',
        icon: LayoutDashboard,
      };
    }
    if (selectedDesk === 'laptops') {
      return {
        name: 'Laptop Borrowing Desk',
        subtitle: 'Circulation & Hardware Custody Desk',
        icon: Laptop,
      };
    }
    return {
      name: 'Discussion Rooms Desk',
      subtitle: 'Collaborative Space Reservations',
      icon: DoorOpen,
    };
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
        body: JSON.stringify({ email, password, portal: selectedDesk }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      clearClientUserCache();

      toast.success(`Signed in as ${data.user?.name || email}.`, 'Welcome Back');

      const role = data.user?.role;
      if (role === 'admin' || role === 'super_admin') {
        if (portalParam === 'rooms' || portalParam === 'laptops') {
          router.push(`/${portalParam}`);
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push(`/${selectedDesk}`);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Sign in failed', 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900 font-sans selection:bg-[#8B1515] selection:text-white">
      {/* ============================================================== */}
      {/* MOBILE HEADER BANNER: Clean, Compact School Branding (< lg)   */}
      {/* ============================================================== */}
      <div className="lg:hidden relative text-white px-4 sm:px-6 py-4 overflow-hidden shrink-0 border-b border-red-950/40 shadow-md">
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
                  rgba(139, 21, 21, 0.94) 0%,
                  rgba(110, 15, 15, 0.90) 50%,
                  rgba(26, 6, 6, 0.96) 100%
                )
              `,
            }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-white/20 shadow-md flex items-center justify-center shrink-0">
              <img
                src="/cjc-logo.png"
                alt="Cor Jesu College Official Seal"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-white tracking-tight leading-tight flex items-center gap-1.5">
                COR JESU COLLEGE
                <span className="text-[9px] font-sans font-bold bg-white/20 text-rose-100 px-1.5 py-0.5 rounded-full uppercase">
                  LIRC
                </span>
              </div>
              <div className="text-[11px] text-rose-100/80 font-medium">
                Library Booking System
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-[11px] text-rose-100 font-semibold shrink-0">
            <PortalIcon className="w-3.5 h-3.5 text-rose-200" />
            <span>{portalDetails.name}</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DESKTOP/LAPTOP LEFT PANE: Centered Typography & Showcase (>= lg)*/}
      {/* ============================================================== */}
      <div className="hidden lg:flex relative lg:w-1/2 xl:w-7/12 flex-col justify-between p-8 xl:p-12 overflow-hidden text-white lg:min-h-screen shrink-0">
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
        <div className="relative z-10 flex items-center gap-3.5 w-full">
          <div className="w-11 h-11 rounded-2xl bg-white p-1 border border-white/20 shadow-md flex items-center justify-center shrink-0">
            <img
              src="/cjc-logo.png"
              alt="Cor Jesu College Official Seal"
              width={44}
              height={44}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="font-serif font-bold text-base sm:text-lg text-white tracking-tight leading-tight flex items-center gap-2">
              COR JESU COLLEGE
              <span className="text-[10px] font-sans font-bold bg-white/20 text-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
                LIRC
              </span>
            </div>
          </div>
        </div>

        {/* Center: Clean Minimal Showcase */}
        <div className="relative z-10 my-auto py-4 max-w-lg w-full mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-rose-100 text-xs font-semibold mb-4 backdrop-blur-md">
            <PortalIcon className="w-3.5 h-3.5 text-rose-200" />
            <span>{portalDetails.name}</span>
          </div>

          <h1 className="font-serif text-4xl xl:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] mb-2.5 text-center">
            Library Booking System
          </h1>

          <p className="text-sm sm:text-base text-rose-100/90 font-medium text-center">
            {portalDetails.subtitle}
          </p>
        </div>

        {/* Bottom */}
        <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-rose-200/80 font-medium w-full">
          <div>Cor Jesu College • LIRC</div>
          <div>Digos City, Davao del Sur</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT PANE: Clean Pure White Background Sign In Console       */}
      {/* ============================================================== */}
      <div className="flex-1 lg:w-1/2 xl:w-5/12 bg-white flex flex-col justify-between p-5 sm:p-8 lg:p-8 xl:p-12 shadow-2xl relative z-10 lg:min-h-screen overflow-y-auto">
        {/* Top Bar: Return to Public Home */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#8B1515] transition-colors group px-2.5 py-1 rounded-lg hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#8B1515]" />
            <span>Public Home</span>
          </Link>
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
          </div>

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
            {/* SHIFT COUNTER DESK SELECTOR */}
            <div>
              <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-1.5">
                Shift Counter Desk
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedDesk('rooms')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedDesk === 'rooms'
                      ? 'bg-white text-[#8B1515] shadow-xs border border-red-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <DoorOpen className="w-3.5 h-3.5" />
                  <span>Discussion Rooms</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDesk('laptops')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedDesk === 'laptops'
                      ? 'bg-white text-[#8B1515] shadow-xs border border-red-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Laptop Borrowing</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Staff enter their chosen shift desk; Admins land on Operations Dashboard.
              </p>
            </div>

            {/* EMAIL ADDRESS */}
            <div>
              <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  autoCapitalize="none"
                  spellCheck="false"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
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
        </div>

        {/* Bottom Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div>© 2026 Cor Jesu College • LIRC</div>
          <Link href="/" className="hover:text-slate-600 transition-colors">
            Public Home
          </Link>
        </div>
      </div>
    </div>
  );
}