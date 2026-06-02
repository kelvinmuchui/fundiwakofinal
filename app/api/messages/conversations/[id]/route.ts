import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const { id } = await params;
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

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

    // Verify user is part of conversation
    const conversation = await conversationsCollection.findOne({
      _id: new ObjectId(id),
      participants: { $in: [currentUser._id?.toString()] }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Get messages
    const totalMessages = await messagesCollection.countDocuments({
      conversationId: id
    });

    const messages = await messagesCollection
      .find({ conversationId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Mark all messages as read
    await messagesCollection.updateMany(
      {
        conversationId: id,
        toUserId: currentUser._id?.toString(),
        read: false
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
          status: 'read',
          updatedAt: new Date()
        }
      }
    );

    // Reset unread count
    await conversationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { [`unreadCount.${currentUser._id?.toString()}`]: 0 } }
    );

    return NextResponse.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        skip,
        limit,
        total: totalMessages,
        hasMore: skip + limit < totalMessages
      },
      conversation: {
        _id: conversation._id,
        participants: conversation.participants,
        unreadCount: conversation.unreadCount
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
