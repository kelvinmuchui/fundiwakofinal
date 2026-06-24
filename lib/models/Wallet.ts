import { ObjectId } from 'mongodb';

export interface Wallet {
  _id?: ObjectId;
  userId: string;           // Owner of the wallet (client or fundi)
  balance: number;          // Available balance in KES
  totalDeposited: number;   // Cumulative top-ups
  totalWithdrawn: number;   // Cumulative amount used for bookings
  createdAt: Date;
  updatedAt: Date;
}
