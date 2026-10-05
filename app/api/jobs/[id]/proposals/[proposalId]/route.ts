import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCollection } from '@/lib/db';
import clientPromise from '@/lib/mongodb';
import type { MarketplaceContract, MarketplaceJob, MarketplaceProposal } from '@/lib/models/MarketplaceJob';
import { marketplaceProposalDecisionSchema } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; proposalId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id || !ObjectId.isValid(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'client') {
      return NextResponse.json({ error: 'Only clients can review proposals' }, { status: 403 });
    }

    const { id, proposalId } = await context.params;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(proposalId)) {
      return NextResponse.json({ error: 'Invalid job or proposal ID' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const validation = marketplaceProposalDecisionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Status must be accepted or rejected' }, { status: 400 });
    }

    const jobId = new ObjectId(id);
    const selectedProposalId = new ObjectId(proposalId);
    const now = new Date();

    if (validation.data.status === 'rejected') {
      const jobsCollection = await getCollection<MarketplaceJob>('marketplace_jobs');
      const job = await jobsCollection.findOne({ _id: jobId, clientId: user.id });
      if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      if (job.status !== 'open') return NextResponse.json({ error: 'This job is no longer open' }, { status: 409 });

      const proposalsCollection = await getCollection<MarketplaceProposal>('marketplace_proposals');
      const result = await proposalsCollection.updateOne(
        { _id: selectedProposalId, jobId, clientId: user.id, status: 'pending' },
        { $set: { status: 'rejected', updatedAt: now } },
      );
      if (result.modifiedCount !== 1) {
        return NextResponse.json({ error: 'Pending proposal not found' }, { status: 404 });
      }
      return NextResponse.json({ status: 'rejected' });
    }

    const client = await clientPromise;
    const sessionDb = client.startSession();
    let contractId: ObjectId | undefined;
    let transactionError: unknown;

    try {
      await sessionDb.withTransaction(async () => {
        const db = client.db();
        const jobsCollection = db.collection<MarketplaceJob>('marketplace_jobs');
        const proposalsCollection = db.collection<MarketplaceProposal>('marketplace_proposals');
        const contractsCollection = db.collection<MarketplaceContract>('marketplace_contracts');

        const job = await jobsCollection.findOne(
          { _id: jobId, clientId: user.id, status: 'open' },
          { session: sessionDb },
        );
        const proposal = await proposalsCollection.findOne(
          { _id: selectedProposalId, jobId, clientId: user.id, status: 'pending' },
          { session: sessionDb },
        );
        if (!job || !proposal) throw new Error('PROPOSAL_NOT_AVAILABLE');

        const claim = await jobsCollection.updateOne(
          { _id: jobId, clientId: user.id, status: 'open' },
          { $set: { status: 'awarded', acceptedProposalId: selectedProposalId, updatedAt: now } },
          { session: sessionDb },
        );
        if (claim.modifiedCount !== 1) throw new Error('PROPOSAL_NOT_AVAILABLE');

        const accepted = await proposalsCollection.updateOne(
          { _id: selectedProposalId, jobId, status: 'pending' },
          { $set: { status: 'accepted', updatedAt: now } },
          { session: sessionDb },
        );
        if (accepted.modifiedCount !== 1) throw new Error('PROPOSAL_NOT_AVAILABLE');

        await proposalsCollection.updateMany(
          { jobId, status: 'pending', _id: { $ne: selectedProposalId } },
          { $set: { status: 'rejected', updatedAt: now } },
          { session: sessionDb },
        );

        const contract = await contractsCollection.insertOne({
          jobId,
          proposalId: selectedProposalId,
          clientId: job.clientId,
          fundiId: proposal.fundiId,
          title: job.title,
          description: job.description,
          amount: proposal.amount,
          duration: proposal.duration,
          status: 'active',
          milestones: [],
          createdAt: now,
          updatedAt: now,
        }, { session: sessionDb });
        contractId = contract.insertedId;
      });
    } catch (error) {
      transactionError = error;
    } finally {
      await sessionDb.endSession();
    }

    if (transactionError) {
      if (transactionError instanceof Error && transactionError.message === 'PROPOSAL_NOT_AVAILABLE') {
        return NextResponse.json({ error: 'This job or proposal is no longer available' }, { status: 409 });
      }
      throw transactionError;
    }

    return NextResponse.json({ status: 'accepted', contractId: contractId?.toString() });
  } catch (error) {
    console.error('Error deciding marketplace proposal:', error);
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
  }
}