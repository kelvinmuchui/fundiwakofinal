import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MpesaClient } from '@/lib/mpesa';
import { decryptDataSafe } from '@/lib/encryption';
import { logActivity } from '@/lib/activityLogger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // 1. Fetch booking
    const bookingsCollection = await getCollection('bookings');
    let booking;
    try {
      booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
    } catch (e) {
      return NextResponse.json({ error: 'Invalid Booking ID format' }, { status: 400 });
    }

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 2. Authorization check: only client or admin can release the funds
    if (booking.clientId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Only the client or admin can release funds.' }, { status: 403 });
    }

    // 3. Fetch transaction
    const transactionsCollection = await getCollection('transactions');
    const transaction = await transactionsCollection.findOne({
      bookingId: new ObjectId(bookingId),
      status: 'held'
    });

    if (!transaction) {
      return NextResponse.json({ error: 'No active escrow payment found for this booking (must be in "held" status).' }, { status: 400 });
    }

    // 4. Fetch Fundi details to get their payout phone number
    const usersCollection = await getCollection('users');
    const fundi = await usersCollection.findOne({ _id: new ObjectId(booking.fundiId) });

    if (!fundi) {
      return NextResponse.json({ error: 'Fundi user profile not found' }, { status: 404 });
    }

    // Get Fundi's payment M-Pesa number (decrypt if encrypted)
    let fundiMpesaPhone = fundi.mpesaNumber || decryptDataSafe(fundi.mpesaNumberEncrypted);
    
    if (!fundiMpesaPhone) {
      // Fallback to standard phone number
      fundiMpesaPhone = fundi.phone || decryptDataSafe(fundi.phoneEncrypted);
    }

    if (!fundiMpesaPhone) {
      return NextResponse.json({ error: 'Fundi does not have a registered M-Pesa phone number' }, { status: 400 });
    }

    // 5. Trigger disbursement via M-Pesa client
    const payoutResult = await MpesaClient.initiatePayout({
      phoneNumber: fundiMpesaPhone,
      amount: transaction.amount,
      bookingId: bookingId,
    });

    if (!payoutResult.success) {
      return NextResponse.json({ error: payoutResult.error || 'M-Pesa payout failed' }, { status: 500 });
    }

    // If it's a simulated payout (sandbox/mock), we immediately record success
    if (payoutResult.mock) {
      // Update transaction status to released
      await transactionsCollection.updateOne(
        { _id: transaction._id },
        {
          $set: {
            status: 'released',
            disbursementStatus: 'success',
            disbursementReceiptNumber: payoutResult.receipt,
            disbursementPhone: fundiMpesaPhone,
            disbursementDate: new Date(),
            updatedAt: new Date()
          }
        }
      );

      // Update Booking status to completed and paymentStatus to released
      await bookingsCollection.updateOne(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            status: 'completed',
            paymentStatus: 'released',
            updatedAt: new Date()
          }
        }
      );

      // Log Activities
      try {
        await logActivity(
          booking.clientId,
          'payment_released',
          'Escrow Funds Released',
          `Released KES ${transaction.amount} from escrow to fundi ${fundi.name}`,
          {
            relatedUserId: booking.fundiId,
            metadata: {
              bookingId,
              amount: transaction.amount,
              receipt: payoutResult.receipt
            }
          }
        );

        await logActivity(
          booking.fundiId,
          'payment_received',
          'Payment Disbursed to M-Pesa',
          `Received KES ${transaction.amount} from booking. M-Pesa Receipt: ${payoutResult.receipt}`,
          {
            relatedUserId: booking.clientId,
            metadata: {
              bookingId,
              amount: transaction.amount,
              receipt: payoutResult.receipt
            }
          }
        );
      } catch (logError) {
        console.error('Failed to log payout activities:', logError);
      }

      return NextResponse.json({
        success: true,
        status: 'released',
        receipt: payoutResult.receipt,
        message: 'Funds released successfully and sent to fundi via M-Pesa.'
      });
    }

    // If real async payout: mark disbursement as pending
    await transactionsCollection.updateOne(
      { _id: transaction._id },
      {
        $set: {
          disbursementStatus: 'pending',
          disbursementPhone: fundiMpesaPhone,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      status: 'pending',
      message: 'Payout request sent to Safaricom for processing. The status will update once Safaricom processes the transaction.'
    });

  } catch (error: any) {
    console.error('Payout Release API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
