import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCollection } from '@/lib/db';
import type { MarketplaceJob, MarketplaceProposal } from '@/lib/models/MarketplaceJob';
import { marketplaceProposalSchema } from '@/lib/validation';

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
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });

    const jobsCollection = await getCollection<MarketplaceJob>('marketplace_jobs');
    const job = await jobsCollection.findOne({ _id: new ObjectId(id) });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    if (user.role !== 'admin' && (user.role !== 'client' || job.clientId !== user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const proposalsCollection = await getCollection<MarketplaceProposal>('marketplace_proposals');
    const proposals = await proposalsCollection.find({ jobId: job._id }).sort({ createdAt: -1 }).toArray();
    const usersCollection = await getCollection('users');
    const enrichedProposals = await Promise.all(proposals.map(async (proposal) => {
      const fundi = await usersCollection.findOne(
        { _id: new ObjectId(proposal.fundiId), role: 'fundi' },
        { projection: { name: 1, skill: 1, skills: 1, location: 1, rating: 1, jobsCompleted: 1, photoURL: 1, isVerified: 1 } },
      );
      return {
        ...proposal,
        _id: proposal._id?.toString(),
        jobId: proposal.jobId.toString(),
        fundi: fundi ? { ...fundi, _id: fundi._id?.toString() } : null,
      };
    }));

    return NextResponse.json({ proposals: enrichedProposals });
  } catch (error) {
    console.error('Error fetching job proposals:', error);
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id || !ObjectId.isValid(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'fundi') {
      return NextResponse.json({ error: 'Only fundis can submit proposals' }, { status: 403 });
    }

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });

    const body = await request.json().catch(() => null);
    const validation = marketplaceProposalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const jobsCollection = await getCollection<MarketplaceJob>('marketplace_jobs');
    const job = await jobsCollection.findOne({ _id: new ObjectId(id), status: 'open' });
    if (!job) return NextResponse.json({ error: 'Open job not found' }, { status: 404 });
    if (job.clientId === user.id) {
      return NextResponse.json({ error: 'You cannot submit a proposal to your own job' }, { status: 403 });
    }

    const proposalsCollection = await getCollection<MarketplaceProposal>('marketplace_proposals');
    const now = new Date();
    const result = await proposalsCollection.insertOne({
      ...validation.data,
      jobId: job._id!,
      clientId: job.clientId,
      fundiId: user.id,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });
    const jobUpdate = await jobsCollection.updateOne(
      { _id: job._id, status: 'open' },
      { $inc: { proposalCount: 1 }, $set: { updatedAt: now } },
    );
    if (jobUpdate.modifiedCount !== 1) {
      await proposalsCollection.deleteOne({ _id: result.insertedId });
      return NextResponse.json({ error: 'This job is no longer accepting proposals' }, { status: 409 });
    }

    return NextResponse.json({ proposalId: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json({ error: 'You have already submitted a proposal for this job' }, { status: 409 });
    }
    console.error('Error submitting job proposal:', error);
    return NextResponse.json({ error: 'Failed to submit proposal' }, { status: 500 });
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}