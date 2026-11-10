import { handleGetCurrentUser } from '@/backend/controllers/authController';

export const dynamic = 'force-dynamic';

export async function GET() {
  return handleGetCurrentUser();
}
