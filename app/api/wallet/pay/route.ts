import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';
import { logActivity } from '@/lib/activityLogger';

/**
 * POST /api/wallet/pay
 * Deducts amount from user's wallet balance and moves funds into escrow for a booking.
 * No M-Pesa STK Push required — instant payment from pre-funded wallet.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string } | undefined;

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // 1. Fetch the booking
    const bookingsCollection = await getCollection('bookings');
    let booking;
    try {
      booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
    } catch {
      return NextResponse.json({ error: 'Invalid Booking ID' }, { status: 400 });
    }

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.clientId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (booking.status !== 'accepted') {
      return NextResponse.json({ error: 'Escrow can only be funded after the fundi accepts the booking' }, { status: 409 });
    }

    if (!booking.quoteAmount || booking.quoteAmount <= 0) {
      return NextResponse.json({ error: 'This booking does not have a confirmed quote yet' }, { status: 400 });
    }

    if (booking.paymentStatus === 'escrowed' || booking.paymentStatus === 'released') {
      return NextResponse.json({ error: 'This booking has already been paid' }, { status: 400 });
    }

    const transactionsCollection = await getCollection('transactions');
    const existingPayment = await transactionsCollection.findOne({
      bookingId: new ObjectId(bookingId),
      status: { $in: ['pending', 'held'] }
    });
    if (existingPayment) {
      return NextResponse.json({ error: 'A payment request is already in progress or funded for this booking' }, { status: 409 });
    }

    const amountRequired = booking.quoteAmount;

    // 2. Check wallet balance
    const walletsCollection = await getCollection('wallets');
    const wallet = await walletsCollection.findOne({ userId: user.id });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found. Please top up your wallet first.' }, { status: 400 });
    }

    if (wallet.balance < amountRequired) {
      return NextResponse.json({
        error: `Insufficient wallet balance. You need KES ${amountRequired.toLocaleString()} but your balance is KES ${wallet.balance.toLocaleString()}.`,
        required: amountRequired,
        balance: wallet.balance,
      }, { status: 400 });
    }

    // 3. Deduct from wallet balance
    const debitResult = await walletsCollection.updateOne(
      { userId: user.id, balance: { $gte: amountRequired } },
      {
        $inc: { balance: -amountRequired, totalWithdrawn: amountRequired },
        $set: { updatedAt: new Date() },
      }
    );
    if (debitResult.modifiedCount !== 1) {
      return NextResponse.json({ error: 'Wallet balance changed. Please refresh and try again.' }, { status: 409 });
    }

    // 4. Create an 'held' transaction (already escrowed — no M-Pesa needed)
    await transactionsCollection.insertOne({
      transactionType: 'booking_escrow',
      bookingId: new ObjectId(bookingId),
      clientId: user.id,
      fundiId: booking.fundiId,
      amount: amountRequired,
      status: 'held',
      mpesaPhoneNumber: 'wallet', // indicates payment was from wallet, not direct M-Pesa
      mpesaReceiptNumber: `WALLET-${Date.now()}`,
      paymentDate: new Date(),
      disbursementStatus: 'none',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Keep the accepted status until the fundi explicitly starts the funded job.
    await bookingsCollection.updateOne(
      { _id: new ObjectId(bookingId), status: 'accepted', paymentStatus: { $ne: 'escrowed' } },
      {
        $set: {
          paymentStatus: 'escrowed',
          updatedAt: new Date(),
        },
      }
    );

    // 6. Log activities
    try {
      await logActivity(
        user.id,
        'payment_success',
        'Escrow Funded from Wallet',
        `Paid KES ${amountRequired} from wallet to escrow for booking`,
        {
          relatedUserId: booking.fundiId,
          metadata: { bookingId, amount: amountRequired },
        }
      );
      await logActivity(
        booking.fundiId,
        'job_activated',
        'Job Funded — Escrow Ready',
        `Client funded KES ${amountRequired} from their wallet. You can start the work.`,
        {
          relatedUserId: user.id,
          metadata: { bookingId, amount: amountRequired },
        }
      );
    } catch (logError) {
      console.error('Failed to log wallet payment activities:', logError);
    }

    return NextResponse.json({
      success: true,
      message: `KES ${amountRequired.toLocaleString()} deducted from wallet and held in escrow.`,
      newBalance: wallet.balance - amountRequired,
    });
  } catch (error) {
    console.error('Wallet Pay Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
