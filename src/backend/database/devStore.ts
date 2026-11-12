import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/backend/models/User';

const DEV_DB_PATH = path.join(process.cwd(), '.dev_db.json');

export interface DevUser {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: UserRole;
  passwordHash: string;
  isActive: boolean;
  createdAt: string;
}

export interface DevRoom {
  _id: string;
  name: string;
  roomNumber: string;
  capacity: number;
  facilities: string[];
  status: 'available' | 'maintenance' | 'closed';
  location: string;
  notes?: string;
  todayBookingsCount?: number;
  createdAt: string;
}

export interface DevBooking {
  _id: string;
  roomId: string | DevRoom;
  borrowerName: string;
  borrowerId: string;
  borrowerEmail?: string;
  borrowerContact?: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendeesCount: number;
  status: 'active' | 'completed' | 'cancelled' | 'no_show';
  bookedByStaffId?: { name: string; employeeId: string };
  notes?: string;
  createdAt: string;
}

export interface DevLaptop {
  _id: string;
  assetTag: string;
  serialNumber: string;
  brand: string;
  model: string;
  specs: string;
  status: 'available' | 'borrowed' | 'under_maintenance' | 'decommissioned';
  condition: 'excellent' | 'good' | 'fair' | 'damaged';
  accessoriesIncluded: string[];
  location: string;
  notes?: string;
  createdAt: string;
}

export interface DevLoan {
  _id: string;
  laptopId: string | DevLaptop;
  borrowerName: string;
  borrowerId: string;
  borrowerEmail?: string;
  borrowerContact?: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt?: string;
  status: 'active' | 'returned' | 'overdue' | 'lost';
  isOverdue?: boolean;
  staffIssuerId?: { name: string; employeeId: string };
  checkoutAccessories: string[];
  checkoutNotes?: string;
  returnCondition?: string;
  returnNotes?: string;
  createdAt: string;
}

interface DevDbData {
  users: DevUser[];
  rooms: DevRoom[];
  bookings: DevBooking[];
  laptops: DevLaptop[];
  loans: DevLoan[];
}

function getInitialDevDb(): DevDbData {
  const salt = bcrypt.genSaltSync(10);
  const defaultAdminHash = bcrypt.hashSync('Admin@1234', salt);

  const rooms: DevRoom[] = [
    {
      _id: 'room_1',
      name: 'Conference Room',
      roomNumber: 'CR-101',
      capacity: 15,
      facilities: ['Projector', 'Large Whiteboard', 'Video Conference Audio', 'AC'],
      status: 'available',
      location: 'Third floor — large discussion hall',
      notes: 'Suited for presentations and larger group forums.',
      todayBookingsCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'room_2',
      name: 'Discussion Room A',
      roomNumber: 'DR-A',
      capacity: 8,
      facilities: ['Whiteboard', 'HD Projector', 'Ergonomic Seating'],
      status: 'available',
      location: 'Ground floor — whiteboard & projector',
      notes: 'Collaborative group study.',
      todayBookingsCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'room_3',
      name: 'Discussion Room B',
      roomNumber: 'DR-B',
      capacity: 6,
      facilities: ['55" 4K Smart TV', 'HDMI Connectors', 'Glass Whiteboard'],
      status: 'available',
      location: 'Second floor — quiet study pod',
      notes: 'Equipped with digital presentation screen.',
      todayBookingsCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'room_4',
      name: 'Study Cubicle 1',
      roomNumber: 'SC-01',
      capacity: 4,
      facilities: ['Power Outlets', 'Acoustic Soundproofing', 'Mini Whiteboard'],
      status: 'available',
      location: 'Individual / pair quiet work',
      notes: 'Silent study zone.',
      todayBookingsCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'room_5',
      name: 'Study Cubicle 2',
      roomNumber: 'SC-02',
      capacity: 4,
      facilities: ['Power Outlets', 'Soundproofing Panels'],
      status: 'available',
      location: 'Second floor — east quiet wing',
      notes: 'Individual / small group quiet work.',
      todayBookingsCount: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  const laptops: DevLaptop[] = [
    {
      _id: 'lap_1',
      assetTag: 'LAP-001',
      serialNumber: 'SN-LNV-9901',
      brand: 'Lenovo',
      model: 'ThinkPad E14 Gen 4',
      specs: 'AMD Ryzen 5, 16GB RAM, 512GB SSD, 14" FHD',
      status: 'available',
      condition: 'excellent',
      accessoriesIncluded: ['65W USB-C Charger', 'Padded Sleeve'],
      location: 'Front Desk Shelf A',
      notes: 'Battery health 99%',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'lap_2',
      assetTag: 'LAP-002',
      serialNumber: 'SN-DEL-4412',
      brand: 'Dell',
      model: 'Latitude 5430',
      specs: 'Intel Core i5-1245U, 16GB RAM, 256GB SSD',
      status: 'available',
      condition: 'excellent',
      accessoriesIncluded: ['65W Barrel Charger', 'Padded Sleeve'],
      location: 'Front Desk Shelf A',
      notes: 'Ready for loan',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'lap_3',
      assetTag: 'LAP-003',
      serialNumber: 'SN-APL-8821',
      brand: 'Apple',
      model: 'MacBook Air M2',
      specs: 'Apple M2, 8GB RAM, 256GB SSD, 13.6" Liquid Retina',
      status: 'available',
      condition: 'excellent',
      accessoriesIncluded: ['MagSafe 3 Cable', '30W Adapter', 'Protective Case'],
      location: 'Secure Locker 1',
      notes: 'Multimedia loan equipment',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'lap_4',
      assetTag: 'LAP-004',
      serialNumber: 'SN-HP-1029',
      brand: 'HP',
      model: 'ProBook 450 G9',
      specs: 'Intel Core i5, 8GB RAM, 512GB SSD',
      status: 'available',
      condition: 'good',
      accessoriesIncluded: ['45W Smart AC Adapter'],
      location: 'Front Desk Shelf B',
      notes: 'Minor lid scratches',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'lap_5',
      assetTag: 'LAP-005',
      serialNumber: 'SN-ASUS-3310',
      brand: 'ASUS',
      model: 'ExpertBook B1',
      specs: 'Intel Core i5, 8GB RAM, 256GB SSD',
      status: 'under_maintenance',
      condition: 'fair',
      accessoriesIncluded: ['Charger'],
      location: 'IT Repair Bay',
      notes: 'Keyboard spacebar repair pending',
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    users: [
      {
        id: 'dev_default_admin',
        name: 'Library Admin',
        email: 'admin@library.edu',
        employeeId: 'admin',
        role: 'super_admin',
        passwordHash: defaultAdminHash,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ],
    rooms,
    bookings: [],
    laptops,
    loans: [],
  };
}

function readDevDb(): DevDbData {
  try {
    if (!fs.existsSync(DEV_DB_PATH)) {
      const initial = getInitialDevDb();
      fs.writeFileSync(DEV_DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DEV_DB_PATH, 'utf-8');
    const parsed = JSON.parse(content) as DevDbData;
    if (!parsed.users || parsed.users.length === 0 || !parsed.rooms) {
      const initial = getInitialDevDb();
      fs.writeFileSync(DEV_DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    return parsed;
  } catch {
    return getInitialDevDb();
  }
}

function writeDevDb(data: DevDbData): void {
  try {
    fs.writeFileSync(DEV_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to dev store:', err);
  }
}

// User operations
export function findDevUserByIdentifier(identifier: string): DevUser | null {
  const db = readDevDb();
  const cleaned = identifier.trim().toLowerCase();
  return (
    db.users.find(
      (u) =>
        u.email.toLowerCase() === cleaned ||
        u.employeeId.toLowerCase() === cleaned ||
        u.name.toLowerCase() === cleaned
    ) || null
  );
}

export function findDevUserByEmail(email: string): DevUser | null {
  const db = readDevDb();
  return (
    db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null
  );
}

export function findDevUserByEmployeeId(empId: string): DevUser | null {
  const db = readDevDb();
  return (
    db.users.find(
      (u) => u.employeeId.toUpperCase() === empId.toUpperCase().trim()
    ) || null
  );
}

export function createDevUser(data: {
  name: string;
  email: string;
  employeeId: string;
  role: UserRole;
  passwordHash: string;
}): DevUser {
  const db = readDevDb();
  const newUser: DevUser = {
    id: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    employeeId: data.employeeId.toUpperCase().trim(),
    role: data.role,
    passwordHash: data.passwordHash,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDevDb(db);
  return newUser;
}

// Room operations
export function getDevRooms(): DevRoom[] {
  const db = readDevDb();
  return db.rooms || [];
}

export function createDevRoom(data: Omit<DevRoom, '_id' | 'createdAt'>): DevRoom {
  const db = readDevDb();
  const newRoom: DevRoom = {
    ...data,
    _id: `room_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.rooms = db.rooms || [];
  db.rooms.push(newRoom);
  writeDevDb(db);
  return newRoom;
}

export function updateDevRoom(id: string, updates: Partial<DevRoom>): DevRoom | null {
  const db = readDevDb();
  const index = (db.rooms || []).findIndex((r) => r._id === id);
  if (index === -1) return null;
  db.rooms[index] = { ...db.rooms[index], ...updates };
  writeDevDb(db);
  return db.rooms[index];
}

export function deleteDevRoom(id: string): boolean {
  const db = readDevDb();
  const initialLength = (db.rooms || []).length;
  db.rooms = (db.rooms || []).filter((r) => r._id !== id);
  writeDevDb(db);
  return db.rooms.length < initialLength;
}

// Room Bookings operations
export function getDevBookings(): DevBooking[] {
  const db = readDevDb();
  const rooms = db.rooms || [];
  return (db.bookings || []).map((b) => {
    const roomObj = typeof b.roomId === 'string' ? rooms.find((r) => r._id === b.roomId) : b.roomId;
    return {
      ...b,
      roomId: roomObj || b.roomId,
    };
  });
}

export function createDevBooking(data: Omit<DevBooking, '_id' | 'createdAt'>): DevBooking {
  const db = readDevDb();
  const newBooking: DevBooking = {
    ...data,
    _id: `booking_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.bookings = db.bookings || [];
  db.bookings.push(newBooking);
  writeDevDb(db);
  return newBooking;
}

export function updateDevBooking(id: string, updates: Partial<DevBooking>): DevBooking | null {
  const db = readDevDb();
  const index = (db.bookings || []).findIndex((b) => b._id === id);
  if (index === -1) return null;
  db.bookings[index] = { ...db.bookings[index], ...updates };
  writeDevDb(db);
  return db.bookings[index];
}

// Laptop operations
export function getDevLaptops(): DevLaptop[] {
  const db = readDevDb();
  return db.laptops || [];
}

export function createDevLaptop(data: Omit<DevLaptop, '_id' | 'createdAt'>): DevLaptop {
  const db = readDevDb();
  const newLaptop: DevLaptop = {
    ...data,
    _id: `laptop_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.laptops = db.laptops || [];
  db.laptops.push(newLaptop);
  writeDevDb(db);
  return newLaptop;
}

export function updateDevLaptop(id: string, updates: Partial<DevLaptop>): DevLaptop | null {
  const db = readDevDb();
  const index = (db.laptops || []).findIndex((l) => l._id === id);
  if (index === -1) return null;
  db.laptops[index] = { ...db.laptops[index], ...updates };
  writeDevDb(db);
  return db.laptops[index];
}

export function deleteDevLaptop(id: string): boolean {
  const db = readDevDb();
  const initialLength = (db.laptops || []).length;
  db.laptops = (db.laptops || []).filter((l) => l._id !== id);
  writeDevDb(db);
  return db.laptops.length < initialLength;
}

// Laptop Loans operations
export function getDevLoans(status?: string, borrowerId?: string, laptopId?: string): DevLoan[] {
  const db = readDevDb();
  const laptops = db.laptops || [];
  const now = new Date();
  let list = db.loans || [];

  if (status === 'overdue') {
    list = list.filter((l) => l.status === 'active' && new Date(l.dueAt) < now);
  } else if (status && status !== 'all') {
    list = list.filter((l) => l.status === status);
  }

  if (borrowerId) {
    const bId = borrowerId.toLowerCase().trim();
    list = list.filter((l) => l.borrowerId.toLowerCase().includes(bId));
  }

  if (laptopId) {
    list = list.filter((l) => {
      const id = typeof l.laptopId === 'string' ? l.laptopId : (l.laptopId as DevLaptop)._id;
      return id === laptopId;
    });
  }

  return list.map((l) => {
    const lapObj = typeof l.laptopId === 'string' ? laptops.find((lp) => lp._id === l.laptopId) : l.laptopId;
    const isOverdue = l.status === 'active' && new Date(l.dueAt) < now;
    return {
      ...l,
      laptopId: lapObj || l.laptopId,
      isOverdue,
    };
  });
}

export function createDevLoan(data: Omit<DevLoan, '_id' | 'createdAt'>): DevLoan {
  const db = readDevDb();
  const newLoan: DevLoan = {
    ...data,
    _id: `loan_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.loans = db.loans || [];
  db.loans.push(newLoan);

  // Update laptop status to borrowed
  const lapIndex = (db.laptops || []).findIndex((lp) => lp._id === data.laptopId);
  if (lapIndex !== -1) {
    db.laptops[lapIndex].status = 'borrowed';
  }

  writeDevDb(db);
  return newLoan;
}

export function returnDevLoan(id: string, returnCondition: string, returnNotes?: string): DevLoan | null {
  const db = readDevDb();
  const index = (db.loans || []).findIndex((l) => l._id === id);
  if (index === -1) return null;

  db.loans[index].status = 'returned';
  db.loans[index].returnedAt = new Date().toISOString();
  db.loans[index].returnCondition = returnCondition;
  db.loans[index].returnNotes = returnNotes || '';

  const lapId = typeof db.loans[index].laptopId === 'string'
    ? db.loans[index].laptopId
    : (db.loans[index].laptopId as DevLaptop)._id;

  const lapIndex = (db.laptops || []).findIndex((lp) => lp._id === lapId);
  if (lapIndex !== -1) {
    db.laptops[lapIndex].condition = returnCondition as any;
    db.laptops[lapIndex].status = returnCondition === 'damaged' ? 'under_maintenance' : 'available';
  }

  writeDevDb(db);
  return db.loans[index];
}

// Combined Stats for Dashboard
export function getDevStats() {
  const db = readDevDb();
  const rooms = db.rooms || [];
  const laptops = db.laptops || [];
  const bookings = db.bookings || [];
  const loans = db.loans || [];
  const now = new Date();

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;
  const currentlyOccupiedRooms = bookings.filter(
    (b) => b.status === 'active' && new Date(b.startTime) <= now && new Date(b.endTime) >= now
  ).length;

  const totalLaptops = laptops.length;
  const availableLaptops = laptops.filter((l) => l.status === 'available').length;
  const borrowedLaptops = laptops.filter((l) => l.status === 'borrowed').length;
  const maintenanceLaptops = laptops.filter((l) => l.status === 'under_maintenance').length;
  const overdueLoans = loans.filter((l) => l.status === 'active' && new Date(l.dueAt) < now).length;

  return {
    rooms: {
      total: totalRooms,
      available: availableRooms,
      maintenance: maintenanceRooms,
      currentlyOccupied: currentlyOccupiedRooms,
      todayTotal: bookings.length,
      pending: 0,
      approved: bookings.filter((b) => b.status === 'active' || b.status === 'completed').length,
    },
    laptops: {
      total: totalLaptops,
      available: availableLaptops,
      borrowed: borrowedLaptops,
      maintenance: maintenanceLaptops,
      overdue: overdueLoans,
    },
  };
}
