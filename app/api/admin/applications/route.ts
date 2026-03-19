import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCollection } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { WorkerApplication } from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applicationsCollection = await getCollection<WorkerApplication>('worker_applications');
    const applications = await applicationsCollection.find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    // Handle MongoDB connection errors
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('MongoNetworkError') || errorMessage.includes('connect')) {
      return NextResponse.json(
        { error: 'Database service is currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}