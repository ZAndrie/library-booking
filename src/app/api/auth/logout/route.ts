import { handleLogout } from '@/backend/controllers/authController';

export const dynamic = 'force-dynamic';

export async function POST() {
  return handleLogout();
}
