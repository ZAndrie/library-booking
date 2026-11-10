import { NextRequest } from 'next/server';
import { getRoomBookingById, updateRoomBooking } from '@/backend/controllers/roomBookingController';

interface Params {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: Params) {
  return getRoomBookingById(params.id);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return updateRoomBooking(params.id, req);
}
