import { NextRequest } from 'next/server';
import { updateStaffUser, deleteStaffUser } from '@/backend/controllers/adminController';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return updateStaffUser(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return deleteStaffUser(params.id);
}
