import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/backend/database/db';
import RoomBooking from '@/backend/models/RoomBooking';
import Room from '@/backend/models/Room';
import '@/backend/models/User';
import { getCurrentUser, hasPortalAccess } from '@/backend/auth/jwt';
import { getEffectiveSystemSettings } from '@/backend/models/Setting';
import { formatTime12h, getManilaDayBounds, getManilaTimeHHMM } from '@/lib/policyUtils';

export async function getRoomBookings(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPortalAccess(user, 'rooms')) {
      return NextResponse.json(
        { error: 'Access denied: Staff sessions cannot switch desks. Sign out to switch portals.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');
    const dateStr = searchParams.get('date');
    const borrowerId = searchParams.get('borrowerId');

    const filter: any = {};

    if (roomId && roomId !== 'all') {
      filter.roomId = roomId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (borrowerId) {
      filter.borrowerId = { $regex: borrowerId.trim(), $options: 'i' };
    }

    if (dateStr) {
      const { startOfDay, endOfDay } = getManilaDayBounds(dateStr);

      filter.startTime = { $lte: endOfDay };
      filter.endTime = { $gte: startOfDay };
    }

    const bookings = await RoomBooking.find(filter)
      .populate('roomId', 'name roomNumber capacity facilities status location')
      .populate('bookedByStaffId', 'name employeeId')
      .sort({ startTime: 1 })
      .lean();

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error('getRoomBookings error:', error);
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: error.message || 'Failed to load room bookings' },
        { status: 500 }
      );
    }
    console.warn('Bookings notice: MongoDB offline, returning dev store bookings');
    const { getDevBookings } = await import('@/backend/database/devStore');
    return NextResponse.json({ success: true, bookings: getDevBookings(), isDatabaseOffline: true });
  }
}

export async function createRoomBooking(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPortalAccess(user, 'rooms')) {
      return NextResponse.json(
        { error: 'Access denied: Staff sessions cannot switch desks. Sign out to switch portals.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      roomId,
      borrowerName,
      borrowerId,
      courseAndYear,
      borrowerEmail,
      borrowerContact,
      startTime,
      endTime,
      purpose,
      purposes,
      attendeesCount,
      notes,
    } = body;

    const normalizedPurposes = Array.isArray(purposes)
      ? purposes.map((p: any) => String(p).trim()).filter(Boolean)
      : [];
    const resolvedPurpose =
      (purpose && String(purpose).trim()) || normalizedPurposes.join(', ');

    if (!roomId || !borrowerName || !startTime || !endTime || !resolvedPurpose || (!courseAndYear && !borrowerId)) {
      return NextResponse.json(
        { error: 'Room, Name, Course and Year, Date, Time of Use, and Purpose are required.' },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid start or end time format.' }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json({ error: 'End time must be after start time.' }, { status: 400 });
    }

    await connectToDatabase();

    const [room, settings] = await Promise.all([
      Room.findById(roomId).lean(),
      getEffectiveSystemSettings(),
    ]);
    if (!room) {
      return NextResponse.json({ error: 'Selected room was not found.' }, { status: 404 });
    }

    if (room.status !== 'available') {
      return NextResponse.json(
        { error: `Cannot book room ${room.name} because its status is currently "${room.status}".` },
        { status: 400 }
      );
    }

    const parsedAttendees =
      attendeesCount !== undefined && attendeesCount !== null && String(attendeesCount).trim() !== ''
        ? Number(attendeesCount)
        : settings.minRoomCapacity;

    const hasCapacityViolation =
      parsedAttendees < settings.minRoomCapacity || parsedAttendees > settings.maxRoomCapacity;

    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const hasDurationViolation = durationHours > settings.maxSlotDurationHours;

    const startHHMM = getManilaTimeHHMM(start);
    const endHHMM = getManilaTimeHHMM(end);
    const hasHoursViolation = Boolean(
      settings.operatingHoursStart &&
        settings.operatingHoursEnd &&
        settings.operatingHoursStart < settings.operatingHoursEnd &&
        (startHHMM < settings.operatingHoursStart || endHHMM > settings.operatingHoursEnd)
    );

    const hasPolicyViolation = hasCapacityViolation || hasDurationViolation || hasHoursViolation;
    let isPolicyOverridden = false;

    if (hasPolicyViolation) {
      if (body.adminOverride && (user.role === 'admin' || user.role === 'super_admin')) {
        isPolicyOverridden = true;
      } else {
        if (hasCapacityViolation) {
          return NextResponse.json(
            {
              error: `Requested attendees (${parsedAttendees}) is outside configured capacity (${settings.minRoomCapacity} to ${settings.maxRoomCapacity} students). An Administrator can apply an administrative override if authorized.`,
            },
            { status: 400 }
          );
        }
        if (hasDurationViolation) {
          return NextResponse.json(
            {
              error: `Booking duration (${Number(durationHours.toFixed(2))}h) exceeds the maximum allowed slot duration of ${settings.maxSlotDurationHours} hour(s). An Administrator can apply an administrative override if authorized.`,
            },
            { status: 400 }
          );
        }
        return NextResponse.json(
          {
            error: `Booking time (${formatTime12h(startHHMM)} – ${formatTime12h(endHHMM)}) falls outside library operating hours (${formatTime12h(settings.operatingHoursStart)} – ${formatTime12h(settings.operatingHoursEnd)}). An Administrator can apply an administrative override if authorized.`,
          },
          { status: 400 }
        );
      }
    }

    // Overlap conflict check: (ExistingStart < NewEnd) AND (ExistingEnd > NewStart) AND status == 'active'
    const conflict = await RoomBooking.findOne({
      roomId: room._id,
      status: 'active',
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (conflict) {
      const conflictStart = formatTime12h(getManilaTimeHHMM(new Date(conflict.startTime)));
      const conflictEnd = formatTime12h(getManilaTimeHHMM(new Date(conflict.endTime)));
      const conflictAffiliation = conflict.courseAndYear || conflict.borrowerId;
      return NextResponse.json(
        {
          error: `Time conflict! Room is already booked from ${conflictStart} to ${conflictEnd} by ${conflict.borrowerName}${conflictAffiliation ? ` (${conflictAffiliation})` : ''}. Earliest non-conflicting start time after this slot is ${conflictEnd}.`,
        },
        { status: 409 }
      );
    }

    const booking = await RoomBooking.create({
      roomId: room._id,
      borrowerName: borrowerName.trim(),
      borrowerId: borrowerId ? String(borrowerId).toUpperCase().trim() : '',
      courseAndYear: courseAndYear ? String(courseAndYear).trim() : '',
      borrowerEmail: borrowerEmail ? borrowerEmail.trim() : '',
      borrowerContact: borrowerContact ? borrowerContact.trim() : '',
      startTime: start,
      endTime: end,
      purpose: resolvedPurpose,
      purposes: normalizedPurposes,
      attendeesCount: parsedAttendees,
      bookedByStaffId: user.id,
      notes: isPolicyOverridden
        ? `${notes ? notes + ' | ' : ''}[ADMIN OVERRIDE: Policy bypassed by ${user.name}]`
        : notes || '',
      status: 'active',
    });

    const populated = await RoomBooking.findById(booking._id)
      .populate('roomId', 'name roomNumber capacity facilities')
      .populate('bookedByStaffId', 'name employeeId');

    return NextResponse.json({ success: true, booking: populated }, { status: 201 });
  } catch (error: any) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create room booking' },
      { status: 500 }
    );
  }
}

export async function getRoomBookingById(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPortalAccess(user, 'rooms')) {
      return NextResponse.json(
        { error: 'Access denied: Staff sessions cannot switch desks.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const booking = await RoomBooking.findById(id)
      .populate('roomId')
      .populate('bookedByStaffId', 'name employeeId');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function updateRoomBooking(id: string, req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPortalAccess(user, 'rooms')) {
      return NextResponse.json(
        { error: 'Access denied: Staff sessions cannot switch desks.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status, notes } = body;
    const extendMinutes = body.extendMinutes ?? body.extensionMinutes;

    await connectToDatabase();
    const booking = await RoomBooking.findById(id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (extendMinutes && Number(extendMinutes) > 0) {
      if (booking.status !== 'active') {
        return NextResponse.json(
          { error: 'Can only extend active room bookings.' },
          { status: 400 }
        );
      }

      const currentEnd = new Date(booking.endTime);
      const newEnd = new Date(currentEnd.getTime() + Number(extendMinutes) * 60 * 1000);
      const settings = await getEffectiveSystemSettings();
      const totalExtendedHours = (newEnd.getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60);
      const newEndHHMM = getManilaTimeHHMM(newEnd);
      const canOverride = Boolean(body.adminOverride && (user.role === 'admin' || user.role === 'super_admin'));

      if (!canOverride) {
        if (totalExtendedHours > settings.maxSlotDurationHours) {
          return NextResponse.json(
            {
              error: `Cannot extend: Total duration (${Number(totalExtendedHours.toFixed(2))}h) exceeds the configured maximum of ${settings.maxSlotDurationHours} hour(s).`,
            },
            { status: 400 }
          );
        }
        if (
          settings.operatingHoursStart &&
          settings.operatingHoursEnd &&
          settings.operatingHoursStart < settings.operatingHoursEnd &&
          newEndHHMM > settings.operatingHoursEnd
        ) {
          return NextResponse.json(
            {
              error: `Cannot extend: Extended end time (${formatTime12h(newEndHHMM)}) goes past desk closing time (${formatTime12h(settings.operatingHoursEnd)}).`,
            },
            { status: 400 }
          );
        }
      }

      const conflict = await RoomBooking.findOne({
        _id: { $ne: booking._id },
        roomId: booking.roomId,
        status: 'active',
        startTime: { $lt: newEnd },
        endTime: { $gt: currentEnd },
      });

      if (conflict) {
        const conflictStart = formatTime12h(getManilaTimeHHMM(new Date(conflict.startTime)));
        return NextResponse.json(
          {
            error: `Cannot extend: Room is booked starting at ${conflictStart} by ${conflict.borrowerName}.`,
          },
          { status: 409 }
        );
      }

      booking.endTime = newEnd;
    }

    if (status && ['active', 'completed', 'cancelled', 'no_show'].includes(status)) {
      booking.status = status;
    }

    if (notes !== undefined) {
      booking.notes = notes;
    }

    await booking.save();

    const populated = await RoomBooking.findById(booking._id)
      .populate('roomId', 'name roomNumber capacity')
      .populate('bookedByStaffId', 'name employeeId');

    return NextResponse.json({ success: true, booking: populated });
  } catch (error: any) {
    console.error('Update booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
