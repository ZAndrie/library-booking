import { NextRequest } from 'next/server';
import { getRooms, createRoom } from '@/backend/controllers/roomController';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return getRooms(req);
}

export async function POST(req: NextRequest) {
  return createRoom(req);
}
