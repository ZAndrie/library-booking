import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/backend/database/db';
import User from '@/backend/models/User';
import RoomBooking from '@/backend/models/RoomBooking';
import LaptopLoan from '@/backend/models/LaptopLoan';
import Setting from '@/backend/models/Setting';
import { getCurrentUser, hashPassword } from '@/backend/auth/jwt';

/**
 * GET /api/admin/users
 * Returns list of all staff accounts (Admin & Super Admin only)
 */
export async function getStaffUsers() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Access denied: Administrator privileges required.' }, { status: 403 });
    }

    await connectToDatabase();
    const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch staff directory' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Updates role, isActive status, or resets password
 */
export async function updateStaffUser(id: string, req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Access denied: Administrator privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const { role, isActive, newPassword } = body;

    await connectToDatabase();
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // Role modification: Super Admin ONLY
    if (role && role !== targetUser.role) {
      if (currentUser.role !== 'super_admin') {
        return NextResponse.json({ error: 'Only Super Administrators can change user roles.' }, { status: 403 });
      }

      // Prevent demoting the last super_admin
      if (targetUser.role === 'super_admin' && role !== 'super_admin') {
        const superAdminCount = await User.countDocuments({ role: 'super_admin', isActive: true });
        if (superAdminCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot demote the only remaining active Super Administrator.' },
            { status: 400 }
          );
        }
      }

      targetUser.role = role;
    }

    // Deactivation / Activation: Super Admin ONLY
    if (typeof isActive === 'boolean' && isActive !== targetUser.isActive) {
      if (currentUser.role !== 'super_admin') {
        return NextResponse.json({ error: 'Only Super Administrators can activate or deactivate accounts.' }, { status: 403 });
      }

      if (currentUser.id === id && !isActive) {
        return NextResponse.json({ error: 'Cannot deactivate your own active session.' }, { status: 400 });
      }

      targetUser.isActive = isActive;
    }

    // Password Reset: Admin or Super Admin
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
      }
      targetUser.passwordHash = await hashPassword(newPassword);
    }

    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: 'Staff user updated successfully.',
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        employeeId: targetUser.employeeId,
        role: targetUser.role,
        isActive: targetUser.isActive,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Permanently deletes user account (Super Admin ONLY)
 */
export async function deleteStaffUser(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Only Super Administrators can permanently delete user accounts.' }, { status: 403 });
    }

    if (currentUser.id === id) {
      return NextResponse.json({ error: 'Cannot delete your own active administrator account.' }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User deleted permanently.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}

/**
 * GET /api/admin/audit
 * Returns chronological unified activity ledger of bookings, loans, condition audits
 */
export async function getAuditLogs(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Access denied: Administrator privileges required.' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get('limit') || 50), 200);

    const [roomBookings, laptopLoans] = await Promise.all([
      RoomBooking.find()
        .populate('roomId', 'name roomNumber location')
        .populate('bookedByStaffId', 'name employeeId')
        .sort({ createdAt: -1 })
        .limit(limit),
      LaptopLoan.find()
        .populate('laptopId', 'assetTag brand model condition')
        .populate('staffIssuerId', 'name employeeId')
        .populate('staffReceiverId', 'name employeeId')
        .sort({ createdAt: -1 })
        .limit(limit),
    ]);

    // Format into unified event objects
    const roomEvents = roomBookings.map((b: any) => ({
      id: b._id,
      category: 'Discussion Room',
      action: b.status === 'cancelled' ? 'Booking Cancelled' : b.status === 'completed' ? 'Session Concluded' : 'Room Reserved',
      target: b.roomId ? `${b.roomId.roomNumber} (${b.roomId.name})` : 'Room',
      borrower: `${b.borrowerName} (${b.borrowerId})`,
      attendees: b.attendeesCount,
      purpose: b.purpose,
      staff: b.bookedByStaffId ? `${b.bookedByStaffId.name} [${b.bookedByStaffId.employeeId}]` : 'Front Desk Staff',
      timestamp: b.createdAt,
      notes: b.notes || '',
      status: b.status,
    }));

    const laptopEvents = laptopLoans.map((l: any) => ({
      id: l._id,
      category: 'Laptop Circulation',
      action: l.status === 'returned' ? 'Device Returned & Audited' : l.status === 'overdue' ? 'Overdue Flagged' : 'Device Checked Out',
      target: l.laptopId ? `${l.laptopId.assetTag} - ${l.laptopId.brand} ${l.laptopId.model}` : 'Laptop Unit',
      borrower: `${l.borrowerName} (${l.borrowerId})`,
      attendees: 1,
      purpose: l.checkoutNotes || 'Circulation Loan',
      staff: l.status === 'returned' && l.staffReceiverId
        ? `Receiver: ${l.staffReceiverId.name}`
        : l.staffIssuerId
        ? `Issuer: ${l.staffIssuerId.name}`
        : 'Front Desk Staff',
      timestamp: l.status === 'returned' && l.returnedAt ? l.returnedAt : l.borrowedAt || l.createdAt,
      conditionGrade: l.returnCondition || l.laptopId?.condition || 'good',
      notes: l.returnNotes || l.checkoutNotes || '',
      status: l.status,
    }));

    // Merge and sort newest first
    const unifiedLogs = [...roomEvents, ...laptopEvents].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ success: true, logs: unifiedLogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch audit logs' }, { status: 500 });
  }
}

/**
 * GET /api/admin/settings
 * Fetch institutional policies
 */
export async function getSystemSettings() {
  try {
    await connectToDatabase();
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({
        minRoomCapacity: 3,
        maxRoomCapacity: 15,
        maxSlotDurationHours: 2,
        operatingHoursStart: '08:00',
        operatingHoursEnd: '17:00',
        overdueGraceMinutes: 15,
      });
    }
    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/settings
 * Update institutional policies (Super Admin ONLY)
 */
export async function updateSystemSettings(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Only Super Administrators can configure desk policies.' }, { status: 403 });
    }

    const body = await req.json();
    await connectToDatabase();

    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting();
    }

    if (body.minRoomCapacity !== undefined) setting.minRoomCapacity = Number(body.minRoomCapacity);
    if (body.maxRoomCapacity !== undefined) setting.maxRoomCapacity = Number(body.maxRoomCapacity);
    if (body.maxSlotDurationHours !== undefined) setting.maxSlotDurationHours = Number(body.maxSlotDurationHours);
    if (body.operatingHoursStart) setting.operatingHoursStart = body.operatingHoursStart.trim();
    if (body.operatingHoursEnd) setting.operatingHoursEnd = body.operatingHoursEnd.trim();
    if (body.overdueGraceMinutes !== undefined) setting.overdueGraceMinutes = Number(body.overdueGraceMinutes);

    setting.updatedByStaffId = currentUser.id as any;
    await setting.save();

    return NextResponse.json({ success: true, message: 'Settings updated successfully.', setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
