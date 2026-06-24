import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { MpesaClient } from '@/lib/mpesa';
import { logActivity } from '@/lib/activityLogger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, phone, amount } = body;

    if (!bookingId || !phone) {
      return NextResponse.json({ error: 'Booking ID and M-Pesa phone number are required' }, { status: 400 });
    }

    // Retrieve booking
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

    // Ensure the requester is the client of the booking
    if (booking.clientId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. You are not authorized to pay for this booking.' }, { status: 403 });
    }

    // Determine payment amount
    const paymentAmount = Number(amount || booking.quoteAmount || 1000); // fallback to 1000 KES if not set
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    // Trigger STK Push via M-Pesa client
    const mpesaResult = await MpesaClient.initiateStkPush({
      phoneNumber: phone,
      amount: paymentAmount,
      bookingId,
    });

    if (!mpesaResult.success) {
      return NextResponse.json({ error: mpesaResult.error || 'M-Pesa payment initiation failed' }, { status: 500 });
    }

    // Create a transaction record in database
    const transactionsCollection = await getCollection('transactions');
    await transactionsCollection.insertOne({
      bookingId: new ObjectId(bookingId),
      clientId: booking.clientId,
      fundiId: booking.fundiId,
      amount: paymentAmount,
      status: 'pending',
      mpesaPhoneNumber: phone,
      checkoutRequestID: mpesaResult.checkoutRequestID,
      disbursementStatus: 'none',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update booking status
    await bookingsCollection.updateOne(
      { _id: new ObjectId(bookingId) },
      { 
        $set: { 
          quoteAmount: paymentAmount,
          paymentStatus: 'unpaid',
          updatedAt: new Date()
        } 
      }
    );

    // Log Activity
    try {
      await logActivity(
        user.id,
        'payment_initiated',
        'M-Pesa Payment Initiated',
        `Initiated escrow payment of KES ${paymentAmount} via M-Pesa STK Push`,
        {
          relatedUserId: booking.fundiId,
          metadata: {
            bookingId,
            amount: paymentAmount,
            phone,
            checkoutRequestID: mpesaResult.checkoutRequestID,
          }
        }
      );
    } catch (logError) {
      console.error('Failed to log payment activity:', logError);
    }

    return NextResponse.json({
      success: true,
      message: mpesaResult.customerMessage,
      checkoutRequestID: mpesaResult.checkoutRequestID,
      mock: mpesaResult.mock,
    });

  } catch (error: any) {
    console.error('STK Push API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
