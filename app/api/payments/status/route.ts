import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const checkoutRequestID = searchParams.get('checkoutRequestID');
    const bookingId = searchParams.get('bookingId');

    if (!checkoutRequestID && !bookingId) {
      return NextResponse.json({ error: 'Either checkoutRequestID or bookingId is required' }, { status: 400 });
    }

    const transactionsCollection = await getCollection('transactions');
    let transaction = null;

    if (checkoutRequestID) {
      transaction = await transactionsCollection.findOne({ checkoutRequestID });
    } else if (bookingId) {
      try {
        // Get the latest transaction for the booking
        const query = { bookingId: new ObjectId(bookingId) };
        transaction = await transactionsCollection
          .find(query)
          .sort({ createdAt: -1 })
          .limit(1)
          .next();
      } catch (e) {
        return NextResponse.json({ error: 'Invalid bookingId format' }, { status: 400 });
      }
    }

    if (!transaction) {
      return NextResponse.json({ status: 'not_found' });
    }

    return NextResponse.json({
      status: transaction.status,
      amount: transaction.amount,
      checkoutRequestID: transaction.checkoutRequestID,
      mpesaReceiptNumber: transaction.mpesaReceiptNumber,
      disbursementStatus: transaction.disbursementStatus,
      disbursementReceiptNumber: transaction.disbursementReceiptNumber,
      updatedAt: transaction.updatedAt,
    });

  } catch (error: any) {
    console.error('Status Polling Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
