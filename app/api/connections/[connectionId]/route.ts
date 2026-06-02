import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getCollection } from '@/lib/db';
import { logAuditAction } from '@/lib/auditLog';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body; // 'accept' or 'reject'
    const { connectionId } = await params;

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use "accept" or "reject"' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection('users');
    const connectionsCollection = await getCollection('connections');

    // Get current user
    const currentUser = await usersCollection.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get connection request
    const connection = await connectionsCollection.findOne({
      _id: new ObjectId(connectionId),
      connectedUserId: currentUser._id?.toString()
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection request not found' },
        { status: 404 }
      );
    }

    if (connection.status !== 'pending') {
      return NextResponse.json(
        { error: 'Connection request is no longer pending' },
        { status: 400 }
      );
    }

    let updateData: any = {
      status: action === 'accept' ? 'accepted' : 'rejected',
      updatedAt: new Date()
    };

    if (action === 'accept') {
      updateData.acceptedAt = new Date();
    } else {
      updateData.rejectedAt = new Date();
    }

    // Update connection status
    await connectionsCollection.updateOne(
      { _id: new ObjectId(connectionId) },
      { $set: updateData }
    );

    // If accepted, update user connection arrays
    if (action === 'accept') {
      // Add to accepted connections in User model
      await usersCollection.updateOne(
        { _id: new ObjectId(connection.userId) },
        { $push: { connections: currentUser._id?.toString() } } as any
      );

      await usersCollection.updateOne(
        { _id: currentUser._id },
        { $push: { connections: connection.userId } } as any
      );
    }

    // Log audit action
    await logAuditAction(
      `connection_${action}ed`,
      currentUser._id?.toString() || '',
      {
        targetUserId: connection.userId,
        status: 'success',
        changeDetails: {
          connectionId,
          action
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: `Connection request ${action}ed`,
      connection: updateData
    });
  } catch (error) {
    console.error('Connection response error:', error);
    return NextResponse.json(
      { error: 'Failed to respond to connection request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usersCollection = await getCollection('users');
    const connectionsCollection = await getCollection('connections');

    // Get current user
    const currentUser = await usersCollection.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = currentUser._id?.toString();
    const { connectionId } = await params;

    // Get connection
    const connection = await connectionsCollection.findOne({
      $or: [
        { _id: new ObjectId(connectionId), userId },
        { _id: new ObjectId(connectionId), connectedUserId: userId }
      ]
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    const targetUserId = connection.userId === userId ? connection.connectedUserId : connection.userId;

    // Mark connection as removed
    await connectionsCollection.updateOne(
      { _id: new ObjectId(connectionId) },
      { $set: { status: 'removed', updatedAt: new Date() } }
    );

    // Remove from user connection arrays
    await usersCollection.updateOne(
      { _id: currentUser._id },
      { $pull: { connections: targetUserId } } as any
    );

    await usersCollection.updateOne(
      { _id: new ObjectId(targetUserId) },
      { $pull: { connections: userId } } as any
    );

    // Log audit action
    await logAuditAction('connection_removed', userId || '', {
      targetUserId,
      status: 'success'
    });

    return NextResponse.json({
      success: true,
      message: 'Connection removed'
    });
  } catch (error) {
    console.error('Remove connection error:', error);
    return NextResponse.json(
      { error: 'Failed to remove connection' },
      { status: 500 }
    );
  }
}
