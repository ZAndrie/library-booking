import { NextRequest } from 'next/server';
import { getLaptopById, updateLaptop, deleteLaptop } from '@/backend/controllers/laptopController';

interface Params {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: Params) {
  return getLaptopById(params.id);
}

export async function PUT(req: NextRequest, { params }: Params) {
  return updateLaptop(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  return deleteLaptop(params.id);
}
