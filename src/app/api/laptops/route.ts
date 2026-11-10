import { NextRequest } from 'next/server';
import { getLaptops, createLaptop } from '@/backend/controllers/laptopController';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return getLaptops(req);
}

export async function POST(req: NextRequest) {
  return createLaptop(req);
}
