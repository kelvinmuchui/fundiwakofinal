import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactionsCollection = await getCollection('transactions');
    const bookingsCollection = await getCollection('bookings');
    const usersCollection = await getCollection('users');

    // Find transactions where user is client or fundi
    const transactions = await transactionsCollection.find({
      $or: [
        { clientId: user.id },
        { fundiId: user.id }
      ]
    }).sort({ createdAt: -1 }).toArray();

    // Enrich transactions with booking and counterparty details
    const enrichedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        const booking = await bookingsCollection.findOne({ _id: new ObjectId(tx.bookingId) });
        
        let counterparty = null;
        if (user.role === 'client') {
          // counterparty is the fundi
          const fundi = await usersCollection.findOne({ _id: new ObjectId(tx.fundiId) });
          counterparty = fundi ? { name: fundi.name, phone: fundi.phone } : null;
        } else {
          // counterparty is the client
          const client = await usersCollection.findOne({ _id: new ObjectId(tx.clientId) });
          counterparty = client ? { name: client.name, phone: client.phone } : null;
        }

        return {
          ...tx,
          serviceType: booking?.serviceType || 'Service',
          description: booking?.description || '',
          counterparty
        };
      })
    );

    return NextResponse.json({ success: true, data: enrichedTransactions });

  } catch (error: any) {
    console.error('Fetch Transactions API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
