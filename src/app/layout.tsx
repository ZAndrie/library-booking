import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cor Jesu College | Library Booking System',
  description: 'Cor Jesu College Library Staff & Admin Portal for Discussion Room Bookings and Laptop Fleet Borrowing Management',
  icons: {
    icon: '/cjc-logo.png',
    apple: '/cjc-logo.png',
  },
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
