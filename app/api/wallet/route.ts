import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

/**
 * GET /api/wallet
 * Returns the authenticated user's wallet balance and totals.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const walletsCollection = await getCollection('wallets');
    let wallet = await walletsCollection.findOne({ userId: user.id });

    // Auto-create wallet on first access
    if (!wallet) {
      const now = new Date();
      const result = await walletsCollection.insertOne({
        userId: user.id,
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        createdAt: now,
        updatedAt: now,
      });
      wallet = {
        _id: result.insertedId,
        userId: user.id,
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        createdAt: now,
        updatedAt: now,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: wallet.balance,
        totalDeposited: wallet.totalDeposited,
        totalWithdrawn: wallet.totalWithdrawn,
      },
    });
  } catch (error: any) {
    console.error('Wallet GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
