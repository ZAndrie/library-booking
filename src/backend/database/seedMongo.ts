import User from '@/backend/models/User';
import Room from '@/backend/models/Room';
import Laptop from '@/backend/models/Laptop';
import { hashPassword } from '@/backend/auth/jwt';

let seeded = false;

export async function ensureInitialDataSeeded(): Promise<void> {
  if (seeded) return;

  try {
    // 1. Ensure at least one Super Admin exists
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const passwordHash = await hashPassword('Admin@1234');
      await User.create({
        name: 'Library Admin',
        email: 'admin@library.edu',
        employeeId: 'ADMIN',
        role: 'super_admin',
        passwordHash,
        isActive: true,
      });
      console.log('MongoDB Seed: Created default admin account (admin / Admin@1234)');
    }

    // 2. Ensure initial rooms exist
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      await Room.insertMany([
        {
          name: 'Conference Room',
          roomNumber: 'CR-101',
          capacity: 15,
          facilities: ['Projector', 'Large Whiteboard', 'Video Conference Audio', 'AC'],
          status: 'available',
          location: 'Third floor — large discussion hall',
          notes: 'Suited for presentations and larger group forums.',
        },
        {
          name: 'Discussion Room A',
          roomNumber: 'DR-A',
          capacity: 8,
          facilities: ['Whiteboard', 'HD Projector', 'Ergonomic Seating'],
          status: 'available',
          location: 'Ground floor — whiteboard & projector',
          notes: 'Collaborative group study.',
        },
        {
          name: 'Discussion Room B',
          roomNumber: 'DR-B',
          capacity: 6,
          facilities: ['4K Smart Display', 'Wireless Screen Casting', 'Whiteboard'],
          status: 'available',
          location: 'Second floor — quiet study wing',
          notes: 'Screen share and group assignments.',
        },
        {
          name: 'Discussion Room C',
          roomNumber: 'DR-C',
          capacity: 4,
          facilities: ['Whiteboard', 'Power Hub', 'High-Speed LAN'],
          status: 'available',
          location: 'Second floor — corner consultation booth',
          notes: 'Ideal for tutoring and 2-4 person meetings.',
        },
        {
          name: 'Discussion Room D',
          roomNumber: 'DR-D',
          capacity: 10,
          facilities: ['Smart Board', 'Conference Speakerphone', 'HDMI Hub'],
          status: 'available',
          location: 'Third floor — multimedia lab area',
          notes: 'Multimedia and presentation practice.',
        },
      ]);
      console.log('MongoDB Seed: Inserted 5 initial discussion rooms.');
    }

    // 3. Ensure initial laptop fleet exists
    const laptopCount = await Laptop.countDocuments();
    if (laptopCount === 0) {
      await Laptop.insertMany([
        {
          assetTag: 'LIB-LAP-001',
          serialNumber: 'SN-DELL-88219',
          brand: 'Dell',
          model: 'Latitude 5420',
          specs: 'Intel Core i5-1145G7, 16GB RAM, 512GB NVMe SSD, 14" FHD',
          status: 'available',
          condition: 'excellent',
          accessoriesIncluded: ['65W Type-C Charger', 'Padded Sleeve', 'Wireless Mouse'],
          location: 'Counter Desk Shelf A',
          notes: 'Freshly imaged with library software suite.',
        },
        {
          assetTag: 'LIB-LAP-002',
          serialNumber: 'SN-LEN-44102',
          brand: 'Lenovo',
          model: 'ThinkPad T14 Gen 2',
          specs: 'AMD Ryzen 5 PRO 5650U, 16GB RAM, 512GB SSD, 14" FHD Anti-Glare',
          status: 'available',
          condition: 'good',
          accessoriesIncluded: ['65W Slim Tip Charger', 'Padded Sleeve'],
          location: 'Counter Desk Shelf A',
          notes: 'Excellent battery health (94%).',
        },
        {
          assetTag: 'LIB-LAP-003',
          serialNumber: 'SN-HP-77190',
          brand: 'HP',
          model: 'EliteBook 840 G8',
          specs: 'Intel Core i7-1165G7, 16GB RAM, 512GB SSD, Sure View Display',
          status: 'available',
          condition: 'excellent',
          accessoriesIncluded: ['65W HP Fast Charger', 'Sleeve', 'Ethernet Adapter'],
          location: 'Counter Desk Shelf B',
          notes: 'Designated for faculty / senior research borrow.',
        },
        {
          assetTag: 'LIB-LAP-004',
          serialNumber: 'SN-MAC-33019',
          brand: 'Apple',
          model: 'MacBook Air M1',
          specs: 'Apple M1 Chip, 8-Core CPU, 8GB Unified Memory, 256GB SSD, Retina 13.3"',
          status: 'available',
          condition: 'excellent',
          accessoriesIncluded: ['30W USB-C Adapter', 'USB-C Cable', 'Hardshell Case'],
          location: 'Counter Desk Shelf B',
          notes: 'macOS Sonoma installed with Xcode & developer tools.',
        },
        {
          assetTag: 'LIB-LAP-005',
          serialNumber: 'SN-DELL-11928',
          brand: 'Dell',
          model: 'Inspiron 15 3520',
          specs: 'Intel Core i3-1215U, 8GB RAM, 256GB SSD, 15.6" 120Hz',
          status: 'available',
          condition: 'good',
          accessoriesIncluded: ['45W Barrel Charger', 'Basic Sleeve'],
          location: 'Counter Desk Shelf C',
          notes: 'Standard general-purpose loan device.',
        },
      ]);
      console.log('MongoDB Seed: Inserted 5 initial laptop fleet units.');
    }

    seeded = true;
  } catch (err) {
    console.warn('Initial data seeding notice:', err);
  }
}
