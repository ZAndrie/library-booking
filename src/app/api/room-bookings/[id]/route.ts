import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import RoomBooking from '@/models/RoomBooking';
import { getCurrentUser } from '@/lib/auth';

interface Params {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const booking = await RoomBooking.findById(params.id)
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

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status, extendMinutes, notes } = body;

    await connectToDatabase();
    const booking = await RoomBooking.findById(params.id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Handle session extension
    if (extendMinutes && Number(extendMinutes) > 0) {
      if (booking.status !== 'active') {
        return NextResponse.json(
          { error: 'Can only extend active room bookings.' },
          { status: 400 }
        );
      }

      const currentEnd = new Date(booking.endTime);
      const newEnd = new Date(currentEnd.getTime() + Number(extendMinutes) * 60 * 1000);

      // Check if another active booking conflicts in this extended window
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

    // Handle status change
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
