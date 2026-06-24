import { ObjectId } from 'mongodb';

export type TransactionType = 'booking_escrow' | 'wallet_topup';

export interface Transaction {
  _id?: ObjectId;
  transactionType: TransactionType;  // Distinguishes top-ups from booking payments
  bookingId?: ObjectId;              // Only set for booking_escrow transactions
  clientId: string;                  // Initiating user ID
  fundiId?: string;                  // Only set for booking_escrow transactions
  amount: number;                    // Transaction amount in KES
  status: 'pending' | 'held' | 'released' | 'refunded' | 'failed' | 'completed';

  // STK Push details
  mpesaPhoneNumber: string;
  checkoutRequestID?: string;
  mpesaReceiptNumber?: string;
  paymentDate?: Date;

  // Payout details (booking_escrow only)
  disbursementStatus: 'none' | 'pending' | 'success' | 'failed';
  disbursementReceiptNumber?: string;
  disbursementPhone?: string;
  disbursementDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

