import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Room from '@/models/Room';
import RoomBooking from '@/models/RoomBooking';
import { getCurrentUser } from '@/lib/auth';

interface Params {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const room = await Room.findById(params.id);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, room });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();

    const room = await Room.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, room });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete rooms' }, { status: 403 });
    }

    await connectToDatabase();

    // Check if room has active bookings
    const activeBooking = await RoomBooking.findOne({
      roomId: params.id,
      status: 'active',
      endTime: { $gte: new Date() },
    });

    if (activeBooking) {
      return NextResponse.json(
        { error: 'Cannot delete room with active upcoming reservations. Cancel them first or mark room as closed.' },
        { status: 400 }
      );
    }

    const deleted = await Room.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Room removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
