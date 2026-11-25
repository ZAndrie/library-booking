import { NextRequest } from 'next/server';
import { handleSelectPortal } from '@/backend/controllers/authController';

export async function POST(req: NextRequest) {
  return handleSelectPortal(req);
}
