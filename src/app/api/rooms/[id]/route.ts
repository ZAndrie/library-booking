import { NextRequest } from 'next/server';
import { getRoomById, updateRoom, deleteRoom } from '@/backend/controllers/roomController';

interface Params {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: Params) {
  return getRoomById(params.id);
}

export async function PUT(req: NextRequest, { params }: Params) {
  return updateRoom(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  return deleteRoom(params.id);
}
