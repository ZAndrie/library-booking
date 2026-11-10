import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import RoomBooking from '@/models/RoomBooking';
import Room from '@/models/Room';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');
    const dateStr = searchParams.get('date'); // YYYY-MM-DD
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

      // Bookings that overlap with this date
      filter.startTime = { $lte: endOfDay };
      filter.endTime = { $gte: startOfDay };
    }

    const bookings = await RoomBooking.find(filter)
      .populate('roomId', 'name roomNumber capacity facilities status location')
      .populate('bookedByStaffId', 'name employeeId')
      .sort({ startTime: 1 });

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    // Verify room status
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

    // Overlap Conflict Check:
    // (ExistingStart < NewEnd) AND (ExistingEnd > NewStart) AND status == 'active'
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
