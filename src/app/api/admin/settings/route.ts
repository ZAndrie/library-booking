import { NextRequest } from 'next/server';
import { getSystemSettings, updateSystemSettings } from '@/backend/controllers/adminController';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return getSystemSettings();
}

export async function PATCH(req: NextRequest) {
  return updateSystemSettings(req);
}
