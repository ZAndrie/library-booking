import { NextResponse } from 'next/server';
import connectToDatabase from '@/backend/database/db';
import Room from '@/backend/models/Room';
import RoomBooking from '@/backend/models/RoomBooking';
import Laptop from '@/backend/models/Laptop';
import { ensureInitialDataSeeded } from '@/backend/database/seedMongo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();
    await ensureInitialDataSeeded();

    const now = new Date();

    // Query all rooms
    const rooms = await Room.find().sort({ roomNumber: 1 }).lean();

    // Query active bookings right now
    const activeBookings = await RoomBooking.find({
      status: 'active',
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).lean();

    const activeRoomIdSet = new Set(
      activeBookings.map((b: any) => b.roomId?.toString())
    );

    const mappedRooms = rooms.map((room: any) => {
      const isOccupied = activeRoomIdSet.has(room._id.toString());
      const isUnderMaintenance = room.status === 'maintenance';
      const isClosed = room.status === 'closed';

      let availabilityState: 'available' | 'occupied' | 'maintenance' | 'closed' = 'available';
      let statusLabel = 'Available for Booking';
      let isAvailable = true;

      if (isUnderMaintenance) {
        availabilityState = 'maintenance';
        statusLabel = 'Under Maintenance';
        isAvailable = false;
      } else if (isClosed) {
        availabilityState = 'closed';
        statusLabel = 'Temporarily Closed';
        isAvailable = false;
      } else if (isOccupied) {
        availabilityState = 'occupied';
        statusLabel = 'Occupied / In Session';
        isAvailable = false;
      }

      return {
        _id: room._id.toString(),
        name: room.name,
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        facilities: ['Table and Chairs'], // Strictly table and chairs as required
        location: room.location,
        notes: room.notes || '',
        status: room.status,
        isAvailable,
        availabilityState,
        statusLabel,
      };
    });

    // Query all laptops
    const laptops = await Laptop.find().sort({ assetTag: 1 }).lean();

    const mappedLaptops = laptops.map((laptop: any) => {
      const isAvailable = laptop.status === 'available';
      let statusLabel = 'Available on Shelf';
      if (laptop.status === 'borrowed') {
        statusLabel = 'Currently Borrowed';
      } else if (laptop.status === 'under_maintenance') {
        statusLabel = 'Under Maintenance';
      } else if (laptop.status === 'decommissioned') {
        statusLabel = 'Decommissioned';
      }

      return {
        _id: laptop._id.toString(),
        assetTag: laptop.assetTag,
        brand: laptop.brand,
        model: laptop.model,
        specs: laptop.specs,
        condition: laptop.condition,
        status: laptop.status,
        isAvailable,
        statusLabel,
        location: laptop.location,
        accessoriesIncluded: laptop.accessoriesIncluded || [],
      };
    });

    const counts = {
      totalRooms: mappedRooms.length,
      availableRooms: mappedRooms.filter((r) => r.isAvailable).length,
      occupiedRooms: mappedRooms.filter((r) => r.availabilityState === 'occupied').length,
      maintenanceRooms: mappedRooms.filter((r) => r.availabilityState === 'maintenance').length,
      totalLaptops: mappedLaptops.length,
      availableLaptops: mappedLaptops.filter((l) => l.isAvailable).length,
      borrowedLaptops: mappedLaptops.filter((l) => l.status === 'borrowed').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        rooms: mappedRooms,
        laptops: mappedLaptops,
        counts,
      },
    });
  } catch (error: any) {
    console.warn('Availability API fallback to devStore:', error.message);
    const { getDevRooms, getDevLaptops, getDevBookings } = await import(
      '@/backend/database/devStore'
    );

    const now = new Date();
    const devRooms = getDevRooms();
    const devBookings = getDevBookings();
    const devLaptops = getDevLaptops();

    const activeRoomIds = new Set(
      devBookings
        .filter((b) => {
          if (b.status !== 'active') return false;
          const start = new Date(b.startTime);
          const end = new Date(b.endTime);
          return start <= now && end >= now;
        })
        .map((b) => (typeof b.roomId === 'string' ? b.roomId : b.roomId._id))
    );

    const mappedRooms = devRooms.map((room) => {
      const isOccupied = activeRoomIds.has(room._id);
      const isUnderMaintenance = room.status === 'maintenance';
      const isClosed = room.status === 'closed';

      let availabilityState: 'available' | 'occupied' | 'maintenance' | 'closed' = 'available';
      let statusLabel = 'Available for Booking';
      let isAvailable = true;

      if (isUnderMaintenance) {
        availabilityState = 'maintenance';
        statusLabel = 'Under Maintenance';
        isAvailable = false;
      } else if (isClosed) {
        availabilityState = 'closed';
        statusLabel = 'Temporarily Closed';
        isAvailable = false;
      } else if (isOccupied) {
        availabilityState = 'occupied';
        statusLabel = 'Occupied / In Session';
        isAvailable = false;
      }

      return {
        _id: room._id,
        name: room.name,
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        facilities: ['Table and Chairs'],
        location: room.location,
        notes: room.notes || '',
        status: room.status,
        isAvailable,
        availabilityState,
        statusLabel,
      };
    });

    const mappedLaptops = devLaptops.map((laptop) => {
      const isAvailable = laptop.status === 'available';
      let statusLabel = 'Available on Shelf';
      if (laptop.status === 'borrowed') {
        statusLabel = 'Currently Borrowed';
      } else if (laptop.status === 'under_maintenance') {
        statusLabel = 'Under Maintenance';
      } else if (laptop.status === 'decommissioned') {
        statusLabel = 'Decommissioned';
      }

      return {
        _id: laptop._id,
        assetTag: laptop.assetTag,
        brand: laptop.brand,
        model: laptop.model,
        specs: laptop.specs,
        condition: laptop.condition,
        status: laptop.status,
        isAvailable,
        statusLabel,
        location: laptop.location,
        accessoriesIncluded: laptop.accessoriesIncluded || [],
      };
    });

    const counts = {
      totalRooms: mappedRooms.length,
      availableRooms: mappedRooms.filter((r) => r.isAvailable).length,
      occupiedRooms: mappedRooms.filter((r) => r.availabilityState === 'occupied').length,
      maintenanceRooms: mappedRooms.filter((r) => r.availabilityState === 'maintenance').length,
      totalLaptops: mappedLaptops.length,
      availableLaptops: mappedLaptops.filter((l) => l.isAvailable).length,
      borrowedLaptops: mappedLaptops.filter((l) => l.status === 'borrowed').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        rooms: mappedRooms,
        laptops: mappedLaptops,
        counts,
      },
      isDevFallback: true,
    });
  }
}
