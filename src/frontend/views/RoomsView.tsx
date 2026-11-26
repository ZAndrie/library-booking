'use client';

import React, { useState, useEffect } from 'react';
import RoomBookingFormFields, {
  RoomBookingFormState,
  createDynamicBookingState,
  buildBookingPurpose,
  getLocalDateString,
} from '@/frontend/components/RoomBookingFormFields';
import {
  DEFAULT_SYSTEM_POLICIES,
  SystemPolicyData,
  getRoomBookingDisplayState,
} from '@/lib/policyUtils';
import {
  fetchClientPolicies,
  fetchClientUser,
  getStoredClientUser,
} from '@/lib/clientDataCache';
import { useToast } from '@/frontend/components/ToastProvider';
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
  CalendarPlus,
  Edit2,
  X,
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
  borrowerId?: string;
  courseAndYear?: string;
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
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(() => getStoredClientUser());
  const [activeTab, setActiveTab] = useState<'schedule' | 'rooms'>('schedule');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [policies, setPolicies] = useState<SystemPolicyData>(DEFAULT_SYSTEM_POLICIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientUser()
      .then((u) => u && setCurrentUser(u))
      .catch(console.error);

    let actionNew = false;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const actionParam = params.get('action');

      if (tabParam === 'rooms') {
        setActiveTab('rooms');
      } else if (tabParam === 'schedule') {
        setActiveTab('schedule');
      }

      if (actionParam === 'new') {
        actionNew = true;
        setBookingFormData(createDynamicBookingState());
        setShowBookingModal(true);
      }
    }

    fetchClientPolicies()
      .then((nextPolicies) => {
        setPolicies(nextPolicies);
        if (actionNew) {
          setBookingFormData(createDynamicBookingState('', nextPolicies.maxSlotDurationHours));
        }
      })
      .catch(console.error);
  }, []);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');

  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingFormData, setBookingFormData] = useState<RoomBookingFormState>(() =>
    createDynamicBookingState()
  );
  const [bookingError, setBookingError] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const openNewBookingModal = (prefillRoomId = '', prefillDate?: string) => {
    setBookingError('');
    setBookingFormData({
      ...createDynamicBookingState(prefillRoomId, policies.maxSlotDurationHours),
      ...(prefillDate ? { date: prefillDate } : {}),
    });
    setShowBookingModal(true);
  };

  // Room Creation / Edit Modal
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    roomNumber: '',
    capacity: '',
    facilities: '',
    location: '',
    notes: '',
  });
  const [roomError, setRoomError] = useState('');
  const [roomSubmitting, setRoomSubmitting] = useState(false);

  const openAddRoomModal = () => {
    setEditingRoomId(null);
    setRoomError('');
    setRoomFormData({
      name: '',
      roomNumber: '',
      capacity: '',
      facilities: '',
      location: '',
      notes: '',
    });
    setShowRoomModal(true);
  };

  const openEditRoomModal = (room: Room) => {
    setEditingRoomId(room._id);
    setRoomError('');
    setRoomFormData({
      name: room.name || '',
      roomNumber: room.roomNumber || '',
      capacity: String(room.capacity ?? ''),
      facilities: Array.isArray(room.facilities) ? room.facilities.join(', ') : '',
      location: room.location || '',
      notes: room.notes || '',
    });
    setShowRoomModal(true);
  };

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        const loadedRooms: Room[] = data.rooms || [];
        setRooms(loadedRooms);
        if (typeof window !== 'undefined') {
          const editId = new URLSearchParams(window.location.search).get('editRoomId');
          if (editId) {
            const match = loadedRooms.find((r) => r._id === editId);
            if (match) {
              setActiveTab('rooms');
              openEditRoomModal(match);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedDate) queryParams.set('date', selectedDate);
      if (statusFilter && statusFilter !== 'all') queryParams.set('status', statusFilter);
      if (roomFilter && roomFilter !== 'all') queryParams.set('roomId', roomFilter);

      const res = await fetch(`/api/room-bookings?${queryParams.toString()}`);
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

    const purposeResult = buildBookingPurpose(
      bookingFormData.selectedPurposes,
      bookingFormData.otherPurpose
    );
    if (purposeResult.error) {
      setBookingError(purposeResult.error);
      return;
    }

    const parsedUsers = Number(bookingFormData.attendeesCount);
    if (!bookingFormData.attendeesCount.trim() || isNaN(parsedUsers) || parsedUsers < 1) {
      setBookingError('Please enter a valid No. of Users.');
      return;
    }

    setBookingSubmitting(true);

    try {
      const startDateTime = new Date(`${bookingFormData.date}T${bookingFormData.startTime}:00`);
      const endDateTime = new Date(`${bookingFormData.date}T${bookingFormData.endTime}:00`);

      const payload = {
        roomId: bookingFormData.roomId,
        borrowerName: bookingFormData.borrowerName,
        courseAndYear: bookingFormData.courseAndYear,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        purpose: purposeResult.purpose,
        purposes: purposeResult.purposes,
        attendeesCount: parsedUsers,
        adminOverride: bookingFormData.adminOverride,
      };

      const res = await fetch('/api/room-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || 'Failed to create booking reservation.';
        setBookingError(msg);
        toast.error(msg, 'Reservation Failed');
      } else {
        toast.success(
          `Reserved for ${bookingFormData.borrowerName} (${bookingFormData.startTime} – ${bookingFormData.endTime}).`,
          'Reservation Created'
        );
        setShowBookingModal(false);
        setBookingFormData(createDynamicBookingState());
        fetchBookings();
      }
    } catch (err: any) {
      const msg = err.message || 'Error occurred while saving reservation.';
      setBookingError(msg);
      toast.error(msg, 'Reservation Failed');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomError('');

    const parsedCapacity = Number(roomFormData.capacity);
    if (!roomFormData.capacity.trim() || isNaN(parsedCapacity) || parsedCapacity < 1) {
      setRoomError('Please enter a valid room capacity.');
      return;
    }

    setRoomSubmitting(true);

    try {
      const facArray = roomFormData.facilities
        ? roomFormData.facilities.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

      const endpoint = editingRoomId ? `/api/rooms/${editingRoomId}` : '/api/rooms';
      const method = editingRoomId ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...roomFormData,
          capacity: parsedCapacity,
          facilities: facArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || `Failed to ${editingRoomId ? 'update' : 'add'} room.`;
        setRoomError(msg);
        toast.error(msg, editingRoomId ? 'Update Failed' : 'Creation Failed');
      } else {
        toast.success(
          `${roomFormData.name} (${roomFormData.roomNumber.toUpperCase()}) ${editingRoomId ? 'changes saved' : 'created'}.`,
          editingRoomId ? 'Room Updated' : 'Room Created'
        );
        setShowRoomModal(false);
        setEditingRoomId(null);
        setRoomFormData({
          name: '',
          roomNumber: '',
          capacity: '',
          facilities: '',
          location: '',
          notes: '',
        });
        fetchRooms();
      }
    } catch (err: any) {
      const msg = err.message || `Error occurred while ${editingRoomId ? 'updating' : 'creating'} room.`;
      setRoomError(msg);
      toast.error(msg);
    } finally {
      setRoomSubmitting(false);
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: 'completed' | 'cancelled' | 'no_show'
  ) => {
    try {
      setActionLoadingId(bookingId);
      const res = await fetch(`/api/room-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update booking');
      } else {
        toast.success(
          newStatus === 'completed'
            ? 'Room checked out and marked completed.'
            : newStatus === 'cancelled'
            ? 'Reservation cancelled.'
            : 'Booking marked as no-show.',
          newStatus === 'completed' ? 'Session Completed' : 'Booking Updated'
        );
        fetchBookings();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update booking');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExtendBooking = async (bookingId: string, extensionMinutes: number) => {
    try {
      setActionLoadingId(bookingId);
      const res = await fetch(`/api/room-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extensionMinutes }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to extend session', 'Extension Blocked');
      } else {
        toast.success(`Session extended by +${extensionMinutes} minutes.`, 'Session Extended');
        fetchBookings();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to extend session');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleRoomStatus = async (
    roomId: string,
    newStatus: 'available' | 'maintenance' | 'closed'
  ) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update room');
      } else {
        toast.success(`Room status set to ${newStatus}.`, 'Room Status Saved');
        fetchRooms();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update room');
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
        toast.error(data.error || 'Failed to delete room');
      } else {
        toast.success('Discussion room permanently removed.', 'Room Deleted');
        fetchRooms();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete room');
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with Crimson Serif Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-[#8B1515] border border-red-200">
                Library Booking System
              </span>
              <h1 className="font-serif font-bold text-2xl text-[#8B1515] tracking-tight">
                Discussion Room Booking
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Staff console for room schedules, reservations, collision detection, and facilities maintenance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openNewBookingModal()}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#8B1515] hover:bg-[#721111] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              New Room Reservation
            </button>
            {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (
              <button
                onClick={openAddRoomModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-slate-500" />
                Add Room
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'border-[#8B1515] text-[#8B1515]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Desk Schedule & Reservations
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'rooms'
                ? 'border-[#8B1515] text-[#8B1515]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
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
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Reservation Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1515]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Filter Room
                </label>
                <select
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1515]"
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
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1515]"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active & Reserved</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>

              <div className="ml-auto self-end text-xs text-slate-500 font-medium">
                Found <strong className="text-slate-800">{bookings.length}</strong> reservations
              </div>
            </div>

            {/* Bookings Table / List */}
            {bookings.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl py-12 text-center text-xs text-slate-500 shadow-sm">
                <DoorOpen className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                No reservations scheduled for {selectedDate}.
                <div className="mt-3">
                  <button
                    onClick={() => openNewBookingModal('', selectedDate)}
                    className="text-[#8B1515] hover:underline font-semibold"
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
                  const displayState = getRoomBookingDisplayState(booking);
                  const isCurrentActive = displayState.kind === 'active_session';

                  return (
                    <div
                      key={booking._id}
                      className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${
                        isCurrentActive
                          ? 'border-[#8B1515] ring-1 ring-[#8B1515]/20'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif font-bold text-base text-slate-900">
                              {booking.roomId?.name || 'Discussion Room'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-[#8B1515] font-semibold border border-red-200">
                              {booking.roomId?.roomNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${displayState.badgeClass}`}
                            >
                              {displayState.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                              <Clock className="w-3.5 h-3.5 text-[#8B1515]" />
                              {startTimeStr} - {endTimeStr}
                            </span>
                            <span>•</span>
                            <span>
                              Name: <strong className="text-slate-900">{booking.borrowerName}</strong>
                              {booking.courseAndYear
                                ? ` (${booking.courseAndYear})`
                                : booking.borrowerId
                                ? ` (ID: ${booking.borrowerId})`
                                : ''}
                            </span>
                            <span>•</span>
                            <span>
                              No. of Users: <strong className="text-slate-800">{booking.attendeesCount}</strong>
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 mt-1">
                            <span className="font-semibold text-slate-700">Purpose: </span>
                            {booking.purpose}
                          </div>
                          {booking.notes && (
                            <div className="text-[11px] text-amber-700 italic">
                              Staff Note: {booking.notes}
                            </div>
                          )}
                        </div>

                        {booking.status === 'active' && (
                          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                            <button
                              onClick={() => handleUpdateBookingStatus(booking._id, 'completed')}
                              disabled={actionLoadingId === booking._id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Check-out Room
                            </button>

                            <button
                              onClick={() => handleExtendBooking(booking._id, 30)}
                              disabled={actionLoadingId === booking._id}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-300 transition-colors"
                            >
                              +30m Extend
                            </button>

                            <button
                              onClick={() => handleExtendBooking(booking._id, 60)}
                              disabled={actionLoadingId === booking._id}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-300 transition-colors"
                            >
                              +60m Extend
                            </button>

                            <button
                              onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                              disabled={actionLoadingId === booking._id}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium border border-rose-200 transition-colors"
                            >
                              Cancel
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-2xl py-12 px-4 text-center text-xs text-slate-500 shadow-sm flex flex-col items-center justify-center">
                <DoorOpen className="w-10 h-10 text-slate-400 mb-2 opacity-50" />
                <p className="font-semibold text-slate-700 text-sm">No discussion rooms configured yet</p>
                <p className="text-slate-500 max-w-sm mt-1">
                  Add your first discussion room to enable online reservations and group study scheduling.
                </p>
                {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') ? (
                  <button
                    onClick={() => setShowRoomModal(true)}
                    className="mt-4 px-4 py-2 bg-[#8B1515] hover:bg-[#721111] text-white font-bold rounded-xl shadow-sm text-xs transition-colors cursor-pointer"
                  >
                    + Add Discussion Room
                  </button>
                ) : (
                  <p className="mt-3 text-slate-400 italic text-[11px]">
                    Contact your Library Administrator or Super Admin to configure discussion spaces.
                  </p>
                )}
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Crimson Top Header */}
                    <div className="bg-[#8B1515] text-white p-4 flex items-start justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-base text-white">{room.name}</h3>
                        <p className="text-xs text-rose-200">Room {room.roomNumber}</p>
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          room.status === 'available'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="text-xs text-slate-600 space-y-1">
                        <p>
                          <strong>Location:</strong> {room.location}
                        </p>
                        <p className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <strong>Capacity:</strong> {room.capacity} users
                        </p>
                        {room.notes && (
                          <p className="text-slate-500 italic text-[11px]">{room.notes}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {room.facilities.map((fac, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                          >
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs bg-slate-50/50">
                    <button
                      onClick={() =>
                        handleToggleRoomStatus(
                          room._id,
                          room.status === 'available' ? 'maintenance' : 'available'
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      {room.status === 'available' ? 'Set Maintenance' : 'Set Available'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (
                        <button
                          onClick={() => openEditRoomModal(room)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Edit Room Details (Admin)"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#8B1515]" />
                          <span>Edit</span>
                        </button>
                      )}

                      {currentUser?.role === 'super_admin' && (
                        <button
                          onClick={() => handleDeleteRoom(room._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Delete Room Permanently (Super Admin Only)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

        {/* MODAL: NEW ROOM BOOKING */}
        {showBookingModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-3 max-h-[95vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                  <DoorOpen className="w-5 h-5 text-[#8B1515]" />
                  New Discussion Room Reservation
                </h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {bookingError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
                <RoomBookingFormFields
                  formData={bookingFormData}
                  setFormData={setBookingFormData}
                  rooms={rooms}
                  policies={policies}
                  existingBookings={bookings}
                  isAdmin={
                    currentUser?.role === 'admin' || currentUser?.role === 'super_admin'
                  }
                />

                <div className="pt-2.5 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="px-4 py-2 rounded-lg bg-[#8B1515] hover:bg-[#721111] font-semibold text-white disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {bookingSubmitting ? 'Verifying Availability...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT ROOM */}
        {showRoomModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-3.5 max-h-[95vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                  {editingRoomId ? (
                    <Edit2 className="w-5 h-5 text-[#8B1515]" />
                  ) : (
                    <PlusCircle className="w-5 h-5 text-[#8B1515]" />
                  )}
                  {editingRoomId ? 'Edit Discussion Room' : 'Add New Discussion Room'}
                </h3>
                <button onClick={() => setShowRoomModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {roomError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {roomError}
                </div>
              )}

              <form onSubmit={handleSaveRoom} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Discussion Room E"
                    value={roomFormData.name}
                    onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Capacity (Pax) *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="e.g. 15"
                      value={roomFormData.capacity}
                      onChange={(e) =>
                        setRoomFormData({
                          ...roomFormData,
                          capacity: e.target.value.replace(/\D/g, ''),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Facilities (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Table and Chairs, Whiteboard, AC"
                    value={roomFormData.facilities}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, facilities: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Room reminders or equipment details"
                    value={roomFormData.notes}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, notes: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  />
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRoomModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={roomSubmitting}
                    className="px-4 py-2 rounded-lg bg-[#8B1515] hover:bg-[#721111] font-semibold text-white shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {roomSubmitting
                      ? 'Saving...'
                      : editingRoomId
                      ? 'Save Changes'
                      : 'Create Room'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
