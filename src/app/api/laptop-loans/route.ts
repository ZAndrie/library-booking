import { NextRequest } from 'next/server';
import { getLaptopLoans, createLaptopLoan } from '@/backend/controllers/laptopLoanController';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return getLaptopLoans(req);
}

export async function POST(req: NextRequest) {
  return createLaptopLoan(req);
}
