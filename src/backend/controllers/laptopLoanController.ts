import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/backend/database/db';
import LaptopLoan from '@/backend/models/LaptopLoan';
import Laptop from '@/backend/models/Laptop';
import { getCurrentUser } from '@/backend/auth/jwt';

export async function getLaptopLoans(req: NextRequest) {
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

    const enrichedLoans = loans.map((loan) => {
      const isOverdue = loan.status === 'active' && new Date(loan.dueAt) < now;
      return {
        ...loan.toObject(),
        isOverdue,
      };
    });

    return NextResponse.json({ success: true, loans: enrichedLoans });
  } catch (error: any) {
    console.warn('Laptop loans notice: MongoDB offline, returning dev store loans');
    const { getDevLoans } = await import('@/backend/database/devStore');
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const borrowerId = searchParams.get('borrowerId');
    const laptopId = searchParams.get('laptopId');
    const loans = getDevLoans(status || undefined, borrowerId || undefined, laptopId || undefined);
    return NextResponse.json({ success: true, loans, isDatabaseOffline: true });
  }
}

export async function createLaptopLoan(req: NextRequest) {
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

    laptop.status = 'borrowed';
    await laptop.save();

    const populated = await LaptopLoan.findById(loan._id)
      .populate('laptopId')
      .populate('staffIssuerId', 'name employeeId');

    return NextResponse.json({ success: true, loan: populated }, { status: 201 });
  } catch (error: any) {
    console.warn('Checkout laptop notice: MongoDB offline, saving to dev store');
    try {
      const { createDevLoan } = await import('@/backend/database/devStore');
      const body = await req.json().catch(() => ({}));
      const user = await getCurrentUser();
      const newLoan = createDevLoan({
        laptopId: body.laptopId,
        borrowerName: body.borrowerName,
        borrowerId: body.borrowerId,
        borrowerEmail: body.borrowerEmail,
        borrowerContact: body.borrowerContact,
        borrowedAt: new Date().toISOString(),
        dueAt: body.dueAt,
        status: 'active',
        staffIssuerId: { name: user?.name || 'Admin Staff', employeeId: user?.employeeId || 'STAFF-001' },
        checkoutAccessories: body.checkoutAccessories || [],
        checkoutNotes: body.checkoutNotes || '',
      });
      return NextResponse.json({ success: true, loan: newLoan, isDatabaseOffline: true }, { status: 201 });
    } catch (devErr: any) {
      console.error('Checkout laptop error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to checkout laptop' },
        { status: 500 }
      );
    }
  }
}

export async function returnLaptopLoan(id: string, req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { returnCondition, returnNotes } = body;

    if (!returnCondition) {
      return NextResponse.json(
        { error: 'Return condition assessment is required (excellent, good, fair, damaged).' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const loan = await LaptopLoan.findById(id);
    if (!loan) {
      return NextResponse.json({ error: 'Loan record not found' }, { status: 404 });
    }

    if (loan.status === 'returned') {
      return NextResponse.json({ error: 'This loan has already been marked as returned.' }, { status: 400 });
    }

    loan.status = 'returned';
    loan.returnedAt = new Date();
    loan.returnCondition = returnCondition;
    loan.returnNotes = returnNotes || '';
    loan.staffReceiverId = user.id as any;
    await loan.save();

    const laptop = await Laptop.findById(loan.laptopId);
    if (laptop) {
      laptop.condition = returnCondition;
      if (returnCondition === 'damaged') {
        laptop.status = 'under_maintenance';
        laptop.notes = `${laptop.notes ? laptop.notes + ' | ' : ''}Damaged upon return by ${loan.borrowerName} (${new Date().toLocaleDateString()}): ${returnNotes || 'No notes'}`;
      } else {
        laptop.status = 'available';
      }
      await laptop.save();
    }

    const populated = await LaptopLoan.findById(loan._id)
      .populate('laptopId')
      .populate('staffIssuerId', 'name employeeId')
      .populate('staffReceiverId', 'name employeeId');

    return NextResponse.json({
      success: true,
      message: 'Laptop checked in successfully',
      loan: populated,
    });
  } catch (error: any) {
    console.warn('Return laptop notice: MongoDB offline, updating dev store');
    try {
      const { returnDevLoan } = await import('@/backend/database/devStore');
      const body = await req.json().catch(() => ({}));
      const updated = returnDevLoan(id, body.returnCondition || 'good', body.returnNotes || '');
      return NextResponse.json({
        success: true,
        message: 'Laptop checked in successfully (devStore)',
        loan: updated,
        isDatabaseOffline: true,
      });
    } catch (devErr) {
      console.error('Return laptop error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
