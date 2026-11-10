import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library-booking';

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected successfully.');

  const db = mongoose.connection.db;

  // Clear existing collections if desired
  console.log('Clearing old collections for clean seed...');
  await db.collection('users').deleteMany({});
  await db.collection('rooms').deleteMany({});
  await db.collection('roombookings').deleteMany({});
  await db.collection('laptops').deleteMany({});
  await db.collection('laptoploans').deleteMany({});

  console.log('Seeding Staff & Admin Users...');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const staffPasswordHash = await bcrypt.hash('staff123', salt);

  const adminResult = await db.collection('users').insertOne({
    name: 'Chief Librarian (Admin)',
    email: 'admin@library.edu',
    employeeId: 'ADM-001',
    role: 'admin',
    passwordHash: adminPasswordHash,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const staffResult = await db.collection('users').insertOne({
    name: 'Counter Desk Staff',
    email: 'staff@library.edu',
    employeeId: 'STF-102',
    role: 'staff',
    passwordHash: staffPasswordHash,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Seeding Discussion Rooms...');
  const rooms = [
    {
      name: 'Discussion Room A',
      roomNumber: 'DR-101',
      capacity: 4,
      facilities: ['Whiteboard', 'Power Outlets', 'Ergonomic Chairs'],
      status: 'available',
      location: 'Level 1, North Wing',
      notes: 'Compact room ideal for 2-4 students.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Discussion Room B (Multimedia)',
      roomNumber: 'DR-102',
      capacity: 6,
      facilities: ['55" 4K Smart TV', 'HDMI & AirPlay', 'Whiteboard', 'Air Conditioning'],
      status: 'available',
      location: 'Level 1, North Wing',
      notes: 'Equipped with presentation screen.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Conference Suite C',
      roomNumber: 'DR-201',
      capacity: 10,
      facilities: ['HD Video Projector', 'Conference Speakerphone', 'Magnetic Glass Whiteboard'],
      status: 'available',
      location: 'Level 2, Executive Corner',
      notes: 'Suited for large group presentations and faculty meetings.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Quiet Study Pod D',
      roomNumber: 'DR-202',
      capacity: 2,
      facilities: ['Soundproof Acoustic Panels', 'Whiteboard', 'Adjustable Desk'],
      status: 'available',
      location: 'Level 2, East Quiet Zone',
      notes: 'Dual seat focus pod.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const roomInsertRes = await db.collection('rooms').insertMany(rooms);
  const roomAId = roomInsertRes.insertedIds[0];
  const roomBId = roomInsertRes.insertedIds[1];

  console.log('Seeding Sample Room Bookings...');
  const now = new Date();
  const today10AM = new Date(now);
  today10AM.setHours(10, 0, 0, 0);
  const today12PM = new Date(now);
  today12PM.setHours(12, 0, 0, 0);

  const today2PM = new Date(now);
  today2PM.setHours(14, 0, 0, 0);
  const today4PM = new Date(now);
  today4PM.setHours(16, 0, 0, 0);

  await db.collection('roombookings').insertMany([
    {
      roomId: roomAId,
      borrowerName: 'Sarah Jenkins',
      borrowerId: 'STU-9921',
      borrowerEmail: 's.jenkins@student.edu',
      borrowerContact: '+1 555-0192',
      startTime: today10AM,
      endTime: today12PM,
      purpose: 'Software Engineering Group Project Discussion',
      attendeesCount: 4,
      status: 'active',
      bookedByStaffId: staffResult.insertedId,
      notes: 'Needs whiteboard markers.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      roomId: roomBId,
      borrowerName: 'Marcus Wong',
      borrowerId: 'STU-4810',
      borrowerEmail: 'm.wong@student.edu',
      borrowerContact: '+1 555-0842',
      startTime: today2PM,
      endTime: today4PM,
      purpose: 'Design Pitch Rehearsal with TV Display',
      attendeesCount: 5,
      status: 'active',
      bookedByStaffId: adminResult.insertedId,
      notes: 'Borrowing HDMI adapter from counter.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('Seeding Laptop Inventory...');
  const laptops = [
    {
      assetTag: 'LAP-001',
      serialNumber: 'LNV-882910-X1',
      brand: 'Lenovo',
      model: 'ThinkPad E14 Gen 4',
      specs: 'AMD Ryzen 5 5625U, 16GB RAM, 512GB SSD, 14" FHD',
      status: 'borrowed',
      condition: 'excellent',
      accessoriesIncluded: ['65W USB-C Charger', 'Padded Sleeve', 'Wireless Mouse'],
      location: 'Counter Desk Cabinet A',
      notes: 'Battery health 98%',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      assetTag: 'LAP-002',
      serialNumber: 'LNV-882911-X2',
      brand: 'Lenovo',
      model: 'ThinkPad E14 Gen 4',
      specs: 'AMD Ryzen 5 5625U, 16GB RAM, 512GB SSD, 14" FHD',
      status: 'available',
      condition: 'excellent',
      accessoriesIncluded: ['65W USB-C Charger', 'Padded Sleeve'],
      location: 'Counter Desk Cabinet A',
      notes: 'Ready for loan',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      assetTag: 'LAP-003',
      serialNumber: 'DELL-5430-019',
      brand: 'Dell',
      model: 'Latitude 5430',
      specs: 'Intel Core i5-1245U, 16GB RAM, 256GB NVMe SSD, 14" FHD',
      status: 'available',
      condition: 'good',
      accessoriesIncluded: ['65W Barrel Charger', 'Padded Sleeve'],
      location: 'Counter Desk Cabinet B',
      notes: 'Minor scratch on lid',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      assetTag: 'LAP-004',
      serialNumber: 'APL-M2-99014',
      brand: 'Apple',
      model: 'MacBook Air M2',
      specs: 'Apple M2 8-core, 8GB Unified RAM, 256GB SSD, 13.6" Liquid Retina',
      status: 'available',
      condition: 'excellent',
      accessoriesIncluded: ['30W USB-C Power Adapter', 'MagSafe Cable', 'Protective Hardshell'],
      location: 'Secure Safe Locker 1',
      notes: 'Reserved for multimedia & coding students',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      assetTag: 'LAP-005',
      serialNumber: 'HP-PB450-441',
      brand: 'HP',
      model: 'ProBook 450 G9',
      specs: 'Intel Core i5-1235U, 8GB RAM, 512GB SSD, 15.6" FHD',
      status: 'under_maintenance',
      condition: 'fair',
      accessoriesIncluded: ['45W Smart AC Adapter'],
      location: 'IT Repair Bay',
      notes: 'Keypad spacebar sticky, awaiting replacement keys',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const laptopInsertRes = await db.collection('laptops').insertMany(laptops);
  const laptop1Id = laptopInsertRes.insertedIds[0];

  console.log('Seeding Sample Laptop Loan for LAP-001...');
  const loanStart = new Date(now);
  loanStart.setHours(loanStart.getHours() - 3);
  const loanDue = new Date(now);
  loanDue.setHours(loanDue.getHours() + 1); // due in 1 hour

  await db.collection('laptoploans').insertOne({
    laptopId: laptop1Id,
    borrowerName: 'Alex Rivera',
    borrowerId: 'STU-1092',
    borrowerEmail: 'a.rivera@student.edu',
    borrowerContact: '+1 555-7721',
    borrowedAt: loanStart,
    dueAt: loanDue,
    status: 'active',
    staffIssuerId: staffResult.insertedId,
    checkoutAccessories: ['65W USB-C Charger', 'Padded Sleeve'],
    checkoutNotes: 'Borrower requested mouse separately.',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Seeding complete!');
  console.log('\nDefault Test Accounts:');
  console.log('-------------------------------------------');
  console.log('ADMIN: Email: admin@library.edu  | Password: admin123');
  console.log('STAFF: Email: staff@library.edu  | Password: staff123');
  console.log('-------------------------------------------');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
