'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  DoorOpen,
  Laptop,
  LogOut,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'staff';
  employeeId: string;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    }
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    {
      label: 'Operations Hub',
      href: '/',
      icon: LayoutDashboard,
      desc: 'Combined System Overview',
    },
    {
      label: 'Discussion Rooms',
      href: '/rooms',
      icon: DoorOpen,
      desc: 'Schedules & Reservations',
      badge: 'System 1',
    },
    {
      label: 'Laptop Borrowing',
      href: '/laptops',
      icon: Laptop,
      desc: 'Checkout, Returns & Inventory',
      badge: 'System 2',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-900/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Library Operations Hub
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                  Staff Only
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Unified Discussion Rooms & Laptop Borrowing Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentTime && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentTime}</span>
              </div>
            )}

            {user && (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <div className="text-right">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5 justify-end">
                    {user.name}
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        user.role === 'super_admin'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : user.role === 'admin'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{user.employeeId}</div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out of operations hub"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Primary Subsystem Navigation Bar */}
        <div className="bg-slate-900/90 border-t border-slate-800/60 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                          isActive
                            ? 'bg-emerald-700 text-emerald-100'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-400">Desk Terminal Ready</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Library Operations Terminal (Admin/Staff) • Dual Subsystem Engine</span>
          <span>Deployable on Vercel • MongoDB Atlas</span>
        </div>
      </footer>
    </div>
  );
}
