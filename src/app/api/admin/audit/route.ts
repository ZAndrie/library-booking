import { NextRequest } from 'next/server';
import { getAuditLogs } from '@/backend/controllers/adminController';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return getAuditLogs(req);
}
