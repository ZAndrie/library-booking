import AppShell from '@/frontend/components/AppShell';

export default function DeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
