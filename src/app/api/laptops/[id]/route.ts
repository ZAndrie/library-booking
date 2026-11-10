import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Laptop from '@/models/Laptop';
import LaptopLoan from '@/models/LaptopLoan';
import { getCurrentUser } from '@/lib/auth';

interface Params {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const laptop = await Laptop.findById(params.id);
    if (!laptop) {
      return NextResponse.json({ error: 'Laptop not found' }, { status: 404 });
    }

    // Include loan history for this device
    const loans = await LaptopLoan.find({ laptopId: params.id })
      .sort({ borrowedAt: -1 })
      .limit(10)
      .populate('staffIssuerId', 'name')
      .populate('staffReceiverId', 'name');

    return NextResponse.json({ success: true, laptop, loanHistory: loans });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();

    const laptop = await Laptop.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!laptop) {
      return NextResponse.json({ error: 'Laptop not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, laptop });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete inventory devices' }, { status: 403 });
    }

    await connectToDatabase();

    const laptop = await Laptop.findById(params.id);
    if (!laptop) {
      return NextResponse.json({ error: 'Laptop not found' }, { status: 404 });
    }

    if (laptop.status === 'borrowed') {
      return NextResponse.json(
        { error: 'Cannot delete a laptop that is currently out on loan. Return it first.' },
        { status: 400 }
      );
    }

    await Laptop.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Laptop deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
