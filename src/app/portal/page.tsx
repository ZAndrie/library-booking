import { Metadata } from 'next';
import PortalGatewayView from '@/frontend/views/PortalGatewayView';

export const metadata: Metadata = {
  title: 'Operations Portal Gateway | Cor Jesu College LIRC',
  description: 'Select your operational counter desk: Discussion Rooms or Laptop Borrowing Services.',
};

export default function PortalPage() {
  return <PortalGatewayView />;
}
