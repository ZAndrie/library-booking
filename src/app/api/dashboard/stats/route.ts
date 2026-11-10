import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Room from '@/models/Room';
import RoomBooking from '@/models/RoomBooking';
import Laptop from '@/models/Laptop';
import LaptopLoan from '@/models/LaptopLoan';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Discussion Rooms Metrics
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'available' });
    const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });

    // Active room bookings right now
    const currentlyOccupiedRooms = await RoomBooking.countDocuments({
      status: 'active',
      startTime: { $lte: now },
      endTime: { $gte: now },
    });

    const todayBookingsCount = await RoomBooking.countDocuments({
      startTime: { $gte: startOfDay, $lte: endOfDay },
    });

    // Laptop Inventory Metrics
    const totalLaptops = await Laptop.countDocuments();
    const availableLaptops = await Laptop.countDocuments({ status: 'available' });
    const borrowedLaptops = await Laptop.countDocuments({ status: 'borrowed' });
    const maintenanceLaptops = await Laptop.countDocuments({ status: 'under_maintenance' });

    // Overdue loans: active loans where dueAt < now
    const overdueLoansCount = await LaptopLoan.countDocuments({
      status: 'active',
      dueAt: { $lt: now },
    });

    // Recent Room Bookings
    const recentRoomBookings = await RoomBooking.find()
      .populate('roomId', 'name roomNumber')
      .populate('bookedByStaffId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent Laptop Loans
    const recentLaptopLoans = await LaptopLoan.find()
      .populate('laptopId', 'assetTag brand model')
      .populate('staffIssuerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

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
    console.error('Fetch dashboard stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
