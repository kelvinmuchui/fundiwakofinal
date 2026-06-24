import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import axios from 'axios';

const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkoutRequestID, status } = body;

    if (!checkoutRequestID) {
      return NextResponse.json({ error: 'checkoutRequestID is required' }, { status: 400 });
    }

    const transactionsCollection = await getCollection('transactions');
    const transaction = await transactionsCollection.findOne({ checkoutRequestID });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found for this checkoutRequestID' }, { status: 404 });
    }

    const amount = transaction.amount;
    const phone = transaction.mpesaPhoneNumber;

    const callbackUrl = `${NEXTAUTH_URL}/api/payments/callback`;

    // Construct callback payload
    let payload;
    if (status === 'failure') {
      payload = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'sim_MR_' + Math.random().toString(36).substring(2, 10),
            CheckoutRequestID: checkoutRequestID,
            ResultCode: 1032,
            ResultDesc: 'Simulated failure: Request cancelled by user.'
          }
        }
      };
    } else {
      payload = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'sim_MR_' + Math.random().toString(36).substring(2, 10),
            CheckoutRequestID: checkoutRequestID,
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully.',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: amount },
                { Name: 'MpesaReceiptNumber', Value: 'SIM' + Math.random().toString(36).substring(2, 9).toUpperCase() },
                { Name: 'Balance', Value: 0 },
                { Name: 'TransactionDate', Value: Date.now() },
                { Name: 'PhoneNumber', Value: Number(phone) }
              ]
            }
          }
        }
      };
    }

    // Call the callback route directly
    const callbackResponse = await axios.post(callbackUrl, payload);

    return NextResponse.json({
      success: true,
      message: `Simulated callback sent to ${callbackUrl}`,
      callbackResponse: callbackResponse.data
    });

  } catch (error: any) {
    console.error('Simulated Callback Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
