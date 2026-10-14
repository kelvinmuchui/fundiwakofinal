import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCollection } from '@/lib/db';
import type { Conversation } from '@/lib/models/Message';
import type { User } from '@/lib/models/User';

const openConversationSchema = z.object({
  userId: z.string().refine(ObjectId.isValid, 'Invalid recipient ID'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id || !ObjectId.isValid(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!['client', 'fundi'].includes(user.role ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const validation = openConversationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'A valid client ID is required' }, { status: 400 });
    }

    const recipientId = validation.data.userId;
    if (recipientId === user.id) {
      return NextResponse.json({ error: 'You cannot start a conversation with yourself' }, { status: 400 });
    }

    const users = await getCollection<User>('users');
    const recipient = await users.findOne(
      { _id: new ObjectId(recipientId), role: { $in: ['client', 'fundi'] } },
      { projection: { _id: 1 } },
    );
    if (!recipient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const participants = [user.id, recipientId].sort() as [string, string];
    const conversations = await getCollection<Conversation>('conversations');
    const existing = await conversations.findOne({ participants });
    if (existing?._id) {
      return NextResponse.json({ conversationId: existing._id.toString() });
    }

    const result = await conversations.insertOne({
      participants,
      unreadCount: { [user.id]: 0, [recipientId]: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ conversationId: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    console.error('Error opening message conversation:', error);
    return NextResponse.json({ error: 'Failed to open conversation' }, { status: 500 });
  }
}
