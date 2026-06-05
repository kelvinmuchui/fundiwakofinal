import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getCollection } from '@/lib/db';
import { logAuditAction } from '@/lib/auditLog';
import type { Connection } from '@/lib/models/Connection';
import type { User } from '@/lib/models/User';
import { ObjectId } from 'mongodb';

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
    const { targetUserId, message, relationship } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
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

    // Verify target user exists
    const targetUser = await usersCollection.findOne({
      _id: new ObjectId(targetUserId)
    });
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }

    // Check if already connected
    const existingConnection = await connectionsCollection.findOne({
      $or: [
        { userId: currentUser._id?.toString(), connectedUserId: targetUserId },
        { userId: targetUserId, connectedUserId: currentUser._id?.toString() }
      ]
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Connection already exists' },
        { status: 400 }
      );
    }

    // Create connection request
    const connection: Connection = {
      userId: currentUser._id?.toString() || '',
      connectedUserId: targetUserId,
      status: 'pending',
      requestedAt: new Date(),
      relationship: relationship || 'colleague',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await connectionsCollection.insertOne(connection);

    // Log audit action
    await logAuditAction(
      'connection_request_sent',
      currentUser._id?.toString() || '',
      {
        targetUserId,
        status: 'success',
        metadata: {
          relationship
        }
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Connection request sent',
        connectionId: result.insertedId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Connection request error:', error);
    return NextResponse.json(
      { error: 'Failed to send connection request' },
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

    // Get pending requests
    const pendingRequests = await connectionsCollection
      .find({
        connectedUserId: userId,
        status: 'pending'
      })
      .toArray();

    // Get sent requests
    const sentRequests = await connectionsCollection
      .find({
        userId: userId,
        status: 'pending'
      })
      .toArray();

    // Get accepted connections
    const acceptedConnections = await connectionsCollection
      .find({
        $or: [
          { userId: userId, status: 'accepted' },
          { connectedUserId: userId, status: 'accepted' }
        ]
      })
      .toArray();

    // Get connection details with user info
    const getConnectionDetails = async (connections: any[]) => {
      return Promise.all(
        connections.map(async (conn) => {
          const connectedId = conn.userId === userId ? conn.connectedUserId : conn.userId;
          const user = await usersCollection.findOne(
            { _id: new ObjectId(connectedId) },
            {
              projection: {
                name: 1,
                photoURL: 1,
                headline: 1,
                role: 1,
                rating: 1,
                jobsCompleted: 1
              }
            }
          );
          return {
            ...conn,
            user
          };
        })
      );
    };

    const pendingDetails = await getConnectionDetails(pendingRequests);
    const sentDetails = await getConnectionDetails(sentRequests);
    const acceptedDetails = await getConnectionDetails(acceptedConnections);

    return NextResponse.json({
      pending: pendingDetails,
      sent: sentDetails,
      accepted: acceptedDetails,
      stats: {
        totalConnections: acceptedConnections.length,
        pendingRequests: pendingRequests.length
      }
    });
  } catch (error) {
    console.error('Get connections error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}
