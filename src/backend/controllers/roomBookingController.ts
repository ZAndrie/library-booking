import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/backend/database/db';
import RoomBooking from '@/backend/models/RoomBooking';
import Room from '@/backend/models/Room';
import { getCurrentUser } from '@/backend/auth/jwt';

export async function getRoomBookings(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');
    const dateStr = searchParams.get('date');
    const borrowerId = searchParams.get('borrowerId');

    const filter: any = {};

    if (roomId && roomId !== 'all') {
      filter.roomId = roomId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (borrowerId) {
      filter.borrowerId = { $regex: borrowerId.trim(), $options: 'i' };
    }

    if (dateStr) {
      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);

      filter.startTime = { $lte: endOfDay };
      filter.endTime = { $gte: startOfDay };
    }

    const bookings = await RoomBooking.find(filter)
      .populate('roomId', 'name roomNumber capacity facilities status location')
      .populate('bookedByStaffId', 'name employeeId')
      .sort({ startTime: 1 });

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.warn('Bookings notice: MongoDB offline, returning empty bookings array');
    return NextResponse.json({ success: true, bookings: [], isDatabaseOffline: true });
  }
}

export async function createRoomBooking(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      roomId,
      borrowerName,
      borrowerId,
      borrowerEmail,
      borrowerContact,
      startTime,
      endTime,
      purpose,
      attendeesCount,
      notes,
    } = body;

    if (!roomId || !borrowerName || !borrowerId || !startTime || !endTime || !purpose) {
      return NextResponse.json(
        { error: 'Room, Borrower Name, Borrower ID, Start Time, End Time, and Purpose are required.' },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid start or end time format.' }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json({ error: 'End time must be after start time.' }, { status: 400 });
    }

    await connectToDatabase();

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Selected room was not found.' }, { status: 404 });
    }

    if (room.status !== 'available') {
      return NextResponse.json(
        { error: `Cannot book room ${room.name} because its status is currently "${room.status}".` },
        { status: 400 }
      );
    }

    if (attendeesCount && Number(attendeesCount) > room.capacity) {
      return NextResponse.json(
        { error: `Requested attendees (${attendeesCount}) exceeds room capacity (${room.capacity}).` },
        { status: 400 }
      );
    }

    // Overlap conflict check: (ExistingStart < NewEnd) AND (ExistingEnd > NewStart) AND status == 'active'
    const conflict = await RoomBooking.findOne({
      roomId: room._id,
      status: 'active',
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (conflict) {
      const conflictStart = new Date(conflict.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const conflictEnd = new Date(conflict.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return NextResponse.json(
        {
          error: `Time conflict! Room is already booked from ${conflictStart} to ${conflictEnd} by ${conflict.borrowerName} (${conflict.borrowerId}).`,
        },
        { status: 409 }
      );
    }

    const booking = await RoomBooking.create({
      roomId: room._id,
      borrowerName: borrowerName.trim(),
      borrowerId: borrowerId.toUpperCase().trim(),
      borrowerEmail: borrowerEmail ? borrowerEmail.trim() : undefined,
      borrowerContact: borrowerContact ? borrowerContact.trim() : undefined,
      startTime: start,
      endTime: end,
      purpose: purpose.trim(),
      attendeesCount: attendeesCount ? Number(attendeesCount) : 1,
      notes: notes || '',
      status: 'active',
      bookedByStaffId: user.id,
    });

    const populated = await RoomBooking.findById(booking._id)
      .populate('roomId', 'name roomNumber capacity facilities')
      .populate('bookedByStaffId', 'name employeeId');

    return NextResponse.json({ success: true, booking: populated }, { status: 201 });
  } catch (error: any) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create room booking' },
      { status: 500 }
    );
  }
}

export async function getRoomBookingById(id: string) {
  try {
    await connectToDatabase();
    const booking = await RoomBooking.findById(id)
      .populate('roomId')
      .populate('bookedByStaffId', 'name employeeId');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function updateRoomBooking(id: string, req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status, extendMinutes, notes } = body;

    await connectToDatabase();
    const booking = await RoomBooking.findById(id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (extendMinutes && Number(extendMinutes) > 0) {
      if (booking.status !== 'active') {
        return NextResponse.json(
          { error: 'Can only extend active room bookings.' },
          { status: 400 }
        );
      }

      const currentEnd = new Date(booking.endTime);
      const newEnd = new Date(currentEnd.getTime() + Number(extendMinutes) * 60 * 1000);

      const conflict = await RoomBooking.findOne({
        _id: { $ne: booking._id },
        roomId: booking.roomId,
        status: 'active',
        startTime: { $lt: newEnd },
        endTime: { $gt: currentEnd },
      });

      if (conflict) {
        return NextResponse.json(
          {
            error: `Cannot extend: Room is booked starting at ${new Date(conflict.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by ${conflict.borrowerName}.`,
          },
          { status: 409 }
        );
      }

      booking.endTime = newEnd;
    }

    if (status && ['active', 'completed', 'cancelled', 'no_show'].includes(status)) {
      booking.status = status;
    }

    if (notes !== undefined) {
      booking.notes = notes;
    }

    await booking.save();

    const populated = await RoomBooking.findById(booking._id)
      .populate('roomId', 'name roomNumber capacity')
      .populate('bookedByStaffId', 'name employeeId');

    return NextResponse.json({ success: true, booking: populated });
  } catch (error: any) {
    console.error('Update booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
