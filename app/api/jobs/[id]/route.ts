import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCollection } from '@/lib/db';
import type { MarketplaceJob } from '@/lib/models/MarketplaceJob';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id || !user.role || !ObjectId.isValid(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const jobsCollection = await getCollection<MarketplaceJob>('marketplace_jobs');
    const job = await jobsCollection.findOne({ _id: new ObjectId(id) });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    if (user.role !== 'admin' && job.clientId !== user.id && (user.role !== 'fundi' || job.status !== 'open')) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const proposalsCollection = await getCollection('marketplace_proposals');
    const ownProposal = user.role === 'fundi'
      ? await proposalsCollection.findOne({ jobId: job._id, fundiId: user.id })
      : null;

    return NextResponse.json({
      job: { ...job, _id: job._id?.toString() },
      hasSubmittedProposal: Boolean(ownProposal),
    });
  } catch (error) {
    console.error('Error fetching marketplace job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}