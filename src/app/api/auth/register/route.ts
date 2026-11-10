import { NextRequest } from 'next/server';
import { handleRegister } from '@/backend/controllers/authController';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return handleRegister(req);
}
