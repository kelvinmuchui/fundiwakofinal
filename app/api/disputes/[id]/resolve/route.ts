import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCollection } from '@/lib/mongodb';
import { resolveDisputeSchema, getValidationErrorMessages } from '@/lib/validation';
import { ObjectId } from 'mongodb';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const disputeId = params.id;
    if (!disputeId) {
      return NextResponse.json({ error: 'Dispute ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const validation = resolveDisputeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: getValidationErrorMessages(validation.error)
      }, { status: 400 });
    }

    const { status, resolutionNotes, splitPercentageClient } = validation.data;

    const disputesCollection = await getCollection('disputes');
    const dispute = await disputesCollection.findOne({ _id: new ObjectId(disputeId) });

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    if (dispute.status.startsWith('resolved')) {
      return NextResponse.json({ error: 'Dispute is already resolved' }, { status: 400 });
    }

    // 1. Update the dispute
    await disputesCollection.updateOne(
      { _id: new ObjectId(disputeId) },
      {
        $set: {
          status,
          resolutionNotes,
          adminAssignedId: session.user.id,
          resolvedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    // 2. Resolve the transaction
    const transactionsCollection = await getCollection('transactions');
    const transaction = await transactionsCollection.findOne({ _id: dispute.transactionId });

    if (transaction) {
      let txStatus = 'completed'; // default
      let bookingStatus = 'completed';

      if (status === 'resolved_refunded') {
        txStatus = 'refunded';
        bookingStatus = 'cancelled';
        // In a real scenario, you would trigger the M-Pesa B2C refund API here.
        // For wallet balance, we would refund the client's wallet.
        const walletsCollection = await getCollection('wallets');
        await walletsCollection.updateOne(
          { userId: transaction.clientId },
          { $inc: { balance: transaction.amount }, $set: { updatedAt: new Date() } },
          { upsert: true }
        );
      } else if (status === 'resolved_released') {
        txStatus = 'released';
        bookingStatus = 'completed';
        // Release funds to the Fundi's wallet
        const walletsCollection = await getCollection('wallets');
        await walletsCollection.updateOne(
          { userId: transaction.fundiId },
          { $inc: { balance: transaction.amount }, $set: { updatedAt: new Date() } },
          { upsert: true }
        );
      } else if (status === 'resolved_split') {
        txStatus = 'completed';
        bookingStatus = 'completed';
        // Handle percentage split between Client and Fundi
        const clientPct = splitPercentageClient || 50;
        const fundiPct = 100 - clientPct;
        
        const clientAmount = (transaction.amount * clientPct) / 100;
        const fundiAmount = (transaction.amount * fundiPct) / 100;

        const walletsCollection = await getCollection('wallets');
        if (clientAmount > 0) {
          await walletsCollection.updateOne(
            { userId: transaction.clientId },
            { $inc: { balance: clientAmount }, $set: { updatedAt: new Date() } },
            { upsert: true }
          );
        }
        if (fundiAmount > 0) {
          await walletsCollection.updateOne(
            { userId: transaction.fundiId },
            { $inc: { balance: fundiAmount }, $set: { updatedAt: new Date() } },
            { upsert: true }
          );
        }
      }

      await transactionsCollection.updateOne(
        { _id: transaction._id },
        { $set: { status: txStatus, updatedAt: new Date() } }
      );

      // 3. Update the booking status if any
      if (dispute.bookingId) {
        const bookingsCollection = await getCollection('bookings');
        await bookingsCollection.updateOne(
          { _id: dispute.bookingId },
          { $set: { status: bookingStatus, updatedAt: new Date() } }
        );
      }
    }

    return NextResponse.json({ message: 'Dispute resolved successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error resolving dispute:', error);
    return NextResponse.json({ error: 'Failed to resolve dispute' }, { status: 500 });
  }
}
