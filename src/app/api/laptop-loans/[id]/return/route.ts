import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import LaptopLoan from '@/models/LaptopLoan';
import Laptop from '@/models/Laptop';
import { getCurrentUser } from '@/lib/auth';

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
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

    const loan = await LaptopLoan.findById(params.id);
    if (!loan) {
      return NextResponse.json({ error: 'Loan record not found' }, { status: 404 });
    }

    if (loan.status === 'returned') {
      return NextResponse.json({ error: 'This loan has already been marked as returned.' }, { status: 400 });
    }

    // Update loan record
    loan.status = 'returned';
    loan.returnedAt = new Date();
    loan.returnCondition = returnCondition;
    loan.returnNotes = returnNotes || '';
    loan.staffReceiverId = user.id as any;
    await loan.save();

    // Update corresponding laptop status
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
    console.error('Return laptop error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
