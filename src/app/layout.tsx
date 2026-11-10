import type { Metadata } from 'next';
import './globals.css';

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
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
