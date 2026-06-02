import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getCollection } from '@/lib/db';
import { logAuditAction } from '@/lib/auditLog';
import type { Recommendation, RecommendationRequest } from '@/lib/models/Recommendation';
import { ObjectId } from 'mongodb';

// Request a recommendation
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
    const { toUserId, message, relationship } = body;

    if (!toUserId) {
      return NextResponse.json(
        { error: 'To user ID is required' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection('users');
    const recommendationRequestsCollection = await getCollection('recommendationRequests');

    // Get current user
    const currentUser = await usersCollection.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify recipient exists
    const recipientUser = await usersCollection.findOne({
      _id: new ObjectId(toUserId)
    });

    if (!recipientUser) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Check if users are connected
    const connection = await getCollection('connections').findOne({
      $or: [
        { userId: currentUser._id?.toString(), connectedUserId: toUserId, status: 'accepted' },
        { userId: toUserId, connectedUserId: currentUser._id?.toString(), status: 'accepted' }
      ]
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'You must be connected to request a recommendation' },
        { status: 403 }
      );
    }

    // Check for existing pending request
    const existingRequest = await recommendationRequestsCollection.findOne({
      fromUserId: currentUser._id?.toString(),
      toUserId,
      status: 'pending'
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending recommendation request to this user' },
        { status: 400 }
      );
    }

    // Create recommendation request
    const recommendationRequest: RecommendationRequest = {
      fromUserId: currentUser._id?.toString() || '',
      toUserId,
      message,
      status: 'pending',
      relationship: relationship || 'colleague',
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      createdAt: new Date()
    };

    const result = await recommendationRequestsCollection.insertOne(recommendationRequest);

    // Log audit action
    await logAuditAction({
      actionType: 'recommendation_requested',
      userId: currentUser._id?.toString() || '',
      affectedUserId: toUserId,
      status: 'success',
      details: {
        toUserId,
        relationship
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Recommendation request sent',
        requestId: result.insertedId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Recommendation request error:', error);
    return NextResponse.json(
      { error: 'Failed to request recommendation' },
      { status: 500 }
    );
  }
}

// Get recommendations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const recommendationsCollection = await getCollection('recommendations');
    const usersCollection = await getCollection('users');

    // Get all recommendations for the user
    const recommendations = await recommendationsCollection
      .find({
        toUserId: userId,
        isPublic: true,
        status: 'published'
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Enrich with recommender info
    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        const recommender = await usersCollection.findOne(
          { _id: new ObjectId(rec.fromUserId) },
          {
            projection: {
              name: 1,
              photoURL: 1,
              headline: 1,
              role: 1
            }
          }
        );
        return {
          ...rec,
          recommender
        };
      })
    );

    return NextResponse.json({
      recommendations: enrichedRecommendations,
      count: recommendations.length,
      averageRating: recommendations.length > 0
        ? (recommendations.reduce((sum, r) => sum + r.rating, 0) / recommendations.length).toFixed(1)
        : 0
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
