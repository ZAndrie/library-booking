'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DoorOpen,
  Laptop,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Users,
  Monitor,
  CalendarDays,
  LogIn,
  Sparkles,
  Shield,
  Layers,
  CheckCircle,
  HardDrive,
  Info,
  Menu,
  X,
  Building,
} from 'lucide-react';

interface AvailabilityRoom {
  _id: string;
  name: string;
  roomNumber: string;
  capacity: number;
  minCapacity?: number;
  maxCapacity?: number;
  capacityText?: string;
  facilities: string[];
  location: string;
  notes?: string;
  status: string;
  isAvailable: boolean;
  availabilityState: 'available' | 'occupied' | 'maintenance' | 'closed';
  statusLabel: string;
}

interface AvailabilityLaptop {
  _id: string;
  assetTag: string;
  brand: string;
  model: string;
  specs: string;
  condition: string;
  status: string;
  isAvailable: boolean;
  statusLabel: string;
  location?: string;
  accessoriesIncluded: string[];
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

const initialRooms: AvailabilityRoom[] = [
  {
    _id: 'room_1',
    name: 'Discussion Room A',
    roomNumber: 'DR-A',
    capacity: 15,
    minCapacity: 3,
    maxCapacity: 15,
    capacityText: 'Min. 3 to Max. 15 Students',
    facilities: ['Table and Chairs'],
    location: '2nd Floor Left Wing, Norbert Building (Inside Library)',
    notes: 'Discussion room equipped with tables and chairs. Capacity: 3 to 15 students.',
    status: 'available',
    isAvailable: true,
    availabilityState: 'available',
    statusLabel: 'Available for Booking',
  },
  {
    _id: 'room_2',
    name: 'Discussion Room B',
    roomNumber: 'DR-B',
    capacity: 15,
    minCapacity: 3,
    maxCapacity: 15,
    capacityText: 'Min. 3 to Max. 15 Students',
    facilities: ['Table and Chairs'],
    location: '2nd Floor Left Wing, Norbert Building (Inside Library)',
    notes: 'Discussion room equipped with tables and chairs. Capacity: 3 to 15 students.',
    status: 'available',
    isAvailable: true,
    availabilityState: 'available',
    statusLabel: 'Available for Booking',
  },
  {
    _id: 'room_3',
    name: 'Discussion Room C',
    roomNumber: 'DR-C',
    capacity: 15,
    minCapacity: 3,
    maxCapacity: 15,
    capacityText: 'Min. 3 to Max. 15 Students',
    facilities: ['Table and Chairs'],
    location: '2nd Floor Left Wing, Norbert Building (Inside Library)',
    notes: 'Discussion room equipped with tables and chairs. Capacity: 3 to 15 students.',
    status: 'available',
    isAvailable: true,
    availabilityState: 'available',
    statusLabel: 'Available for Booking',
  },
  {
    _id: 'room_4',
    name: 'Discussion Room D',
    roomNumber: 'DR-D',
    capacity: 15,
    minCapacity: 3,
    maxCapacity: 15,
    capacityText: 'Min. 3 to Max. 15 Students',
    facilities: ['Table and Chairs'],
    location: '2nd Floor Left Wing, Norbert Building (Inside Library)',
    notes: 'Discussion room equipped with tables and chairs. Capacity: 3 to 15 students.',
    status: 'available',
    isAvailable: true,
    availabilityState: 'available',
    statusLabel: 'Available for Booking',
  },
  {
    _id: 'room_5',
    name: 'Discussion Room E',
    roomNumber: 'DR-E',
    capacity: 15,
    minCapacity: 3,
    maxCapacity: 15,
    capacityText: 'Min. 3 to Max. 15 Students',
    facilities: ['Table and Chairs'],
    location: '2nd Floor Left Wing, Norbert Building (Inside Library)',
    notes: 'Discussion room equipped with tables and chairs. Capacity: 3 to 15 students.',
    status: 'available',
    isAvailable: true,
    availabilityState: 'available',
    statusLabel: 'Available for Booking',
  },
];

const initialLaptops: AvailabilityLaptop[] = [
  {
    _id: 'lap_1',
    assetTag: 'LIB-LAP-001',
    brand: 'Dell',
    model: 'Latitude 5420',
    specs: 'Intel Core i5-1145G7, 16GB RAM, 512GB NVMe',
    condition: 'excellent',
    status: 'available',
    isAvailable: true,
    statusLabel: 'Available on Shelf',
    accessoriesIncluded: ['65W Type-C Charger', 'Sleeve', 'Wireless Mouse'],
  },
  {
    _id: 'lap_2',
    assetTag: 'LIB-LAP-002',
    brand: 'Lenovo',
    model: 'ThinkPad T14 Gen 2',
    specs: 'AMD Ryzen 5 PRO, 16GB RAM, 512GB SSD',
    condition: 'excellent',
    status: 'available',
    isAvailable: true,
    statusLabel: 'Available on Shelf',
    accessoriesIncluded: ['65W Slim Tip Charger', 'Padded Sleeve'],
  },
  {
    _id: 'lap_3',
    assetTag: 'LIB-LAP-003',
    brand: 'HP',
    model: 'EliteBook 840 G8',
    specs: 'Intel Core i7-1165G7, 16GB RAM, Sure View Privacy',
    condition: 'excellent',
    status: 'available',
    isAvailable: true,
    statusLabel: 'Available on Shelf',
    accessoriesIncluded: ['65W Fast Charger', 'Sleeve', 'Ethernet Adapter'],
  },
  {
    _id: 'lap_4',
    assetTag: 'LIB-LAP-004',
    brand: 'Apple',
    model: 'MacBook Air M1',
    specs: 'Apple M1 Chip, 8-Core CPU, 8GB Unified, 256GB SSD',
    condition: 'excellent',
    status: 'available',
    isAvailable: true,
    statusLabel: 'Available on Shelf',
    accessoriesIncluded: ['30W USB-C Adapter', 'Cable', 'Hardshell Case'],
  },
];

function getRoomBadge() {
  return {
    badge: 'Discussion Space',
    accent: 'border-red-200 bg-red-50 text-[#8B1515]',
  };
}

function getConditionBadge(condition: string) {
  const cond = condition ? condition.toLowerCase() : 'excellent';
  if (cond === 'excellent') {
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (cond === 'good') {
    return 'text-blue-700 bg-blue-50 border-blue-200';
  } else if (cond === 'fair') {
    return 'text-amber-700 bg-amber-50 border-amber-200';
  } else {
    return 'text-rose-700 bg-rose-50 border-rose-200';
  }
}

export default function LandingView() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'laptops'>('rooms');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rooms, setRooms] = useState<AvailabilityRoom[]>(initialRooms);
  const [laptops, setLaptops] = useState<AvailabilityLaptop[]>(initialLaptops);
  const [counts, setCounts] = useState<AvailabilityCounts | null>({
    totalRooms: 5,
    availableRooms: 5,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    totalLaptops: 4,
    availableLaptops: 4,
    borrowedLaptops: 0,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadAvailability() {
      try {
        const res = await fetch('/api/availability', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          if (Array.isArray(json.data.rooms) && json.data.rooms.length > 0) {
            setRooms(json.data.rooms);
          }
          if (Array.isArray(json.data.laptops) && json.data.laptops.length > 0) {
            setLaptops(json.data.laptops);
          }
          if (json.data.counts) {
            setCounts(json.data.counts);
          }
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
      }
    }

    loadAvailability();
    const interval = setInterval(loadAvailability, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#8B1515] selection:text-white">
      {/* Sticky Institutional Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/cjc-logo.png"
                alt="Cor Jesu College Official Seal"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-serif font-bold text-lg text-[#8B1515] tracking-tight leading-tight flex items-center gap-2">
                COR JESU COLLEGE
                <span className="hidden sm:inline-block text-[10px] font-sans font-bold bg-red-100 text-[#8B1515] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  LIRC Desk
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium hidden sm:block">
                Learning Information and Resource Center • Library Booking System
              </div>
              <div className="text-[11px] text-slate-500 font-medium sm:hidden">
                Library Booking System
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#overview" className="hover:text-[#8B1515] transition-colors">Overview</a>
            <a href="#rooms" className="hover:text-[#8B1515] transition-colors">Discussion Rooms</a>
            <a href="#laptops" className="hover:text-[#8B1515] transition-colors">Laptop Borrowing</a>
            <a href="#guidelines" className="hover:text-[#8B1515] transition-colors">Operating Guidelines</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/register"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-[#8B1515] hover:bg-slate-100 rounded-lg transition-all"
            >
              Register
            </Link>
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1515] hover:bg-[#721111] text-white rounded-lg text-xs font-bold shadow-md shadow-red-950/20 transition-all transform hover:-translate-y-0.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Staff Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 py-1.5"
            >
              Overview
            </a>
            <a
              href="#rooms"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 py-1.5"
            >
              Discussion Rooms
            </a>
            <a
              href="#laptops"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 py-1.5"
            >
              Laptop Borrowing Services
            </a>
            <a
              href="#guidelines"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 py-1.5"
            >
              Operating Guidelines
            </a>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/portal"
                className="w-full text-center py-2.5 bg-[#8B1515] text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Staff Sign In
              </Link>
              <Link
                href="/register"
                className="w-full text-center py-2.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg"
              >
                Register Officer Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="overview"
        className="relative text-white overflow-hidden py-16 sm:py-24"
      >
        {/* Campus Background Image with Crimson Tint Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/cjc-campus.jpg"
            alt="Cor Jesu College Campus"
            className="w-full h-full object-cover object-[center_35%] filter brightness-95 contrast-105"
          />
          {/* Lighter, translucent Crimson Overlay so the campus architecture & details remain distinctly visible */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(
                  180deg,
                  rgba(139, 21, 21, 0.52) 0%,
                  rgba(125, 18, 18, 0.58) 45%,
                  rgba(80, 10, 10, 0.72) 100%
                )
              `,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-300/40 text-rose-100 text-xs font-semibold mb-6 shadow-md backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Cor Jesu College • Learning Information & Resource Center (LIRC)
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
              Discussion Room Bookings & Laptop Borrowing Services
            </h1>

            {/* Description */}
            <p className="mt-5 text-sm sm:text-base lg:text-lg text-rose-50 leading-relaxed font-medium max-w-2xl mx-auto drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
              A unified administrative counter desk uniting <strong>Discussion Room Bookings</strong> and <strong>Laptop Borrowing Services</strong> in one seamless, conflict-free platform.
            </p>
          </div>

          {/* 4 Pillars Highlight Row */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-red-950/75 border border-white/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl transition-transform hover:-translate-y-0.5">
              <div className="w-9 h-9 rounded-xl bg-red-800 text-rose-100 flex items-center justify-center mb-3 shadow-inner">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-serif">Discussion Rooms</div>
              <p className="text-xs text-rose-100/90 mt-1">Discussion & study rooms equipped with tables and chairs.</p>
            </div>

            <div className="bg-red-950/75 border border-white/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl transition-transform hover:-translate-y-0.5">
              <div className="w-9 h-9 rounded-xl bg-red-800 text-rose-100 flex items-center justify-center mb-3 shadow-inner">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-serif">Laptop Borrowing</div>
              <p className="text-xs text-rose-100/90 mt-1">Ready-to-borrow Dell, Lenovo, HP & Apple laptops with chargers.</p>
            </div>

            <div className="bg-red-950/75 border border-white/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl transition-transform hover:-translate-y-0.5">
              <div className="w-9 h-9 rounded-xl bg-red-800 text-rose-100 flex items-center justify-center mb-3 shadow-inner">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-serif">Collision-Free</div>
              <p className="text-xs text-rose-100/90 mt-1">Automatic double-booking detection and time slot validation.</p>
            </div>

            <div className="bg-red-950/75 border border-white/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl transition-transform hover:-translate-y-0.5">
              <div className="w-9 h-9 rounded-xl bg-red-800 text-rose-100 flex items-center justify-center mb-3 shadow-inner">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-serif">Condition Graded</div>
              <p className="text-xs text-rose-100/90 mt-1">Counter inspection logs return hardware health status on return.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Systems Selector */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#8B1515] mb-1">
                LIRC CORE MODULES
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Explore The Two Integrated Subsystems
              </h2>
            </div>

            {/* Toggle Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'rooms'
                    ? 'bg-[#8B1515] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DoorOpen className="w-4 h-4" />
                <span>Discussion Rooms</span>
                {counts && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'rooms'
                        ? 'bg-white/20 text-white'
                        : counts.availableRooms > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {counts.availableRooms > 0 ? `${counts.availableRooms} Available` : 'All In Session'}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('laptops')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'laptops'
                    ? 'bg-[#8B1515] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Laptop Borrowing</span>
                {counts && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'laptops'
                        ? 'bg-white/20 text-white'
                        : counts.availableLaptops > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {counts.availableLaptops > 0 ? `${counts.availableLaptops} Available` : 'All Borrowed'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Breakdown: System 1 or System 2 */}
      {activeTab === 'rooms' ? (
        <section id="rooms" className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B1515] bg-red-100/70 px-3 py-1 rounded-full">
                FACILITIES & RESERVATION DESK
              </span>
              <h3 className="font-serif text-3xl font-bold text-slate-900 mt-3">
                Discussion Rooms & Collaborative Spaces
              </h3>
              <p className="text-slate-600 text-sm mt-2">
                Real-time availability monitoring, collision prevention, and walk-in reservation desk managed by library staff.
                All discussion rooms are located inside the <strong>2nd Floor Left Wing of Norbert Building</strong> (Capacity: <strong>Min. 3 to Max. 15 students</strong>).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => {
                const roomBadge = getRoomBadge();
                return (
                  <div
                    key={room._id || room.roomNumber}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${roomBadge.accent}`}>
                          {roomBadge.badge}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {room.roomNumber}
                        </span>
                      </div>

                      <h4 className="font-serif text-xl font-bold text-slate-900">{room.name}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {room.location || '2nd Floor Left Wing, Norbert Building (Inside Library)'}
                      </p>

                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#8B1515]" />
                            <span>Capacity: <strong className="text-slate-900 font-bold">Min. 3 to Max. 15 Students</strong></span>
                          </div>
                        </div>

                        <div className="space-y-1.5 mt-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amenities:</div>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[11px] bg-slate-50 text-slate-700 border border-slate-200/80 px-2.5 py-1 rounded-md font-medium">
                              Table and Chairs
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Dynamic Availability Status Indicator */}
                    {room.isAvailable ? (
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          Available for Booking
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Inquire at LIRC Desk
                        </span>
                      </div>
                    ) : room.availabilityState === 'occupied' ? (
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-amber-700 font-bold flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          Occupied / In Session
                        </span>
                        <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Active Booking
                        </span>
                      </div>
                    ) : room.availabilityState === 'maintenance' ? (
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-rose-700 font-bold flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          Under Maintenance
                        </span>
                        <span className="text-[11px] text-rose-600 font-medium">
                          Temporarily Unavailable
                        </span>
                      </div>
                    ) : (
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-bold flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                          {room.statusLabel || 'Not Available'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Closed
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Summary Card */}
              <div className="bg-gradient-to-br from-[#8B1515] to-[#5A0B0B] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-4">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <h4 className="font-serif text-2xl font-bold">Room Desk Operations</h4>
                  <p className="text-xs text-rose-100/90 mt-2 leading-relaxed">
                    Staff officers extend active sessions, manage schedule conflicts, inspect room condition, and coordinate walk-in reservations.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/15 text-xs text-rose-200 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-300" />
                  Managed by LIRC Staff Officers
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section id="laptops" className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B1515] bg-red-100/70 px-3 py-1 rounded-full">
                LAPTOP INVENTORY & BORROWING SERVICES
              </span>
              <h3 className="font-serif text-3xl font-bold text-slate-900 mt-3">
                Laptop Borrowing Services Desk
              </h3>
              <p className="text-slate-600 text-sm mt-2">
                Rapid counter checkout to patrons, real-time overdue countdown tracking, and multi-tier return condition inspection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {laptops.map((lap) => (
                <div
                  key={lap._id || lap.assetTag}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {lap.assetTag}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getConditionBadge(lap.condition)}`}>
                        {lap.condition}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 mb-3">
                      <Laptop className="w-5 h-5 text-[#8B1515]" />
                    </div>

                    <h4 className="font-serif text-base font-bold text-slate-900 leading-snug">
                      {lap.brand ? `${lap.brand} ` : ''}{lap.model}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">{lap.specs}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                      <span className="font-bold text-slate-700">Accessories:</span>{' '}
                      {Array.isArray(lap.accessoriesIncluded) && lap.accessoriesIncluded.length > 0
                        ? lap.accessoriesIncluded.join(', ')
                        : 'Fast Charger, Protective Sleeve'}
                    </div>
                  </div>

                  {/* Live Dynamic Availability Status Indicator */}
                  {lap.isAvailable ? (
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Available on Shelf
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Ready to Borrow
                      </span>
                    </div>
                  ) : lap.status === 'borrowed' ? (
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-amber-700 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Currently Borrowed
                      </span>
                      <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Active Loan
                      </span>
                    </div>
                  ) : lap.status === 'under_maintenance' ? (
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-rose-700 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Under Maintenance
                      </span>
                      <span className="text-[11px] text-rose-600 font-medium">
                        Service Desk
                      </span>
                    </div>
                  ) : (
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        {lap.statusLabel || 'Not Available'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Unavailable
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Operating Guidelines Section */}
      <section id="guidelines" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B1515] bg-red-100/70 px-3 py-1 rounded-full">
              ADMINISTRATIVE POLICY
            </span>
            <h3 className="font-serif text-3xl font-bold text-slate-900 mt-3">
              Desk Operating Guidelines & Security Protocols
            </h3>
            <p className="text-slate-600 text-sm mt-2">
              All transactions are strictly handled over-the-counter by authenticated Library Staff and Administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#8B1515] flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h4 className="font-serif text-lg font-bold text-slate-900">Staff Counter Custody</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                No open student portal. Staff enter walk-in patron details (Student ID, Name, Department) over the counter ensuring verified identity and accountability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#8B1515] flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h4 className="font-serif text-lg font-bold text-slate-900">Return Condition Auditing</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                When laptops are returned, officers assess hardware condition (Excellent, Good, Fair, Damaged) and document any physical defects before clearing loans.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#8B1515] flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h4 className="font-serif text-lg font-bold text-slate-900">Group Capacity & Collision Prevention</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Discussion room reservations strictly require a minimum of 3 students and accommodate a maximum of 15 students. Schedule overlaps are automatically prevented.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
                <img
                  src="/cjc-logo.png"
                  alt="Cor Jesu College Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="font-serif font-bold text-white text-sm">COR JESU COLLEGE, INC.</div>
                <div className="text-[11px] text-slate-400">Digos City, Davao del Sur • Founded 1959</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-medium">
              <a href="#overview" className="hover:text-white transition-colors">Overview</a>
              <a href="#rooms" className="hover:text-white transition-colors">Discussion Rooms</a>
              <a href="#laptops" className="hover:text-white transition-colors">Laptop Borrowing</a>
              <a href="#guidelines" className="hover:text-white transition-colors">Guidelines</a>
              <Link href="/portal" className="text-rose-400 hover:text-rose-300 font-bold transition-colors">Staff Login</Link>
              <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div>
              © 1959–2026 Cor Jesu College, Inc. • Learning Information and Resource Center (LIRC). All rights reserved.
            </div>
            <div>
              Unified Discussion Room Booking & Laptop Borrowing Platform • Node.js + MongoDB Atlas + Next.js
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
