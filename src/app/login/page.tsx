import { Suspense } from 'react';
import LoginView from '@/frontend/views/LoginView';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#8B1515]" />}>
      <LoginView />
    </Suspense>
  );
}
