import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCollection } from '@/lib/mongodb';
import { raiseDisputeSchema, getValidationErrorMessages } from '@/lib/validation';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = raiseDisputeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: getValidationErrorMessages(validation.error)
      }, { status: 400 });
    }

    const { transactionId, bookingId, reason, description, evidenceUrls } = validation.data;

    // Verify transaction exists and is held
    const transactionsCollection = await getCollection('transactions');
    const transaction = await transactionsCollection.findOne({ _id: new ObjectId(transactionId) });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status !== 'held') {
      return NextResponse.json({ error: 'Only held escrow funds can be disputed' }, { status: 400 });
    }

    // Verify user is part of the transaction
    if (transaction.clientId !== session.user.id && transaction.fundiId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to dispute this transaction' }, { status: 403 });
    }

    const againstUser = session.user.id === transaction.clientId ? transaction.fundiId : transaction.clientId;

    const disputesCollection = await getCollection('disputes');
    
    // Check if dispute already exists
    const existingDispute = await disputesCollection.findOne({ transactionId: new ObjectId(transactionId) });
    if (existingDispute) {
      return NextResponse.json({ error: 'A dispute already exists for this transaction' }, { status: 400 });
    }

    const newDispute = {
      transactionId: new ObjectId(transactionId),
      bookingId: bookingId ? new ObjectId(bookingId) : undefined,
      raisedBy: session.user.id,
      against: againstUser,
      reason,
      description,
      evidenceUrls: evidenceUrls || [],
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await disputesCollection.insertOne(newDispute);

    // Update transaction to disputed
    await transactionsCollection.updateOne(
      { _id: new ObjectId(transactionId) },
      { 
        $set: { 
          status: 'disputed', 
          disputeId: result.insertedId,
          updatedAt: new Date()
        } 
      }
    );

    // If booking exists, update booking to disputed
    if (bookingId) {
      const bookingsCollection = await getCollection('bookings');
      await bookingsCollection.updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: { status: 'disputed', updatedAt: new Date() } }
      );
    }

    return NextResponse.json({
      message: 'Dispute raised successfully. Escrow funds are frozen.',
      disputeId: result.insertedId
    }, { status: 201 });

  } catch (error) {
    console.error('Error raising dispute:', error);
    return NextResponse.json({ error: 'Failed to raise dispute' }, { status: 500 });
  }
}
