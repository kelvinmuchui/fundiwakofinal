import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const role = session.user.role;

    const disputesCollection = await getCollection('disputes');
    let query: any = {};

    // Admin can see all, users only see theirs
    if (role !== 'admin') {
      query.$or = [
        { raisedBy: session.user.id },
        { against: session.user.id }
      ];
    }

    if (status) {
      query.status = status;
    }

    const disputes = await disputesCollection.find(query).sort({ createdAt: -1 }).toArray();

    // Enrich with user data
    const usersCollection = await getCollection('users');
    const enrichedDisputes = await Promise.all(
      disputes.map(async (dispute) => {
        const raisedByUser = await usersCollection.findOne({ _id: new ObjectId(dispute.raisedBy) }, { projection: { name: 1, email: 1, role: 1 } });
        const againstUser = await usersCollection.findOne({ _id: new ObjectId(dispute.against) }, { projection: { name: 1, email: 1, role: 1 } });
        return {
          ...dispute,
          raisedByData: raisedByUser,
          againstData: againstUser
        };
      })
    );

    return NextResponse.json({ disputes: enrichedDisputes }, { status: 200 });

  } catch (error) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
  }
}
