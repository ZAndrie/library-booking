import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Laptop from '@/models/Laptop';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const condition = searchParams.get('condition');
    const search = searchParams.get('search');

    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (condition && condition !== 'all') {
      filter.condition = condition;
    }

    if (search) {
      filter.$or = [
        { assetTag: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
        { model: { $regex: search.trim(), $options: 'i' } },
        { serialNumber: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const laptops = await Laptop.find(filter).sort({ assetTag: 1 });
    return NextResponse.json({ success: true, laptops });
  } catch (error: any) {
    console.error('Fetch laptops error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch laptops' },
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
      assetTag,
      serialNumber,
      brand,
      model,
      specs,
      status,
      condition,
      accessoriesIncluded,
      location,
      notes,
    } = body;

    if (!assetTag || !serialNumber || !brand || !model || !specs) {
      return NextResponse.json(
        { error: 'Asset Tag, Serial Number, Brand, Model, and Specs are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingTag = await Laptop.findOne({ assetTag: assetTag.toUpperCase().trim() });
    if (existingTag) {
      return NextResponse.json(
        { error: `A laptop with Asset Tag ${assetTag} already exists.` },
        { status: 400 }
      );
    }

    const existingSerial = await Laptop.findOne({ serialNumber: serialNumber.toUpperCase().trim() });
    if (existingSerial) {
      return NextResponse.json(
        { error: `A laptop with Serial Number ${serialNumber} already exists.` },
        { status: 400 }
      );
    }

    const laptop = await Laptop.create({
      assetTag: assetTag.toUpperCase().trim(),
      serialNumber: serialNumber.toUpperCase().trim(),
      brand: brand.trim(),
      model: model.trim(),
      specs: specs.trim(),
      status: status || 'available',
      condition: condition || 'excellent',
      accessoriesIncluded: Array.isArray(accessoriesIncluded) ? accessoriesIncluded : [],
      location: location ? location.trim() : 'Front Desk Cabinet A',
      notes: notes || '',
    });

    return NextResponse.json({ success: true, laptop }, { status: 201 });
  } catch (error: any) {
    console.error('Create laptop error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add laptop' },
      { status: 500 }
    );
  }
}
