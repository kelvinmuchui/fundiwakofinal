import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { MpesaClient } from '@/lib/mpesa';
import { logActivity } from '@/lib/activityLogger';

/**
 * POST /api/wallet/topup
 * Initiates an M-Pesa STK Push to top up the user's escrow wallet balance.
 * On successful payment (via callback), the wallet balance is incremented.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phone, amount } = body;

    if (!phone || !amount) {
      return NextResponse.json({ error: 'Phone number and amount are required' }, { status: 400 });
    }

    const topupAmount = Number(amount);
    if (isNaN(topupAmount) || topupAmount < 1) {
      return NextResponse.json({ error: 'Amount must be at least KES 1' }, { status: 400 });
    }

    // Initiate STK Push — use userId as the reference since there's no bookingId
    const mpesaResult = await MpesaClient.initiateStkPush({
      phoneNumber: phone,
      amount: topupAmount,
      bookingId: `topup-${user.id}`, // reference identifier for Safaricom AccountReference
    });

    if (!mpesaResult.success) {
      return NextResponse.json({ error: mpesaResult.error || 'Failed to initiate M-Pesa top-up' }, { status: 500 });
    }

    // Record the pending top-up transaction
    const transactionsCollection = await getCollection('transactions');
    await transactionsCollection.insertOne({
      transactionType: 'wallet_topup',
      clientId: user.id,
      amount: topupAmount,
      status: 'pending',
      mpesaPhoneNumber: phone,
      checkoutRequestID: mpesaResult.checkoutRequestID,
      disbursementStatus: 'none',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Log activity
    try {
      await logActivity(
        user.id,
        'wallet_topup_initiated',
        'Wallet Top-Up Initiated',
        `Initiated M-Pesa top-up of KES ${topupAmount} to escrow wallet`,
        { metadata: { amount: topupAmount, phone, checkoutRequestID: mpesaResult.checkoutRequestID } }
      );
    } catch (logError) {
      console.error('Failed to log top-up activity:', logError);
    }

    return NextResponse.json({
      success: true,
      checkoutRequestID: mpesaResult.checkoutRequestID,
      message: mpesaResult.customerMessage,
      mock: mpesaResult.mock,
    });
  } catch (error: any) {
    console.error('Wallet Top-Up Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
