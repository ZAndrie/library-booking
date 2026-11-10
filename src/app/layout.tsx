import type { Metadata } from 'next';
import '@/frontend/styles/globals.css';

export const metadata: Metadata = {
  title: 'Library Operations Hub | Rooms & Laptop Management',
  description: 'Internal Admin & Staff portal for Discussion Room Bookings and Laptop Borrowing Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
