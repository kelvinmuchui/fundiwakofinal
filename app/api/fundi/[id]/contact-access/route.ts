import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { CONTACT_ACCESS_FEE, hasContactAccess } from '@/lib/contactAccess';
import { getCollection } from '@/lib/db';
import { MpesaClient } from '@/lib/mpesa';

async function getClientSession() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (user.role !== 'client') {
    return { response: NextResponse.json({ error: 'Only clients can unlock fundi contact details' }, { status: 403 }) };
  }

  return { user };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getClientSession();
    if ('response' in auth) return auth.response;

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid fundi ID' }, { status: 400 });
    }

    const usersCollection = await getCollection('users');
    const fundi = await usersCollection.findOne(
      { _id: new ObjectId(id), role: 'fundi' },
      { projection: { phone: 1 } }
    );
    if (!fundi) {
      return NextResponse.json({ error: 'Fundi not found' }, { status: 404 });
    }

    const unlocked = await hasContactAccess(auth.user.id!, id);
    return NextResponse.json({
      unlocked,
      ...(unlocked ? { phone: fundi.phone } : {}),
      fee: CONTACT_ACCESS_FEE,
    });
  } catch (error) {
    console.error('Get fundi contact access error:', error);
    return NextResponse.json({ error: 'Failed to check contact access' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getClientSession();
    if ('response' in auth) return auth.response;

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid fundi ID' }, { status: 400 });
    }

    const usersCollection = await getCollection('users');
    const fundi = await usersCollection.findOne(
      { _id: new ObjectId(id), role: 'fundi' },
      { projection: { phone: 1 } }
    );
    if (!fundi) {
      return NextResponse.json({ error: 'Fundi not found' }, { status: 404 });
    }

    if (await hasContactAccess(auth.user.id!, id)) {
      return NextResponse.json({ unlocked: true, phone: fundi.phone });
    }

    const body = await request.json();
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    if (!/^(\+254|0)[17]\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Enter a valid Kenyan M-Pesa number' },
        { status: 400 }
      );
    }

    const mpesaResult = await MpesaClient.initiateStkPush({
      phoneNumber: phone,
      amount: CONTACT_ACCESS_FEE,
      bookingId: `contact-${auth.user.id}-${id}`,
    });

    if (!mpesaResult.success || !mpesaResult.checkoutRequestID) {
      return NextResponse.json(
        { error: mpesaResult.error || 'M-Pesa payment initiation failed' },
        { status: 500 }
      );
    }

    const transactionsCollection = await getCollection('transactions');
    await transactionsCollection.insertOne({
      transactionType: 'contact_access',
      clientId: auth.user.id,
      fundiId: id,
      amount: CONTACT_ACCESS_FEE,
      status: 'pending',
      mpesaPhoneNumber: phone,
      checkoutRequestID: mpesaResult.checkoutRequestID,
      disbursementStatus: 'none',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      checkoutRequestID: mpesaResult.checkoutRequestID,
      message: mpesaResult.customerMessage,
      mock: mpesaResult.mock,
    });
  } catch (error) {
    console.error('Fundi contact payment error:', error);
    return NextResponse.json({ error: 'Failed to start contact-access payment' }, { status: 500 });
  }
}
