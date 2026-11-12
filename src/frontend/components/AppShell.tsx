'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  DoorOpen,
  CalendarPlus,
  CalendarDays,
  Clock,
  BookOpen,
  BarChart3,
  TrendingUp,
  Laptop,
  MonitorCheck,
  AlertTriangle,
  HardDrive,
  LogOut,
  Menu,
  X,
  User,
  ShieldCheck,
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

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  onClick?: () => void;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  const navSections: NavSection[] = [
    {
      label: 'MAIN',
      items: [
        { label: 'Dashboard', href: '/', icon: LayoutDashboard },
        { label: 'Rooms', href: '/rooms', icon: DoorOpen },
      ],
    },
    {
      label: 'BOOKINGS',
      items: [
        { label: 'Add Booking', href: '/rooms?action=new', icon: CalendarPlus },
        { label: 'All Bookings', href: '/rooms', icon: CalendarDays },
        { label: 'Pending', href: '/rooms?filter=pending', icon: Clock, badge: '0' },
        { label: 'Ledger', href: '/rooms?tab=ledger', icon: BookOpen },
        { label: 'Time Plotter', href: '/rooms?tab=plotter', icon: BarChart3 },
        { label: 'Analytics', href: '/rooms?tab=analytics', icon: TrendingUp },
      ],
    },
    {
      label: 'LAPTOPS (SYSTEM 2)',
      items: [
        { label: 'Checkout Desk', href: '/laptops?action=checkout', icon: Laptop },
        { label: 'Active Loans', href: '/laptops?filter=active', icon: MonitorCheck },
        { label: 'Overdue Tracker', href: '/laptops?filter=overdue', icon: AlertTriangle },
        { label: 'Fleet Inventory', href: '/laptops', icon: HardDrive },
      ],
    },
    {
      label: 'ACCOUNT',
      items: [
        { label: 'Logout', href: '#logout', icon: LogOut, onClick: handleLogout },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#8B1515] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-900/60 border border-red-400/40 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-serif font-bold text-base tracking-wide leading-tight">Library Booking System</div>
            <div className="text-[9px] uppercase tracking-wider text-rose-200">Rooms & Laptops Desk</div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-red-900/60 text-white hover:bg-red-900"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Crimson Left Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#8B1515] text-white flex flex-col justify-between z-40 shadow-xl transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-6">
          {/* Brand Emblem */}
          <div className="flex items-center gap-3 px-2 pb-4 border-b border-red-700/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-700 to-red-950 p-0.5 border border-red-400/30 flex items-center justify-center shadow-inner">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg leading-tight tracking-wide text-white">
                Library Booking
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-rose-200/90 font-medium">
                BOOKING & LOAN SYSTEM
              </p>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-5">
            {navSections.map((section) => (
              <div key={section.label} className="space-y-1">
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-rose-200/70 mb-1">
                  {section.label}
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isCurrent =
                      item.href === '/'
                        ? pathname === '/'
                        : !item.href.startsWith('#') && pathname.startsWith(item.href.split('?')[0]);

                    if (item.onClick) {
                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            item.onClick?.();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-100 hover:bg-red-900/70 hover:text-white transition-colors group"
                        >
                          <Icon className="w-4 h-4 text-rose-300 group-hover:text-white transition-colors" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                          isCurrent
                            ? 'bg-red-900/90 text-white font-semibold shadow-inner border-l-4 border-rose-300'
                            : 'text-rose-100/90 hover:bg-red-900/60 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              isCurrent ? 'text-white' : 'text-rose-300 group-hover:text-white'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] bg-red-950/70 text-rose-200 px-1.5 py-0.5 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Card at Bottom */}
        <div className="p-4 border-t border-red-700/60 bg-red-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-red-800 border border-red-500/40 flex items-center justify-center font-bold text-xs text-white">
                {user ? user.name.slice(0, 2).toUpperCase() : 'LA'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.name || 'Library Admin'}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-red-900/90 text-rose-200 px-1.5 py-0.2 rounded border border-red-600/40">
                    {user?.role ? user.role.replace('_', ' ') : 'ADMIN'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-rose-300 hover:text-white hover:bg-red-900/60 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <footer className="py-4 px-6 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Library Booking System • Discussion Rooms & Laptop Fleet Desk</span>
          <span className="text-[11px] text-slate-400">Node.js + MongoDB + Next.js</span>
        </footer>
      </div>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
        />
      )}
    </div>
  );
}
