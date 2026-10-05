import { NextResponse } from 'next/server';
import { getServices } from '@/lib/services';

export async function GET() {
  try {
    return NextResponse.json(await getServices());
  } catch (error) {
    console.error('Failed to load services:', error);
    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 });
  }
}