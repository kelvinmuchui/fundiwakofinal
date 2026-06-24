import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { logActivity } from '@/lib/activityLogger';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('[M-PESA CALLBACK RECEIVED]:', JSON.stringify(payload, null, 2));

    const callbackData = payload?.Body?.stkCallback;
    if (!callbackData) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid payload structure' }, { status: 400 });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc } = callbackData;

    const transactionsCollection = await getCollection('transactions');
    const bookingsCollection = await getCollection('bookings');
    const walletsCollection = await getCollection('wallets');

    // Find the corresponding transaction
    const transaction = await transactionsCollection.findOne({ checkoutRequestID: CheckoutRequestID });

    if (!transaction) {
      console.warn(`[M-PESA CALLBACK WARNING]: Transaction not found for CheckoutRequestID: ${CheckoutRequestID}`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Callback received but transaction not found' });
    }

    const isTopUp = transaction.transactionType === 'wallet_topup';

    if (ResultCode === 0) {
      // ── PAYMENT SUCCESSFUL ──────────────────────────────────────────────
      let mpesaReceiptNumber = '';
      let amountPaid = transaction.amount;

      const metadataItems = callbackData.CallbackMetadata?.Item || [];
      for (const item of metadataItems) {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value;
        if (item.Name === 'Amount') amountPaid = Number(item.Value);
      }

      if (isTopUp) {
        // ── WALLET TOP-UP SUCCESS ──────────────────────────────────────────
        console.log(`[M-PESA CALLBACK] Wallet top-up of KES ${amountPaid} for user ${transaction.clientId} (Receipt: ${mpesaReceiptNumber})`);

        // Mark transaction as completed
        await transactionsCollection.updateOne(
          { _id: transaction._id },
          {
            $set: {
              status: 'completed',
              mpesaReceiptNumber,
              paymentDate: new Date(),
              updatedAt: new Date(),
            },
          }
        );

        // Credit user wallet — upsert in case wallet doesn't exist yet
        await walletsCollection.updateOne(
          { userId: transaction.clientId },
          {
            $inc: { balance: amountPaid, totalDeposited: amountPaid },
            $set: { updatedAt: new Date() },
            $setOnInsert: { createdAt: new Date(), totalWithdrawn: 0 },
          },
          { upsert: true }
        );

        // Log activity
        try {
          await logActivity(
            transaction.clientId,
            'wallet_topup_success',
            'Wallet Topped Up',
            `Wallet credited with KES ${amountPaid}. M-Pesa receipt: ${mpesaReceiptNumber}`,
            { metadata: { amount: amountPaid, mpesaReceiptNumber } }
          );
        } catch (logError) {
          console.error('Failed to log top-up success activity:', logError);
        }

      } else {
        // ── BOOKING ESCROW PAYMENT SUCCESS ────────────────────────────────
        const bookingId = transaction.bookingId;
        console.log(`[M-PESA CALLBACK] Booking ${bookingId} escrow paid KES ${amountPaid} (Receipt: ${mpesaReceiptNumber})`);

        // Update transaction to 'held'
        await transactionsCollection.updateOne(
          { _id: transaction._id },
          {
            $set: {
              status: 'held',
              mpesaReceiptNumber,
              paymentDate: new Date(),
              updatedAt: new Date(),
            },
          }
        );

        // Update booking: status → in_progress, paymentStatus → escrowed
        await bookingsCollection.updateOne(
          { _id: new ObjectId(bookingId) },
          {
            $set: {
              status: 'in_progress',
              paymentStatus: 'escrowed',
              updatedAt: new Date(),
            },
          }
        );

        // Log activities for client and fundi
        try {
          await logActivity(
            transaction.clientId,
            'payment_success',
            'Escrow Payment Secured',
            `Payment of KES ${amountPaid} secured in escrow. Receipt: ${mpesaReceiptNumber}`,
            {
              relatedUserId: transaction.fundiId,
              metadata: { bookingId: bookingId?.toString(), amount: amountPaid, mpesaReceiptNumber },
            }
          );
          if (transaction.fundiId) {
            await logActivity(
              transaction.fundiId,
              'job_activated',
              'Job Activated — Escrow Funded',
              `Client paid KES ${amountPaid} to escrow. You can now start the work.`,
              {
                relatedUserId: transaction.clientId,
                metadata: { bookingId: bookingId?.toString(), amount: amountPaid },
              }
            );
          }
        } catch (logError) {
          console.error('Failed to log booking payment activity:', logError);
        }
      }

    } else {
      // ── PAYMENT FAILED ─────────────────────────────────────────────────
      console.warn(`[M-PESA CALLBACK FAILED]: ${CheckoutRequestID} failed (code ${ResultCode}): ${ResultDesc}`);

      await transactionsCollection.updateOne(
        { _id: transaction._id },
        { $set: { status: 'failed', updatedAt: new Date() } }
      );

      if (!isTopUp && transaction.bookingId) {
        await bookingsCollection.updateOne(
          { _id: new ObjectId(transaction.bookingId) },
          { $set: { paymentStatus: 'unpaid', updatedAt: new Date() } }
        );
      }

      try {
        await logActivity(
          transaction.clientId,
          isTopUp ? 'wallet_topup_failed' : 'payment_failed',
          isTopUp ? 'Top-Up Failed' : 'Payment Attempt Failed',
          `M-Pesa ${isTopUp ? 'top-up' : 'payment'} of KES ${transaction.amount} failed. Reason: ${ResultDesc}`,
          {
            relatedUserId: transaction.fundiId,
            metadata: { checkoutRequestID: CheckoutRequestID, resultCode: ResultCode, resultDesc: ResultDesc },
          }
        );
      } catch (logError) {
        console.error('Failed to log payment failure activity:', logError);
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Callback processed successfully' });

  } catch (error: any) {
    console.error('Callback Route Error:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: error.message || 'Internal error' }, { status: 400 });
  }
}
