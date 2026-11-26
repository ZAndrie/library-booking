import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/backend/auth/jwt';

export const dynamic = 'force-dynamic';

export default async function PortalPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'admin' || user.role === 'super_admin') {
    redirect('/dashboard');
  }

  if (user.portal === 'rooms' || user.portal === 'laptops') {
    redirect(`/${user.portal}`);
  }

  redirect('/login');
}
