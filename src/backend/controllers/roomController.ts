import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/backend/database/db';
import Room from '@/backend/models/Room';
import RoomBooking from '@/backend/models/RoomBooking';
import { getCurrentUser } from '@/backend/auth/jwt';

export async function getRooms(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    return NextResponse.json({ success: true, rooms });
  } catch (error: any) {
    console.warn('Rooms notice: MongoDB offline, returning dev store rooms');
    const { getDevRooms } = await import('@/backend/database/devStore');
    return NextResponse.json({ success: true, rooms: getDevRooms(), isDatabaseOffline: true });
  }
}

export async function createRoom(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, roomNumber, capacity, facilities, location, notes, status } = body;

    if (!name || !roomNumber || !capacity || !location) {
      return NextResponse.json(
        { error: 'Name, Room Number, Capacity, and Location are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await Room.findOne({ roomNumber: roomNumber.toUpperCase().trim() });
    if (existing) {
      return NextResponse.json(
        { error: `Room with number ${roomNumber} already exists.` },
        { status: 400 }
      );
    }

    const room = await Room.create({
      name: name.trim(),
      roomNumber: roomNumber.toUpperCase().trim(),
      capacity: Number(capacity),
      facilities: Array.isArray(facilities) ? facilities : [],
      location: location.trim(),
      notes: notes || '',
      status: status || 'available',
    });

    return NextResponse.json({ success: true, room }, { status: 201 });
  } catch (error: any) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create room' },
      { status: 500 }
    );
  }
}

export async function getRoomById(id: string) {
  try {
    await connectToDatabase();
    const room = await Room.findById(id);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, room });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function updateRoom(id: string, req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();

    const room = await Room.findByIdAndUpdate(id, body, {
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

export async function deleteRoom(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Only administrators or super administrators can delete rooms' }, { status: 403 });
    }

    await connectToDatabase();

    const activeBooking = await RoomBooking.findOne({
      roomId: id,
      status: 'active',
      endTime: { $gte: new Date() },
    });

    if (activeBooking) {
      return NextResponse.json(
        { error: 'Cannot delete room with active upcoming reservations. Cancel them first or mark room as closed.' },
        { status: 400 }
      );
    }

    const deleted = await Room.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Room removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
