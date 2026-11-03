import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MpesaClient } from '@/lib/mpesa';
import { logActivity } from '@/lib/activityLogger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string } | undefined;

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
    } catch {
      return NextResponse.json({ error: 'Invalid Booking ID format' }, { status: 400 });
    }

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Ensure the requester is the client of the booking
    if (booking.clientId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. You are not authorized to pay for this booking.' }, { status: 403 });
    }

    if (booking.status !== 'accepted') {
      return NextResponse.json({ error: 'Escrow can only be funded after the fundi accepts the booking' }, { status: 409 });
    }
    if (booking.paymentStatus === 'escrowed' || booking.paymentStatus === 'released') {
      return NextResponse.json({ error: 'This booking has already been funded' }, { status: 409 });
    }
    if (typeof booking.quoteAmount !== 'number' || !Number.isFinite(booking.quoteAmount) || booking.quoteAmount <= 0) {
      return NextResponse.json({ error: 'This booking does not have a valid confirmed quote' }, { status: 400 });
    }

    const paymentAmount = Number(amount);
    if (!Number.isInteger(paymentAmount) || paymentAmount !== booking.quoteAmount) {
      return NextResponse.json({ error: 'Payment must match the fundi’s agreed quote' }, { status: 400 });
    }

    const transactionsCollection = await getCollection('transactions');
    const pendingPayment = await transactionsCollection.findOne({
      bookingId: new ObjectId(bookingId),
      status: { $in: ['pending', 'held'] }
    });
    if (pendingPayment) {
      return NextResponse.json({ error: 'A payment request is already in progress or funded for this booking' }, { status: 409 });
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
    await transactionsCollection.insertOne({
      transactionType: 'booking_escrow',
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

  } catch (error) {
    console.error('STK Push API Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
