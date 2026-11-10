import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Room from '@/models/Room';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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
    console.error('Fetch rooms error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch rooms' },
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
    const { name, roomNumber, capacity, facilities, location, notes, status } = body;

    if (!name || !roomNumber || !capacity || !location) {
      return NextResponse.json(
        { error: 'Name, Room Number, Capacity, and Location are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check duplicate room number
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
