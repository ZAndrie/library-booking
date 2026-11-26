'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ClientUserProfile,
  clearClientUserCache,
  fetchClientUser,
  getStoredClientUser,
} from '@/lib/clientDataCache';
import { useToast } from '@/frontend/components/ToastProvider';
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
  Users,
  FileText,
  Sliders,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

type UserProfile = ClientUserProfile;

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
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(() => getStoredClientUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRoomsPortal = pathname.startsWith('/rooms');
  const isLaptopsPortal = pathname.startsWith('/laptops');
  const isAdminPortal = pathname.startsWith('/admin');
  const isDashboard = pathname.startsWith('/dashboard');

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const isStaff = user?.role === 'staff';

  const isUnauthorizedStaffRoute =
    isStaff &&
    (isDashboard ||
      isAdminPortal ||
      !user?.portal ||
      (user.portal === 'rooms' && isLaptopsPortal) ||
      (user.portal === 'laptops' && isRoomsPortal));

  useEffect(() => {
    if (!isStaff) return;
    if (isUnauthorizedStaffRoute) {
      const target =
        user?.portal === 'rooms'
          ? '/rooms'
          : user?.portal === 'laptops'
          ? '/laptops'
          : '/login';
      router.replace(target);
    }
  }, [isStaff, isUnauthorizedStaffRoute, user?.portal, router]);

  useEffect(() => {
    const stored = getStoredClientUser();
    if (stored) {
      setUser(stored);
    }

    let cancelled = false;
    fetchClientUser().then((nextUser) => {
      if (cancelled) return;
      if (nextUser) {
        setUser(nextUser);
      } else {
        router.push('/login');
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      clearClientUserCache();
      toast.info('Your desk session has ended.', 'Signed Out');
      router.push('/login');
      router.refresh();
    }
  };

  const getNavSections = (): NavSection[] => {
    if (!isAdmin) {
      const assignedPortal = user?.portal || (isLaptopsPortal ? 'laptops' : 'rooms');
      return [
        {
          label: 'SERVICE DESK',
          items: [
            assignedPortal === 'laptops'
              ? { label: 'Laptop Borrowing', href: '/laptops', icon: Laptop }
              : { label: 'Discussion Rooms', href: '/rooms', icon: DoorOpen },
          ],
        },
        {
          label: 'ACCOUNT',
          items: [
            { label: 'Logout', href: '#logout', icon: LogOut, onClick: handleLogout },
          ],
        },
      ];
    }

    const sections: NavSection[] = [
      {
        label: 'OPERATIONS',
        items: [
          { label: 'Operations Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ],
      },
      {
        label: 'SERVICE DESKS',
        items: [
          { label: 'Discussion Rooms', href: '/rooms', icon: DoorOpen },
          { label: 'Laptop Borrowing', href: '/laptops', icon: Laptop },
        ],
      },
      {
        label: 'ADMINISTRATION',
        items: [
          { label: 'Staff Accounts', href: '/admin/users', icon: Users },
          { label: 'Audit Logs & Reports', href: '/admin/audit', icon: FileText },
          ...(isSuperAdmin
            ? [{ label: 'System Policies', href: '/admin/settings', icon: Sliders }]
            : []),
        ],
      },
      {
        label: 'ACCOUNT',
        items: [
          { label: 'Logout', href: '#logout', icon: LogOut, onClick: handleLogout },
        ],
      },
    ];

    return sections;
  };

  const navSections = getNavSections();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#8B1515] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1 border border-red-400/40 flex items-center justify-center shrink-0 shadow-sm">
            <img
              src="/cjc-logo.png"
              alt="Cor Jesu College Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="font-serif font-bold text-sm tracking-wide leading-tight">Cor Jesu College</div>
            <div className="text-[10px] uppercase tracking-wider text-rose-200 font-medium">Library Booking System</div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-red-900/60 text-white hover:bg-red-900"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Crimson Left Sidebar with zero overflow / no gray scrollbar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#8B1515] text-white flex flex-col justify-between z-40 shadow-xl transition-transform duration-300 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-5 px-4 space-y-6">
          {/* Brand Emblem */}
          <div className="flex items-center gap-3 px-2 pb-4 border-b border-red-700/60">
            <div className="w-11 h-11 rounded-xl bg-white p-1 border border-red-400/30 flex items-center justify-center shadow-md shrink-0">
              <img
                src="/cjc-logo.png"
                alt="Cor Jesu College Logo"
                width={44}
                height={44}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-serif font-bold text-sm leading-tight tracking-wide text-white">
                Cor Jesu College
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-rose-200/90 font-medium">
                {isRoomsPortal
                  ? 'Discussion Rooms Desk'
                  : isLaptopsPortal
                  ? 'Laptop Services Desk'
                  : isAdminPortal
                  ? 'Administration Console'
                  : 'Operations Command'}
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
                    const itemPath = item.href.split('?')[0];

                    let isCurrent = false;
                    if (item.href === '#logout') {
                      isCurrent = false;
                    } else if (item.href === '/dashboard') {
                      isCurrent = pathname === '/dashboard';
                    } else if (item.href === '/rooms') {
                      isCurrent = pathname.startsWith('/rooms');
                    } else if (item.href === '/laptops') {
                      isCurrent = pathname.startsWith('/laptops');
                    } else {
                      isCurrent = pathname === itemPath;
                    }

                    if (item.onClick) {
                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            item.onClick?.();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-rose-100/80 hover:bg-red-900/50 hover:text-white transition-colors group border-l-4 border-transparent text-left cursor-pointer"
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
                        prefetch={true}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors border-l-4 group ${
                          isCurrent
                            ? 'bg-red-950/70 text-white font-semibold shadow-xs border-rose-300'
                            : 'border-transparent text-rose-100/80 hover:bg-red-900/50 hover:text-white'
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
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-xs p-1 flex items-center justify-center shrink-0">
              <img
                src="/cjc-logo.png"
                alt="Cor Jesu College Logo"
                width={44}
                height={44}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-serif font-bold text-base text-[#8B1515] tracking-tight leading-tight flex items-center gap-2">
                COR JESU COLLEGE
                <span className="text-[10px] font-sans font-bold bg-red-100 text-[#8B1515] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {isRoomsPortal
                    ? 'Discussion Rooms Portal'
                    : isLaptopsPortal
                    ? 'Laptop Services Desk'
                    : isAdminPortal
                    ? 'Administration Console'
                    : 'Operations Command'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {isRoomsPortal
                  ? 'Discussion Space Management • Norbert Building 2nd Floor'
                  : isLaptopsPortal
                  ? 'Laptop Hardware Circulation & Lending Desk • Shelf A'
                  : isAdminPortal
                  ? 'Staff Management, Activity Audit Logs & System Policy Configuration'
                  : 'Library Booking System • Consolidated Administrative Dashboard'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {isStaff && user?.portal && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-[11px] font-bold text-[#8B1515]">
                Shift: {user.portal === 'rooms' ? 'Discussion Rooms' : 'Laptop Borrowing'}
              </span>
            )}

            <div className="text-right">
              <div className="text-xs font-bold text-slate-800">{user?.name || 'Library Staff'}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#8B1515]">
                {user?.role ? user.role.replace('_', ' ') : 'STAFF DESK'}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#8B1515] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user ? user.name.slice(0, 2).toUpperCase() : 'CJ'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isUnauthorizedStaffRoute ? (
            <div className="py-16 text-center text-xs text-slate-500">
              Redirecting to your assigned service desk...
            </div>
          ) : (
            children
          )}
        </main>

        <footer className="py-4 px-6 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Library Booking System • Discussion Rooms & Laptop Borrowing Services</span>
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
