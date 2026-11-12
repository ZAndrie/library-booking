'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  User,
  Mail,
  Lock,
  BadgeCheck,
  AlertCircle,
  LogIn,
  Crown,
  Shield,
  Briefcase,
  UserPlus,
} from 'lucide-react';
import { UserRole } from '@/backend/models/User';

export default function RegisterView() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    password: '',
    confirmPassword: '',
    role: 'staff' as UserRole,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          employeeId: formData.employeeId,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions: {
    id: UserRole;
    title: string;
    description: string;
    icon: any;
  }[] = [
    {
      id: 'staff',
      title: 'Staff',
      description: 'Room reservations & laptop counter checkouts/returns.',
      icon: Briefcase,
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Fleet catalog, room facilities & operational reports.',
      icon: Shield,
    },
    {
      id: 'super_admin',
      title: 'Super Admin',
      description: 'Master privileges, user governance & full access.',
      icon: Crown,
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: '#8B1515',
        backgroundImage: `
          radial-gradient(circle at center, rgba(139, 21, 21, 0.95), rgba(80, 10, 10, 1)),
          radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 0)
        `,
        backgroundSize: '100% 100%, 22px 22px',
      }}
    >
      <div className="w-full max-w-[520px] bg-white rounded-3xl p-8 sm:p-10 shadow-2xl">
        {/* Card Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 bg-[#8B1515] rounded-2xl flex items-center justify-center shadow-lg shadow-red-950/20">
            <BookOpen className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#8B1515] tracking-tight">
            Library Booking System
          </h1>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 mt-1 font-semibold">
            STAFF & OFFICER REGISTRATION
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-600 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Role Selection */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5">
              AUTHORIZATION ROLE *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = formData.role === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: opt.id })}
                    className={`text-left p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-[#8B1515] bg-red-50 ring-2 ring-[#8B1515]/30 text-[#8B1515]'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-bold text-xs">{opt.title}</span>
                    </div>
                    <p className="text-[10px] leading-tight text-slate-500">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Name & Employee ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5">
                FULL NAME *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Miller"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1515] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5">
                STAFF / EMPLOYEE ID *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. STF-101"
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })
                  }
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#8B1515] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Official Email */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5">
              OFFICIAL EMAIL *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="name@library.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1515] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5">
                PASSWORD *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1515] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5">
                CONFIRM PASSWORD *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1515] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-5 py-2.5 px-4 bg-[#8B1515] hover:bg-[#991b1b] text-white font-semibold text-xs rounded-lg shadow-md shadow-red-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link
            href="/login"
            className="font-bold text-[#8B1515] hover:underline transition-colors"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
