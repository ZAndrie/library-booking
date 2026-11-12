'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/frontend/components/AppShell';
import {
  LayoutDashboard,
  DoorOpen,
  Laptop,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  ShieldCheck,
  BookmarkCheck,
  ArrowRight,
  Plus,
  X,
  Building,
  MonitorCheck,
  AlertTriangle,
  HardDrive,
  Edit2,
  CalendarPlus,
  Send,
} from 'lucide-react';

interface Room {
  _id: string;
  name: string;
  roomNumber: string;
  capacity: number;
  facilities: string[];
  status: 'available' | 'maintenance' | 'closed';
  location: string;
  notes?: string;
  todayBookingsCount?: number;
}

interface LaptopItem {
  _id: string;
  assetTag: string;
  brand: string;
  model: string;
  specs: string;
  status: 'available' | 'borrowed' | 'under_maintenance' | 'decommissioned';
  condition: 'excellent' | 'good' | 'fair' | 'damaged';
  location: string;
  accessoriesIncluded: string[];
}

interface StatsData {
  rooms: {
    total: number;
    available: number;
    maintenance: number;
    currentlyOccupied: number;
    todayTotal: number;
    pending?: number;
    approved?: number;
  };
  laptops: {
    total: number;
    available: number;
    borrowed: number;
    maintenance: number;
    overdue: number;
  };
}

export default function DashboardView() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [laptops, setLaptops] = useState<LaptopItem[]>([]);
  const [recentRooms, setRecentRooms] = useState<any[]>([]);
  const [recentLaptops, setRecentLaptops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(true);

  // Quick Action Modals
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [bookingFormData, setBookingFormData] = useState({
    borrowerName: '',
    borrowerId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    purpose: 'Group Study & Research',
    attendeesCount: 2,
    notes: '',
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Quick Laptop Checkout Modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedLaptopForCheckout, setSelectedLaptopForCheckout] = useState<LaptopItem | null>(null);
  const [checkoutFormData, setCheckoutFormData] = useState({
    borrowerName: '',
    borrowerId: '',
    borrowerEmail: '',
    dueTime: '17:00',
    notes: '',
  });
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  // Dynamic Date string
  const [currentDateFormatted, setCurrentDateFormatted] = useState('');

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setCurrentDateFormatted(formatted);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, roomsRes, laptopsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/rooms'),
        fetch('/api/laptops'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setRecentRooms(statsData.recentRoomBookings || []);
        setRecentLaptops(statsData.recentLaptopLoans || []);
      }

      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData.rooms || []);
      }

      if (laptopsRes.ok) {
        const laptopsData = await laptopsRes.json();
        setLaptops(laptopsData.laptops || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenBookModal = (room: Room) => {
    setSelectedRoomForBooking(room);
    setBookingFormData((prev) => ({
      ...prev,
      attendeesCount: Math.min(2, room.capacity),
    }));
    setShowBookModal(true);
  };

  const handleQuickBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForBooking) return;
    setBookingSubmitting(true);
    try {
      const startDateTime = new Date(`${bookingFormData.date}T${bookingFormData.startTime}:00`);
      const endDateTime = new Date(`${bookingFormData.date}T${bookingFormData.endTime}:00`);

      const res = await fetch('/api/room-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoomForBooking._id,
          borrowerName: bookingFormData.borrowerName,
          borrowerId: bookingFormData.borrowerId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          purpose: bookingFormData.purpose,
          attendeesCount: bookingFormData.attendeesCount,
          notes: bookingFormData.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create reservation');
      } else {
        setShowBookModal(false);
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleOpenCheckoutModal = (laptop: LaptopItem) => {
    setSelectedLaptopForCheckout(laptop);
    setShowCheckoutModal(true);
  };

  const handleQuickCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLaptopForCheckout) return;
    setCheckoutSubmitting(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const dueDateTime = new Date(`${todayStr}T${checkoutFormData.dueTime}:00`);

      const res = await fetch('/api/laptop-loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          laptopId: selectedLaptopForCheckout._id,
          borrowerName: checkoutFormData.borrowerName,
          borrowerId: checkoutFormData.borrowerId,
          borrowerEmail: checkoutFormData.borrowerEmail,
          dueAt: dueDateTime.toISOString(),
          checkoutNotes: checkoutFormData.notes,
          checkoutAccessories: selectedLaptopForCheckout.accessoriesIncluded || ['Charger'],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to checkout laptop');
      } else {
        setShowCheckoutModal(false);
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Dismissible Welcome Banner */}
        {showWelcomeAlert && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 px-4 flex items-center justify-between shadow-sm transition-all animate-fadeIn">
            <div className="flex items-center gap-2.5 text-sm font-medium">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Welcome back, Library Admin!</strong> System is synchronized and operating in staff desk mode.
              </span>
            </div>
            <button
              onClick={() => setShowWelcomeAlert(false)}
              className="text-emerald-600 hover:text-emerald-800 p-1 rounded-md transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-[#8B1515]">
              <LayoutDashboard className="w-6 h-6 text-[#8B1515]" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#8B1515] tracking-tight leading-none">
                Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {currentDateFormatted || 'Library Administration Terminal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/rooms?action=new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1515] hover:bg-[#721111] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              + New Booking
            </Link>
            <Link
              href="/laptops?action=checkout"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Laptop className="w-4 h-4 text-emerald-400" />
              + Checkout Laptop
            </Link>
          </div>
        </div>

        {/* 6 Stat Cards Row (Exact Match to Reference Design) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Total Rooms */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3 hover:border-slate-300 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 font-serif leading-none">
                {loading ? '...' : stats?.rooms.total ?? rooms.length}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Total Rooms</div>
            </div>
          </div>

          {/* Card 2: Available */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3 hover:border-slate-300 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 font-serif leading-none">
                {loading ? '...' : stats?.rooms.available ?? rooms.filter((r) => r.status === 'available').length}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Available</div>
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3 hover:border-slate-300 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 font-serif leading-none">
                {loading ? '...' : stats?.rooms.pending ?? 0}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Pending</div>
            </div>
          </div>

          {/* Card 4: Today's Bookings */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3 hover:border-slate-300 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 font-serif leading-none">
                {loading ? '...' : stats?.rooms.todayTotal ?? 0}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Today&apos;s Bookings</div>
            </div>
          </div>

          {/* Card 5: Approved */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3 hover:border-slate-300 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 font-serif leading-none">
                {loading ? '...' : stats?.rooms.approved ?? stats?.rooms.todayTotal ?? 0}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Approved</div>
            </div>
          </div>

          {/* Card 6: All Bookings */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3 hover:border-slate-300 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-[#8B1515] flex-shrink-0">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 font-serif leading-none">
                {loading ? '...' : recentRooms.length}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">All Bookings</div>
            </div>
          </div>
        </div>

        {/* Laptop Borrowing Fleet Quick Status Strip (System 2 Integration) */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Laptop className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800">System 2 Fleet: Laptop Borrowing Desk</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-slate-600">
              Total Fleet: <strong className="text-slate-900">{stats?.laptops.total ?? laptops.length}</strong>
            </span>
            <span className="text-slate-600">
              Available on Shelf:{' '}
              <strong className="text-emerald-700">
                {stats?.laptops.available ?? laptops.filter((l) => l.status === 'available').length}
              </strong>
            </span>
            <span className="text-slate-600">
              Active Loans:{' '}
              <strong className="text-blue-700">{stats?.laptops.borrowed ?? 0}</strong>
            </span>
            <span className="text-slate-600">
              Overdue:{' '}
              <strong className={(stats?.laptops.overdue ?? 0) > 0 ? 'text-red-600 font-bold' : 'text-slate-500'}>
                {stats?.laptops.overdue ?? 0}
              </strong>
            </span>
            <Link
              href="/laptops"
              className="text-[#8B1515] hover:underline font-semibold flex items-center gap-1"
            >
              Open Desk <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* SECTION 1: Discussion Rooms Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-[#8B1515]" />
              <h2 className="font-serif font-bold text-xl text-[#8B1515]">Discussion Rooms</h2>
            </div>
            <Link
              href="/rooms"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#8B1515] text-[#8B1515] hover:bg-[#8B1515] hover:text-white transition-colors"
            >
              Manage Rooms
            </Link>
          </div>

          {/* Room Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((room) => {
              const isAvailable = room.status === 'available';
              return (
                <div
                  key={room._id}
                  className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200 flex flex-col bg-white"
                >
                  {/* Top Crimson Header */}
                  <div className="bg-[#8B1515] text-white p-4 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-rose-200" />
                        <h3 className="font-serif font-bold text-base tracking-wide text-white">
                          {room.name}
                        </h3>
                      </div>
                      <p className="text-xs text-rose-200/90 font-medium">
                        Up to {room.capacity} persons • Room {room.roomNumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-red-950/60 border border-red-500/40 px-2 py-1 rounded-full text-[10px] font-bold text-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{isAvailable ? 'Available' : room.status}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {room.location}
                        {room.notes ? ` — ${room.notes}` : ''}
                      </p>

                      {/* Status Badges Row */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-red-300 bg-red-50 text-[#8B1515]">
                          {room.todayBookingsCount || 0} today
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Available
                        </span>
                      </div>

                      {/* Facilities Badges */}
                      {room.facilities && room.facilities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {room.facilities.map((fac, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                            >
                              {fac}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenBookModal(room)}
                        className="flex-1 bg-[#8B1515] hover:bg-[#721111] text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        + Book
                      </button>

                      <Link
                        href={`/rooms?roomId=${room._id}&tab=schedule`}
                        className="flex-1 border border-[#8B1515] text-[#8B1515] hover:bg-red-50 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors text-center"
                      >
                        Slots
                      </Link>

                      <Link
                        href={`/rooms?editRoomId=${room._id}`}
                        title="Edit Room Details"
                        className="p-2 border border-slate-200 text-slate-500 hover:text-[#8B1515] hover:border-[#8B1515] rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Laptop Borrowing Desk Cards (System 2) */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-slate-800" />
              <h2 className="font-serif font-bold text-xl text-slate-800">
                Laptop Borrowing Fleet
              </h2>
            </div>
            <Link
              href="/laptops"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Manage Fleet
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {laptops.slice(0, 3).map((lap) => {
              const isAvailable = lap.status === 'available';
              return (
                <div
                  key={lap._id}
                  className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200 flex flex-col bg-white"
                >
                  <div className="bg-slate-800 text-white p-3.5 flex items-start justify-between">
                    <div>
                      <div className="font-mono font-bold text-sm tracking-wide text-white">
                        {lap.assetTag}
                      </div>
                      <div className="text-xs text-slate-300">
                        {lap.brand} {lap.model}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-900/80 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {lap.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div>
                        <strong>Specs:</strong> {lap.specs}
                      </div>
                      <div>
                        <strong>Condition:</strong>{' '}
                        <span className="capitalize text-emerald-700 font-semibold">{lap.condition}</span>
                      </div>
                      <div>
                        <strong>Storage:</strong> {lap.location}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      {isAvailable ? (
                        <button
                          onClick={() => handleOpenCheckoutModal(lap)}
                          className="flex-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-400" />
                          Checkout to Patron
                        </button>
                      ) : (
                        <Link
                          href="/laptops"
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg text-center transition-colors"
                        >
                          View Loan Record
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Recent Activity Ledger & Active Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          {/* Recent Room Reservations */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-serif font-bold text-sm text-[#8B1515] flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-[#8B1515]" />
                Recent Discussion Room Bookings
              </h3>
              <Link href="/rooms" className="text-xs text-[#8B1515] font-semibold hover:underline">
                View Ledger
              </Link>
            </div>

            {recentRooms.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No room reservations recorded today.
              </div>
            ) : (
              <div className="space-y-2">
                {recentRooms.map((rb) => (
                  <div
                    key={rb._id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        {rb.roomId?.name || 'Room'} • {rb.borrowerName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        ID: {rb.borrowerId} • Purpose: {rb.purpose}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {rb.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Laptop Loans */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-serif font-bold text-sm text-slate-800 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-slate-700" />
                Active Laptop Borrowing Loans
              </h3>
              <Link href="/laptops" className="text-xs text-slate-700 font-semibold hover:underline">
                View Loans Desk
              </Link>
            </div>

            {recentLaptops.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No active laptop checkouts at this moment.
              </div>
            ) : (
              <div className="space-y-2">
                {recentLaptops.map((loan) => (
                  <div
                    key={loan._id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        {loan.laptopId?.assetTag || 'Laptop'} • {loan.borrowerName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Borrower ID: {loan.borrowerId}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-600">
                        Due: {new Date(loan.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {loan.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK BOOKING MODAL */}
      {showBookModal && selectedRoomForBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-[#8B1515] flex items-center justify-center">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Book {selectedRoomForBooking.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Room {selectedRoomForBooking.roomNumber} • Capacity: {selectedRoomForBooking.capacity} persons
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickBookSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Borrower / Student Name *</label>
                  <input
                    type="text"
                    required
                    value={bookingFormData.borrowerName}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, borrowerName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ID Number *</label>
                  <input
                    type="text"
                    required
                    value={bookingFormData.borrowerId}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, borrowerId: e.target.value })}
                    placeholder="e.g. 2026-10492"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={bookingFormData.date}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={bookingFormData.startTime}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={bookingFormData.endTime}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, endTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purpose of Session</label>
                  <input
                    type="text"
                    required
                    value={bookingFormData.purpose}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, purpose: e.target.value })}
                    placeholder="e.g. Group Thesis Work"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Attendees</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRoomForBooking.capacity}
                    value={bookingFormData.attendeesCount}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, attendeesCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={bookingFormData.notes}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, notes: e.target.value })}
                  placeholder="Additional equipment requested or special instructions..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="px-4 py-2 bg-[#8B1515] hover:bg-[#721111] text-white rounded-lg font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {bookingSubmitting ? 'Reserving...' : 'Confirm Room Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK LAPTOP CHECKOUT MODAL */}
      {showCheckoutModal && selectedLaptopForCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Laptop className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Checkout Laptop {selectedLaptopForCheckout.assetTag}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedLaptopForCheckout.brand} {selectedLaptopForCheckout.model} • Condition: {selectedLaptopForCheckout.condition}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickCheckoutSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Borrower / Student Name *</label>
                  <input
                    type="text"
                    required
                    value={checkoutFormData.borrowerName}
                    onChange={(e) => setCheckoutFormData({ ...checkoutFormData, borrowerName: e.target.value })}
                    placeholder="e.g. Maria Santos"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Borrower ID Number *</label>
                  <input
                    type="text"
                    required
                    value={checkoutFormData.borrowerId}
                    onChange={(e) => setCheckoutFormData({ ...checkoutFormData, borrowerId: e.target.value })}
                    placeholder="e.g. 2026-99381"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={checkoutFormData.borrowerEmail}
                    onChange={(e) => setCheckoutFormData({ ...checkoutFormData, borrowerEmail: e.target.value })}
                    placeholder="student@university.edu"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Return Time Today *</label>
                  <input
                    type="time"
                    required
                    value={checkoutFormData.dueTime}
                    onChange={(e) => setCheckoutFormData({ ...checkoutFormData, dueTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Checkout Remarks</label>
                <input
                  type="text"
                  value={checkoutFormData.notes}
                  onChange={(e) => setCheckoutFormData({ ...checkoutFormData, notes: e.target.value })}
                  placeholder="e.g. Issued with charger and mouse"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkoutSubmitting}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {checkoutSubmitting ? 'Checking Out...' : 'Issue Device to Patron'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
