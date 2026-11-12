import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Library Booking System | Admin & Staff Desk',
  description: 'Admin & Staff portal for Discussion Room Bookings and Laptop Borrowing Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}
