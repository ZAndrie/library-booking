import { NextResponse } from 'next/server';
import connectToDatabase from '@/backend/database/db';
import Room from '@/backend/models/Room';
import RoomBooking from '@/backend/models/RoomBooking';
import Laptop from '@/backend/models/Laptop';
import LaptopLoan from '@/backend/models/LaptopLoan';

export async function getDashboardStats() {
  try {
    await connectToDatabase();
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'available' });
    const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });

    const currentlyOccupiedRooms = await RoomBooking.countDocuments({
      status: 'active',
      startTime: { $lte: now },
      endTime: { $gte: now },
    });

    const todayBookingsCount = await RoomBooking.countDocuments({
      startTime: { $gte: startOfDay, $lte: endOfDay },
    });

    const totalLaptops = await Laptop.countDocuments();
    const availableLaptops = await Laptop.countDocuments({ status: 'available' });
    const borrowedLaptops = await Laptop.countDocuments({ status: 'borrowed' });
    const maintenanceLaptops = await Laptop.countDocuments({ status: 'under_maintenance' });

    const overdueLoansCount = await LaptopLoan.countDocuments({
      status: 'active',
      dueAt: { $lt: now },
    });

    const recentRoomBookings = await RoomBooking.find()
      .populate('roomId', 'name roomNumber')
      .populate('bookedByStaffId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

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
    console.warn('Dashboard notice: MongoDB offline, returning default stats payload');
    return NextResponse.json({
      success: true,
      stats: {
        rooms: { total: 0, available: 0, maintenance: 0, currentlyOccupied: 0, todayTotal: 0 },
        laptops: { total: 0, available: 0, borrowed: 0, maintenance: 0, overdue: 0 },
      },
      recentRoomBookings: [],
      recentLaptopLoans: [],
      isDatabaseOffline: true,
    });
  }
}
