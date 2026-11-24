import { NextRequest } from 'next/server';
import { getStaffUsers } from '@/backend/controllers/adminController';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return getStaffUsers();
}
