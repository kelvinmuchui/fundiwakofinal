import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function PUT(
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

    const usersCollection = await getCollection('users');
    const messagesCollection = await getCollection('messages');

    // Get current user
    const currentUser = await usersCollection.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify message ownership
    const message = await messagesCollection.findOne({
      _id: new ObjectId(id),
      toUserId: currentUser._id?.toString()
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Mark as read
    await messagesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          read: true,
          readAt: new Date(),
          status: 'read',
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const usersCollection = await getCollection('users');
    const messagesCollection = await getCollection('messages');

    // Get current user
    const currentUser = await usersCollection.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify message ownership (can only delete own messages within 1 minute)
    const message = await messagesCollection.findOne({
      _id: new ObjectId(id),
      fromUserId: currentUser._id?.toString()
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found or you cannot delete it' },
        { status: 404 }
      );
    }

    // Check if message is older than 1 minute (optional check)
    const messageAge = Date.now() - message.createdAt.getTime();
    if (messageAge > 60000) { // 60 seconds
      return NextResponse.json(
        { error: 'Cannot delete messages older than 1 minute' },
        { status: 400 }
      );
    }

    // Soft delete - just mark as deleted
    await messagesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          content: '[deleted]',
          deleted: true,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
