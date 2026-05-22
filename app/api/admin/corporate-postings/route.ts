import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCollection } from '@/lib/db';

interface CorporatePosting {
  _id?: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyWebsite?: string;
  location: string;
  postingType: string;
  serviceCategory: string;
  positions: number;
  preferredStartDate?: string;
  duration?: string;
  description: string;
  submittedBy?: string | null;
  status: 'new' | 'reviewed' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postingsCollection = await getCollection<CorporatePosting>('corporate_postings');
    const postings = await postingsCollection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(postings);
  } catch (error) {
    console.error('Error fetching corporate postings:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('ENOTFOUND') || message.includes('MongoNetworkError') || message.includes('connect')) {
      return NextResponse.json({ error: 'Database service is currently unavailable. Please try again later.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
