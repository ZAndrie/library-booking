import fs from 'fs';
import path from 'path';
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

interface DevDbData {
  users: DevUser[];
}

function readDevDb(): DevDbData {
  try {
    if (!fs.existsSync(DEV_DB_PATH)) {
      const initial: DevDbData = { users: [] };
      fs.writeFileSync(DEV_DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DEV_DB_PATH, 'utf-8');
    return JSON.parse(content) as DevDbData;
  } catch {
    return { users: [] };
  }
}

function writeDevDb(data: DevDbData): void {
  try {
    fs.writeFileSync(DEV_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to dev store:', err);
  }
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
