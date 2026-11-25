import { NextRequest } from 'next/server';
import { getStaffUsers, createStaffUser } from '@/backend/controllers/adminController';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return getStaffUsers();
}

export async function POST(req: NextRequest) {
  return createStaffUser(req);
}
