import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getCollection } from '@/lib/db';
import { logAuditAction } from '@/lib/auditLog';
import type { Message, Conversation } from '@/lib/models/Message';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const sendMessageSchema = z.object({
  toUserId: z.string().min(1),
  content: z.string().min(1).max(5000),
  replyTo: z.string().optional(),
  attachments: z.array(z.object({
    type: z.enum(['image', 'file', 'document']),
    url: z.string(),
    name: z.string(),
    size: z.number().optional()
  })).optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = sendMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { toUserId, content, replyTo, attachments } = validation.data;

    const usersCollection = await getCollection('users');
    const conversationsCollection = await getCollection('conversations');
    const messagesCollection = await getCollection('messages');

    // Get current user
    const currentUser = await usersCollection.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify recipient exists
    const recipient = await usersCollection.findOne({
      _id: new ObjectId(toUserId)
    });

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    const senderId = currentUser._id?.toString() || '';
    const [user1, user2] = [senderId, toUserId].sort();

    // Find or create conversation
    let conversation = await conversationsCollection.findOne({
      participants: [user1, user2]
    }) as (Conversation & { _id: ObjectId }) | null;

    if (!conversation) {
      const result = await conversationsCollection.insertOne({
        participants: [user1, user2] as [string, string],
        unreadCount: {
          [user1]: 0,
          [user2]: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      conversation = { _id: result.insertedId } as Conversation & { _id: ObjectId };
    }

    // Create message
    const message: Message = {
      conversationId: conversation._id.toString(),
      fromUserId: senderId,
      toUserId,
      content,
      attachments: attachments,
      read: false,
      edited: false,
      replyTo,
      status: 'sent',
      createdAt: new Date()
    };

    const messageResult = await messagesCollection.insertOne(message);

    // Update conversation
    await conversationsCollection.updateOne(
      { _id: conversation._id },
      {
        $set: {
          lastMessage: content,
          lastMessageAt: new Date(),
          lastMessageSenderId: senderId,
          updatedAt: new Date()
        },
        $inc: { [`unreadCount.${toUserId}`]: 1 }
      }
    );

    // Log audit action
    await logAuditAction(
      'message_sent',
      senderId,
      {
        targetUserId: toUserId,
        status: 'success',
        metadata: { conversationId: conversation._id?.toString() }
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: message,
        messageId: messageResult.insertedId,
        conversationId: conversation._id?.toString()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usersCollection = await getCollection('users');

    // Get current user
    const currentUser = await usersCollection.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = currentUser._id?.toString();

    // Get all conversations for user
    const conversationsCollection = await getCollection('conversations');
    const conversations = await conversationsCollection
      .find({
        participants: { $in: [userId] }
      })
      .sort({ updatedAt: -1 })
      .toArray();

    // Enrich conversations with participant info
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.participants[0] === userId ? conv.participants[1] : conv.participants[0];
        const otherUser = await usersCollection.findOne(
          { _id: new ObjectId(otherUserId) },
          {
            projection: {
              name: 1,
              photoURL: 1,
              headline: 1,
              role: 1,
              isVerified: 1
            }
          }
        );

        return {
          ...conv,
          otherUser,
          unreadCount: conv.unreadCount?.[userId] || 0
        };
      })
    );

    return NextResponse.json({
      conversations: enrichedConversations,
      count: conversations.length
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
