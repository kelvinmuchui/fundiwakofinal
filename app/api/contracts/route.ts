import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCollection } from '@/lib/db';
import type { MarketplaceContract } from '@/lib/models/MarketplaceJob';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id || !ObjectId.isValid(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'client' && user.role !== 'fundi' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const contractsCollection = await getCollection<MarketplaceContract>('marketplace_contracts');
    const query = user.role === 'admin'
      ? {}
      : { $or: [{ clientId: user.id }, { fundiId: user.id }] };
    const contracts = await contractsCollection.find(query).sort({ updatedAt: -1 }).limit(100).toArray();

    return NextResponse.json({
      contracts: contracts.map((contract) => ({ ...contract, _id: contract._id?.toString(), jobId: contract.jobId.toString(), proposalId: contract.proposalId.toString() })),
    });
  } catch (error) {
    console.error('Error fetching marketplace contracts:', error);
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}