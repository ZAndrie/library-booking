'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, User, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function LoginView() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: '#b91c1c',
        backgroundImage: `
          radial-gradient(circle at center, rgba(185, 28, 28, 0.95), rgba(127, 29, 29, 1)),
          radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 0)
        `,
        backgroundSize: '100% 100%, 22px 22px',
      }}
    >
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 sm:p-10 shadow-2xl">
        {/* Card Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 bg-[#b91c1c] rounded-2xl flex items-center justify-center shadow-lg shadow-red-950/20">
            <BookOpen className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#b91c1c] tracking-tight">
            Library Booking
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Staff & Librarian Portal
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-600 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* USERNAME */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5">
              USERNAME
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {/* SIGN IN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-2.5 px-4 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-semibold text-sm rounded-lg shadow-md shadow-red-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>
            No account yet?{' '}
            <Link
              href="/register"
              className="font-bold text-[#b91c1c] hover:underline transition-colors"
            >
              Register here
            </Link>
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Default admin: admin / Admin@1234
          </p>
        </div>
      </div>
    </div>
  );
}
