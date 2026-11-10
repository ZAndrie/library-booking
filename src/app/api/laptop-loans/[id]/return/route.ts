import { NextRequest } from 'next/server';
import { returnLaptopLoan } from '@/backend/controllers/laptopLoanController';

interface Params {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: Params) {
  return returnLaptopLoan(params.id, req);
}
