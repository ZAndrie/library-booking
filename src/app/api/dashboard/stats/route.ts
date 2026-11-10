import { getDashboardStats } from '@/backend/controllers/dashboardController';

export const dynamic = 'force-dynamic';

export async function GET() {
  return getDashboardStats();
}
