import { NextResponse } from 'next/server';
import connectToDatabase from '@/backend/database/db';
import Room from '@/backend/models/Room';
import RoomBooking from '@/backend/models/RoomBooking';
import Laptop from '@/backend/models/Laptop';
import LaptopLoan from '@/backend/models/LaptopLoan';
import '@/backend/models/User';
import { getCurrentUser } from '@/backend/auth/jwt';
import { getEffectiveSystemSettings } from '@/backend/models/Setting';
import { getManilaDayBounds } from '@/lib/policyUtils';

export async function getDashboardStats() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied: Operations Dashboard is restricted to Administrators and Super Administrators.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const now = new Date();
    const { startOfDay, endOfDay } = getManilaDayBounds();

    const [
      roomStatuses,
      currentlyOccupiedRooms,
      todayBookingsCount,
      laptopStatuses,
      settings,
      activeLoanDueDates,
      recentRoomBookings,
      recentLaptopLoans,
    ] = await Promise.all([
      Room.find().select('status').lean(),
      RoomBooking.countDocuments({
        status: 'active',
        startTime: { $lte: now },
        endTime: { $gte: now },
      }),
      RoomBooking.countDocuments({
        startTime: { $gte: startOfDay, $lte: endOfDay },
      }),
      Laptop.find().select('status').lean(),
      getEffectiveSystemSettings(),
      LaptopLoan.find({ status: 'active' }).select('dueAt').lean(),
      RoomBooking.find()
        .populate('roomId', 'name roomNumber')
        .populate('bookedByStaffId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      LaptopLoan.find()
        .populate('laptopId', 'assetTag brand model')
        .populate('staffIssuerId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const totalRooms = roomStatuses.length;
    const availableRooms = roomStatuses.filter((r: any) => r.status === 'available').length;
    const maintenanceRooms = roomStatuses.filter((r: any) => r.status === 'maintenance').length;

    const totalLaptops = laptopStatuses.length;
    const availableLaptops = laptopStatuses.filter((l: any) => l.status === 'available').length;
    const borrowedLaptops = laptopStatuses.filter((l: any) => l.status === 'borrowed').length;
    const maintenanceLaptops = laptopStatuses.filter((l: any) => l.status === 'under_maintenance').length;

    const graceCutoffMs = now.getTime() - (settings.overdueGraceMinutes ?? 0) * 60 * 1000;
    const overdueLoansCount = activeLoanDueDates.filter(
      (loan: any) => new Date(loan.dueAt).getTime() < graceCutoffMs
    ).length;

    return NextResponse.json({
      success: true,
      stats: {
        rooms: {
          total: totalRooms,
          available: availableRooms,
          maintenance: maintenanceRooms,
          currentlyOccupied: currentlyOccupiedRooms,
          todayTotal: todayBookingsCount,
        },
        laptops: {
          total: totalLaptops,
          available: availableLaptops,
          borrowed: borrowedLaptops,
          maintenance: maintenanceLaptops,
          overdue: overdueLoansCount,
        },
      },
      recentRoomBookings,
      recentLaptopLoans,
    });
  } catch (error: any) {
    console.error('getDashboardStats error:', error);
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: error.message || 'Failed to load dashboard stats' },
        { status: 500 }
      );
    }
    console.warn('Dashboard notice: MongoDB offline, returning dev store stats');
    const { getDevStats, getDevBookings, getDevLoans } = await import('@/backend/database/devStore');
    const devStats = getDevStats();
    return NextResponse.json({
      success: true,
      stats: devStats,
      recentRoomBookings: getDevBookings().slice(0, 5),
      recentLaptopLoans: getDevLoans().slice(0, 5),
      isDatabaseOffline: true,
    });
  }
}
