import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCollection } from '@/lib/db';
import type { MarketplaceJob } from '@/lib/models/MarketplaceJob';
import { marketplaceJobSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id || !user.role || !ObjectId.isValid(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query: Record<string, unknown> = {};
    if (user.role === 'client') {
      query.clientId = user.id;
    } else if (user.role === 'fundi') {
      query.status = 'open';
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const category = searchParams.get('category')?.trim();
    const location = searchParams.get('location')?.trim();
    if (category) query.serviceCategory = category;
    if (location) query.location = { $regex: escapeRegex(location), $options: 'i' };

    const jobsCollection = await getCollection<MarketplaceJob>('marketplace_jobs');
    const jobs = await jobsCollection.find(query).sort({ createdAt: -1 }).limit(50).toArray();

    return NextResponse.json({
      jobs: jobs.map((job) => ({ ...job, _id: job._id?.toString() })),
    });
  } catch (error) {
    console.error('Error fetching marketplace jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id || !ObjectId.isValid(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'client') {
      return NextResponse.json({ error: 'Only clients can post jobs' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const validation = marketplaceJobSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const jobsCollection = await getCollection<MarketplaceJob>('marketplace_jobs');
    const now = new Date();
    const result = await jobsCollection.insertOne({
      ...validation.data,
      clientId: user.id,
      status: 'open',
      proposalCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ jobId: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    console.error('Error creating marketplace job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}