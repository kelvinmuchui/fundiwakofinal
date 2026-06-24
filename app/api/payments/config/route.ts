import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    mockMode: process.env.MPESA_MOCK_MODE === 'true' || !process.env.MPESA_CONSUMER_KEY,
    env: process.env.MPESA_ENV || 'sandbox',
  });
}
