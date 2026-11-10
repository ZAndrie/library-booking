import { NextRequest } from 'next/server';
import { getRoomBookings, createRoomBooking } from '@/backend/controllers/roomBookingController';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return getRoomBookings(req);
}

export async function POST(req: NextRequest) {
  return createRoomBooking(req);
}
