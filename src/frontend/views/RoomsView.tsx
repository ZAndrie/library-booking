'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/frontend/components/AppShell';
import {
  DoorOpen,
  Calendar,
  Clock,
  Plus,
  Users,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Settings2,
  Trash2,
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
}

interface RoomBooking {
  _id: string;
  roomId: Room;
  borrowerName: string;
  borrowerId: string;
  borrowerEmail?: string;
  borrowerContact?: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendeesCount: number;
  status: 'active' | 'completed' | 'cancelled' | 'no_show';
  bookedByStaffId?: { name: string; employeeId: string };
  notes?: string;
}

export default function RoomsView() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'rooms'>('schedule');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');

  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    roomId: '',
    borrowerName: '',
    borrowerId: '',
    borrowerEmail: '',
    borrowerContact: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    purpose: '',
    attendeesCount: 2,
    notes: '',
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Room Creation Modal
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    roomNumber: '',
    capacity: 4,
    facilities: '',
    location: '',
    notes: '',
  });
  const [roomError, setRoomError] = useState('');
  const [roomSubmitting, setRoomSubmitting] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (roomFilter !== 'all') params.append('roomId', roomFilter);

      const res = await fetch(`/api/room-bookings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, statusFilter, roomFilter]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setBookingSubmitting(true);

    try {
      const startDateTime = new Date(`${bookingFormData.date}T${bookingFormData.startTime}:00`);
      const endDateTime = new Date(`${bookingFormData.date}T${bookingFormData.endTime}:00`);

      const res = await fetch('/api/room-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: bookingFormData.roomId,
          borrowerName: bookingFormData.borrowerName,
          borrowerId: bookingFormData.borrowerId,
          borrowerEmail: bookingFormData.borrowerEmail,
          borrowerContact: bookingFormData.borrowerContact,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          purpose: bookingFormData.purpose,
          attendeesCount: bookingFormData.attendeesCount,
          notes: bookingFormData.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      setShowBookingModal(false);
      setBookingFormData({
        roomId: '',
        borrowerName: '',
        borrowerId: '',
        borrowerEmail: '',
        borrowerContact: '',
        date: selectedDate,
        startTime: '10:00',
        endTime: '12:00',
        purpose: '',
        attendeesCount: 2,
        notes: '',
      });
      fetchBookings();
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomError('');
    setRoomSubmitting(true);

    try {
      const facilitiesArray = roomFormData.facilities
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomFormData.name,
          roomNumber: roomFormData.roomNumber,
          capacity: Number(roomFormData.capacity),
          facilities: facilitiesArray,
          location: roomFormData.location,
          notes: roomFormData.notes,
          status: 'available',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add room');
      }

      setShowRoomModal(false);
      setRoomFormData({
        name: '',
        roomNumber: '',
        capacity: 4,
        facilities: '',
        location: '',
        notes: '',
      });
      fetchRooms();
    } catch (err: any) {
      setRoomError(err.message);
    } finally {
      setRoomSubmitting(false);
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: 'completed' | 'cancelled' | 'no_show',
    extendMinutes?: number
  ) => {
    setActionLoadingId(bookingId);
    try {
      const payload: any = { status };
      if (extendMinutes) {
        payload.extendMinutes = extendMinutes;
      }

      const res = await fetch(`/api/room-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update booking');
      } else {
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExtendBooking = async (bookingId: string, minutes: number) => {
    setActionLoadingId(bookingId);
    try {
      const res = await fetch(`/api/room-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extendMinutes: minutes }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Conflict detected! Cannot extend time.');
      } else {
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleRoomStatus = async (roomId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchRooms();
      }
    } catch (err) {
      console.error('Failed to change room status:', err);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to remove this discussion room?')) return;

    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete room');
      } else {
        fetchRooms();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header with Subsystem Identifier */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                System 1
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Discussion Room Booking System
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Staff desk terminal for walk-ins, phone reservations, conflict verification, and room facilities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBookingModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-900/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Room Reservation
            </button>
            <button
              onClick={() => setShowRoomModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all"
            >
              <PlusCircle className="w-4 h-4 text-slate-400" />
              Add Room
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Desk Schedule & Reservations
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'rooms'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            Room Facilities & Capacity ({rooms.length})
          </button>
        </div>

        {/* TAB 1: SCHEDULE & RESERVATIONS */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Reservation Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Filter Room
                </label>
                <select
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Discussion Rooms</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.roomNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Sessions</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>

              <div className="ml-auto self-end text-xs text-slate-400">
                Found <span className="font-bold text-white">{bookings.length}</span> reservations
              </div>
            </div>

            {/* Bookings Table / List */}
            {bookings.length === 0 ? (
              <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl py-12 text-center text-xs text-slate-400">
                <DoorOpen className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                No reservations scheduled for {selectedDate}.
                <div className="mt-3">
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="text-blue-400 hover:underline font-semibold"
                  >
                    + Book a room for this date
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const startTimeStr = new Date(booking.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const endTimeStr = new Date(booking.endTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const isCurrentActive =
                    booking.status === 'active' &&
                    new Date() >= new Date(booking.startTime) &&
                    new Date() <= new Date(booking.endTime);

                  return (
                    <div
                      key={booking._id}
                      className={`bg-slate-800/90 border rounded-xl p-4 transition-all ${
                        isCurrentActive
                          ? 'border-blue-500/80 shadow-md shadow-blue-900/20'
                          : 'border-slate-700/80'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">
                              {booking.roomId?.name || 'Room'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/30">
                              {booking.roomId?.roomNumber}
                            </span>
                            {isCurrentActive && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                                Session In Progress
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                booking.status === 'active'
                                  ? 'bg-blue-500/10 text-blue-300'
                                  : booking.status === 'completed'
                                  ? 'bg-slate-700 text-slate-300'
                                  : 'bg-rose-500/10 text-rose-300'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                              <Clock className="w-3.5 h-3.5 text-blue-400" />
                              {startTimeStr} - {endTimeStr}
                            </span>
                            <span>•</span>
                            <span>
                              Borrower:{' '}
                              <strong className="text-white">{booking.borrowerName}</strong> (ID:{' '}
                              {booking.borrowerId})
                            </span>
                            {booking.borrowerContact && (
                              <>
                                <span>•</span>
                                <span>{booking.borrowerContact}</span>
                              </>
                            )}
                          </div>

                          <div className="text-xs text-slate-300 mt-1">
                            <span className="text-slate-500">Purpose: </span>
                            {booking.purpose} ({booking.attendeesCount} attendees)
                          </div>
                          {booking.notes && (
                            <div className="text-[11px] text-amber-300/80 italic">
                              Staff Note: {booking.notes}
                            </div>
                          )}
                        </div>

                        {booking.status === 'active' && (
                          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-700/60">
                            <button
                              onClick={() => handleUpdateBookingStatus(booking._id, 'completed')}
                              disabled={actionLoadingId === booking._id}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Check-out Room
                            </button>

                            <button
                              onClick={() => handleExtendBooking(booking._id, 30)}
                              disabled={actionLoadingId === booking._id}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center gap-1 border border-slate-600 transition-colors"
                            >
                              +30m Extend
                            </button>

                            <button
                              onClick={() => handleExtendBooking(booking._id, 60)}
                              disabled={actionLoadingId === booking._id}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center gap-1 border border-slate-600 transition-colors"
                            >
                              +60m Extend
                            </button>

                            <button
                              onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                              disabled={actionLoadingId === booking._id}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/30 transition-colors"
                            >
                              Cancel
                            </button>

                            <button
                              onClick={() => handleUpdateBookingStatus(booking._id, 'no_show')}
                              disabled={actionLoadingId === booking._id}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium border border-slate-700 transition-colors"
                            >
                              No Show
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ROOM INVENTORY & CONFIG */}
        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-white">{room.name}</h3>
                      <span className="text-xs text-blue-400 font-semibold">{room.roomNumber}</span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        room.status === 'available'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : room.status === 'maintenance'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 mb-3">
                    <p>
                      <strong>Location:</strong> {room.location}
                    </p>
                    <p className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Max Capacity:</strong> {room.capacity} persons
                    </p>
                    {room.notes && (
                      <p className="text-slate-400 italic text-[11px]">{room.notes}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {room.facilities.map((fac, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        handleToggleRoomStatus(
                          room._id,
                          room.status === 'available' ? 'maintenance' : 'available'
                        )
                      }
                      className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-medium"
                    >
                      {room.status === 'available' ? 'Set Maintenance' : 'Set Ready'}
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteRoom(room._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-700"
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: NEW ROOM BOOKING */}
        {showBookingModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DoorOpen className="w-5 h-5 text-blue-400" />
                  New Discussion Room Reservation
                </h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {bookingError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              <form onSubmit={handleCreateBooking} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Select Room *
                  </label>
                  <select
                    required
                    value={bookingFormData.roomId}
                    onChange={(e) =>
                      setBookingFormData({ ...bookingFormData, roomId: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="">-- Choose Discussion Room --</option>
                    {rooms
                      .filter((r) => r.status === 'available')
                      .map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name} ({r.roomNumber}) - Cap: {r.capacity} pax
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Borrower Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={bookingFormData.borrowerName}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, borrowerName: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Student / Staff ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. STU-8821"
                      value={bookingFormData.borrowerId}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, borrowerId: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+1 555-0192"
                      value={bookingFormData.borrowerContact}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, borrowerContact: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Borrower Email
                    </label>
                    <input
                      type="email"
                      placeholder="borrower@student.edu"
                      value={bookingFormData.borrowerEmail}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, borrowerEmail: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingFormData.date}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, date: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={bookingFormData.startTime}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, startTime: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={bookingFormData.endTime}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, endTime: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Purpose of Booking *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Software Engineering Group Study"
                      value={bookingFormData.purpose}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, purpose: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Attendees Pax
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={bookingFormData.attendeesCount}
                      onChange={(e) =>
                        setBookingFormData({
                          ...bookingFormData,
                          attendeesCount: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Staff Desk Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Borrowed HDMI cable from counter"
                    value={bookingFormData.notes}
                    onChange={(e) =>
                      setBookingFormData({ ...bookingFormData, notes: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {bookingSubmitting ? 'Verifying Availability...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW ROOM */}
        {showRoomModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-blue-400" />
                  Add New Discussion Room
                </h3>
                <button onClick={() => setShowRoomModal(false)} className="text-slate-400">
                  ✕
                </button>
              </div>

              {roomError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {roomError}
                </div>
              )}

              <form onSubmit={handleCreateRoom} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Discussion Room E"
                    value={roomFormData.name}
                    onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DR-301"
                      value={roomFormData.roomNumber}
                      onChange={(e) =>
                        setRoomFormData({ ...roomFormData, roomNumber: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Capacity (Pax) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={roomFormData.capacity}
                      onChange={(e) =>
                        setRoomFormData({ ...roomFormData, capacity: Number(e.target.value) })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Level 3, East Collaborative Wing"
                    value={roomFormData.location}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, location: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Facilities (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Whiteboard, 55&quot; Smart TV, Power Sockets"
                    value={roomFormData.facilities}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, facilities: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRoomModal(false)}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={roomSubmitting}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-xs font-bold text-white"
                  >
                    {roomSubmitting ? 'Saving...' : 'Create Room'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
