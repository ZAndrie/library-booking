import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import LaptopLoan from '@/models/LaptopLoan';
import Laptop from '@/models/Laptop';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const borrowerId = searchParams.get('borrowerId');
    const laptopId = searchParams.get('laptopId');

    const filter: any = {};

    const now = new Date();

    if (status === 'overdue') {
      filter.status = 'active';
      filter.dueAt = { $lt: now };
    } else if (status && status !== 'all') {
      filter.status = status;
    }

    if (borrowerId) {
      filter.borrowerId = { $regex: borrowerId.trim(), $options: 'i' };
    }

    if (laptopId) {
      filter.laptopId = laptopId;
    }

    const loans = await LaptopLoan.find(filter)
      .populate('laptopId', 'assetTag brand model serialNumber condition location')
      .populate('staffIssuerId', 'name employeeId')
      .populate('staffReceiverId', 'name employeeId')
      .sort({ borrowedAt: -1 });

    // Format loans and flag overdue
    const enrichedLoans = loans.map((loan) => {
      const isOverdue = loan.status === 'active' && new Date(loan.dueAt) < now;
      return {
        ...loan.toObject(),
        isOverdue,
      };
    });

    return NextResponse.json({ success: true, loans: enrichedLoans });
  } catch (error: any) {
    console.error('Fetch laptop loans error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch laptop loans' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      laptopId,
      borrowerName,
      borrowerId,
      borrowerEmail,
      borrowerContact,
      dueAt,
      checkoutAccessories,
      checkoutNotes,
    } = body;

    if (!laptopId || !borrowerName || !borrowerId || !dueAt) {
      return NextResponse.json(
        { error: 'Laptop, Borrower Name, Borrower ID, and Due Date/Time are required.' },
        { status: 400 }
      );
    }

    const dueDate = new Date(dueAt);
    if (isNaN(dueDate.getTime()) || dueDate <= new Date()) {
      return NextResponse.json(
        { error: 'Due date and time must be set in the future.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const laptop = await Laptop.findById(laptopId);
    if (!laptop) {
      return NextResponse.json({ error: 'Laptop not found' }, { status: 404 });
    }

    if (laptop.status !== 'available') {
      return NextResponse.json(
        { error: `Cannot checkout laptop ${laptop.assetTag}: current status is "${laptop.status}".` },
        { status: 400 }
      );
    }

    // Check if this borrower already has an active laptop loan (limit 1 laptop per student)
    const existingActiveLoan = await LaptopLoan.findOne({
      borrowerId: borrowerId.toUpperCase().trim(),
      status: 'active',
    });

    if (existingActiveLoan) {
      return NextResponse.json(
        {
          error: `Borrower ${borrowerId} already has an active laptop loan. Please return the previous device first.`,
        },
        { status: 400 }
      );
    }

    // Create loan record
    const loan = await LaptopLoan.create({
      laptopId: laptop._id,
      borrowerName: borrowerName.trim(),
      borrowerId: borrowerId.toUpperCase().trim(),
      borrowerEmail: borrowerEmail ? borrowerEmail.trim() : undefined,
      borrowerContact: borrowerContact ? borrowerContact.trim() : undefined,
      borrowedAt: new Date(),
      dueAt: dueDate,
      status: 'active',
      staffIssuerId: user.id,
      checkoutAccessories: Array.isArray(checkoutAccessories) ? checkoutAccessories : [],
      checkoutNotes: checkoutNotes || '',
    });

    // Update laptop status to borrowed
    laptop.status = 'borrowed';
    await laptop.save();

    const populated = await LaptopLoan.findById(loan._id)
      .populate('laptopId')
      .populate('staffIssuerId', 'name employeeId');

    return NextResponse.json({ success: true, loan: populated }, { status: 201 });
  } catch (error: any) {
    console.error('Checkout laptop error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to checkout laptop' },
      { status: 500 }
    );
  }
}
