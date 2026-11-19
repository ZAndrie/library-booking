'use client';

import React, { useState } from 'react';
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
  ArrowRight,
  LogIn,
  UserPlus,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
  CheckCircle,
  HardDrive,
  Info,
  Menu,
  X,
  Building,
} from 'lucide-react';

export default function LandingView() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'laptops'>('rooms');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roomsData = [
    {
      name: 'Conference Room',
      code: 'CR-101',
      capacity: '15 Persons',
      location: 'Third Floor — Large Hall',
      amenities: ['HD Projector', 'Large Whiteboard', 'Video Conference Audio', 'Air Conditioned'],
      badge: 'Conference Hall',
      accent: 'border-amber-200 bg-amber-50/40 text-amber-900',
    },
    {
      name: 'Discussion Room A',
      code: 'DR-A',
      capacity: '8 Persons',
      location: 'Ground Floor — Collaborative Area',
      amenities: ['Whiteboard', 'HD Projector', 'Ergonomic Seating'],
      badge: 'Group Collaboration',
      accent: 'border-blue-200 bg-blue-50/40 text-blue-900',
    },
    {
      name: 'Discussion Room B',
      code: 'DR-B',
      capacity: '6 Persons',
      location: 'Second Floor — Quiet Study Wing',
      amenities: ['4K Smart Display', 'Wireless Screen Casting', 'Whiteboard'],
      badge: 'Digital Presentation',
      accent: 'border-purple-200 bg-purple-50/40 text-purple-900',
    },
    {
      name: 'Discussion Room C',
      code: 'DR-C',
      capacity: '4 Persons',
      location: 'Second Floor — Corner Consultation',
      amenities: ['Whiteboard', 'Power Hub', 'High-Speed LAN'],
      badge: 'Focused Study',
      accent: 'border-emerald-200 bg-emerald-50/40 text-emerald-900',
    },
    {
      name: 'Discussion Room D',
      code: 'DR-D',
      capacity: '10 Persons',
      location: 'Third Floor — Multimedia Lab Wing',
      amenities: ['Smart Board', 'Conference Speakerphone', 'HDMI Hub'],
      badge: 'Multimedia Studio',
      accent: 'border-rose-200 bg-rose-50/40 text-rose-900',
    },
  ];

  const laptopsData = [
    {
      model: 'Lenovo ThinkPad T14 Gen 2',
      tag: 'LIB-LAP-002',
      specs: 'AMD Ryzen 5 PRO, 16GB RAM, 512GB SSD',
      condition: 'Excellent',
      accessories: '65W Slim Tip Charger, Padded Sleeve',
    },
    {
      model: 'Dell Latitude 5420',
      tag: 'LIB-LAP-001',
      specs: 'Intel Core i5-1145G7, 16GB RAM, 512GB NVMe',
      condition: 'Excellent',
      accessories: '65W Type-C Charger, Sleeve, Wireless Mouse',
    },
    {
      model: 'HP EliteBook 840 G8',
      tag: 'LIB-LAP-003',
      specs: 'Intel Core i7-1165G7, 16GB RAM, Sure View Privacy',
      condition: 'Excellent',
      accessories: '65W Fast Charger, Sleeve, Ethernet Adapter',
    },
    {
      model: 'Apple MacBook Air M1',
      tag: 'LIB-LAP-004',
      specs: 'Apple M1 Chip, 8-Core CPU, 8GB Unified, 256GB SSD',
      condition: 'Excellent',
      accessories: '30W USB-C Adapter, Cable, Hardshell Case',
    },
  ];

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
            <a href="#laptops" className="hover:text-[#8B1515] transition-colors">Laptop Fleet</a>
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
              href="/login"
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
              Laptop Fleet Desk
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
                href="/login"
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
        style={{
          backgroundColor: '#8B1515',
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(160, 25, 25, 0.95), rgba(75, 10, 10, 1)),
            radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 0)
          `,
          backgroundSize: '100% 100%, 24px 24px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/60 border border-red-400/30 text-rose-200 text-xs font-semibold mb-6 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Cor Jesu College • Learning Information & Resource Center (LIRC)
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Library Operations Hub: Rooms & Hardware Fleet
            </h1>

            {/* Description */}
            <p className="mt-5 text-sm sm:text-base lg:text-lg text-rose-100/90 leading-relaxed font-normal max-w-2xl mx-auto">
              A unified administrative counter desk uniting <strong>Discussion Room Reservations</strong> and <strong>Laptop Borrowing Fleet Management</strong> in one seamless, conflict-free platform.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#8B1515] font-bold text-sm rounded-xl shadow-xl hover:bg-rose-50 transition-all transform hover:-translate-y-0.5"
              >
                <LogIn className="w-4 h-4 text-[#8B1515]" />
                Enter Staff Portal
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-900/70 hover:bg-red-900 border border-red-400/40 text-white font-bold text-sm rounded-xl transition-all"
              >
                <UserPlus className="w-4 h-4 text-rose-200" />
                Register Staff Account
              </Link>
            </div>
          </div>

          {/* 4 Pillars Highlight Row */}
          <div className="mt-14 sm:mt-18 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-red-950/40 border border-red-500/20 rounded-2xl p-4 sm:p-5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-red-800/80 text-rose-200 flex items-center justify-center mb-3">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-serif">5 Rooms</div>
              <p className="text-xs text-rose-200/80 mt-1">Conference hall & study rooms with HD displays & smartboards.</p>
            </div>

            <div className="bg-red-950/40 border border-red-500/20 rounded-2xl p-4 sm:p-5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-red-800/80 text-rose-200 flex items-center justify-center mb-3">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-serif">5 Laptops</div>
              <p className="text-xs text-rose-200/80 mt-1">Ready-to-lend Dell, Lenovo, HP & Apple fleet with chargers.</p>
            </div>

            <div className="bg-red-950/40 border border-red-500/20 rounded-2xl p-4 sm:p-5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-red-800/80 text-rose-200 flex items-center justify-center mb-3">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-serif">Collision-Free</div>
              <p className="text-xs text-rose-200/80 mt-1">Automatic double-booking detection and time slot validation.</p>
            </div>

            <div className="bg-red-950/40 border border-red-500/20 rounded-2xl p-4 sm:p-5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-red-800/80 text-rose-200 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-serif">Condition Graded</div>
              <p className="text-xs text-rose-200/80 mt-1">Counter inspection logs return hardware health status on return.</p>
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
                System 1: Rooms
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
                System 2: Laptops
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
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roomsData.map((room) => (
                <div
                  key={room.code}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${room.accent}`}>
                        {room.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {room.code}
                      </span>
                    </div>

                    <h4 className="font-serif text-xl font-bold text-slate-900">{room.name}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">{room.location}</p>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                        <Users className="w-3.5 h-3.5 text-[#8B1515]" />
                        Capacity: {room.capacity}
                      </div>

                      <div className="space-y-1.5 mt-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amenities:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {room.amenities.map((a) => (
                            <span
                              key={a}
                              className="text-[11px] bg-slate-50 text-slate-600 border border-slate-200/80 px-2 py-0.5 rounded-md"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Available for Booking
                    </span>
                    <Link
                      href="/login"
                      className="font-bold text-[#8B1515] hover:underline inline-flex items-center gap-1"
                    >
                      Book at Desk <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}

              {/* Summary Card */}
              <div className="bg-gradient-to-br from-[#8B1515] to-[#5A0B0B] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-4">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <h4 className="font-serif text-2xl font-bold">Room Desk Actions</h4>
                  <p className="text-xs text-rose-100/90 mt-2 leading-relaxed">
                    Staff officers can extend active bookings by +30m or +60m, execute early returns, or mark rooms for maintenance with a single click.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/15">
                  <Link
                    href="/login"
                    className="w-full py-2.5 bg-white text-[#8B1515] rounded-xl text-xs font-bold text-center block hover:bg-rose-50 transition-colors shadow-sm"
                  >
                    Open Rooms Desk
                  </Link>
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
                HARDWARE INVENTORY & COUNTER CHECKOUT
              </span>
              <h3 className="font-serif text-3xl font-bold text-slate-900 mt-3">
                Laptop Fleet Lending Desk
              </h3>
              <p className="text-slate-600 text-sm mt-2">
                Rapid counter checkout to patrons, real-time overdue countdown tracking, and multi-tier return condition inspection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {laptopsData.map((lap) => (
                <div
                  key={lap.tag}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {lap.tag}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {lap.condition}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 mb-3">
                      <Laptop className="w-5 h-5 text-[#8B1515]" />
                    </div>

                    <h4 className="font-serif text-base font-bold text-slate-900 leading-snug">{lap.model}</h4>
                    <p className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">{lap.specs}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                      <span className="font-bold text-slate-700">Accessories:</span> {lap.accessories}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Available
                    </span>
                    <Link
                      href="/login"
                      className="font-bold text-[#8B1515] hover:underline"
                    >
                      Checkout →
                    </Link>
                  </div>
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
              <h4 className="font-serif text-lg font-bold text-slate-900">Collision Prevention</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Discussion room booking overlaps are automatically rejected by the scheduler engine, guaranteeing that confirmed sessions never collide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-[#8B1515] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="w-14 h-14 mx-auto mb-4 bg-white/10 rounded-2xl p-2 border border-white/20 flex items-center justify-center">
            <img
              src="/cjc-logo.png"
              alt="Cor Jesu College Seal"
              width={56}
              height={56}
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to Begin Desk Operations?
          </h2>
          <p className="mt-3 text-rose-100/90 text-sm max-w-xl mx-auto">
            Sign in with your verified Cor Jesu College staff credentials to manage discussion room reservations and laptop loans today.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#8B1515] font-bold text-sm rounded-xl shadow-lg hover:bg-rose-50 transition-all"
            >
              <LogIn className="w-4 h-4 text-[#8B1515]" />
              Sign In to LIRC Portal
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-900/60 hover:bg-red-900 border border-red-400/40 text-white font-bold text-sm rounded-xl transition-all"
            >
              Register Officer Account
            </Link>
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
              <a href="#laptops" className="hover:text-white transition-colors">Laptop Fleet</a>
              <a href="#guidelines" className="hover:text-white transition-colors">Guidelines</a>
              <Link href="/login" className="text-rose-400 hover:text-rose-300 font-bold transition-colors">Staff Login</Link>
              <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div>
              © 1959–2026 Cor Jesu College, Inc. • Learning Information and Resource Center (LIRC). All rights reserved.
            </div>
            <div>
              Unified Library Booking & Hardware Lending Platform • Node.js + MongoDB Atlas + Next.js
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
