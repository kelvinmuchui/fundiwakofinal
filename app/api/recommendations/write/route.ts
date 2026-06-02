import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getCollection } from '@/lib/db';
import { logAuditAction } from '@/lib/auditLog';
import type { Recommendation } from '@/lib/models/Recommendation';
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
    const {
      toUserId,
      requestId,
      content,
      rating,
      relationship,
      context,
      isPublic
    } = body;

    if (!toUserId || !content || !rating) {
      return NextResponse.json(
        { error: 'To user ID, content, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection('users');
    const recommendationsCollection = await getCollection('recommendations');
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
        { error: 'You must be connected to give a recommendation' },
        { status: 403 }
      );
    }

    // Create recommendation
    const recommendation: Recommendation = {
      fromUserId: currentUser._id?.toString() || '',
      toUserId,
      content,
      rating,
      relationship: relationship || 'colleague',
      verified: false,
      status: 'pending',
      isPublic: isPublic || false,
      likes: 0,
      likedBy: [],
      context: context || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await recommendationsCollection.insertOne(recommendation);

    // If request ID provided, mark the request as accepted
    if (requestId) {
      await recommendationRequestsCollection.updateOne(
        { _id: new ObjectId(requestId) },
        {
          $set: {
            status: 'accepted',
            respondedAt: new Date()
          }
        }
      );
    }

    // Log audit action
    await logAuditAction({
      actionType: 'recommendation_given',
      userId: currentUser._id?.toString() || '',
      affectedUserId: toUserId,
      status: 'success',
      details: {
        toUserId,
        rating,
        relationship,
        recommendationId: result.insertedId
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Recommendation created',
        recommendationId: result.insertedId,
        recommendation
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to create recommendation' },
      { status: 500 }
    );
  }
}

// Publish/Accept recommendation request
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recommendationId, action } = body; // action: 'publish', 'accept', 'reject'

    if (!recommendationId || !action) {
      return NextResponse.json(
        { error: 'Recommendation ID and action are required' },
        { status: 400 }
      );
    }

    if (!['publish', 'accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection('users');
    const recommendationsCollection = await getCollection('recommendations');

    // Get current user
    const currentUser = await usersCollection.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get recommendation
    const recommendation = await recommendationsCollection.findOne({
      _id: new ObjectId(recommendationId)
    });

    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    let updateData: any = { updatedAt: new Date() };

    if (action === 'accept') {
      // Only recipient can accept
      if (recommendation.toUserId !== currentUser._id?.toString()) {
        return NextResponse.json(
          { error: 'Only the recipient can accept a recommendation' },
          { status: 403 }
        );
      }
      updateData.status = 'accepted';
      updateData.acceptedAt = new Date();
    } else if (action === 'reject') {
      // Only recipient can reject
      if (recommendation.toUserId !== currentUser._id?.toString()) {
        return NextResponse.json(
          { error: 'Only the recipient can reject a recommendation' },
          { status: 403 }
        );
      }
      updateData.status = 'rejected';
    } else if (action === 'publish') {
      // Only recipient can publish
      if (recommendation.toUserId !== currentUser._id?.toString()) {
        return NextResponse.json(
          { error: 'Only the recipient can publish a recommendation' },
          { status: 403 }
        );
      }
      if (recommendation.status !== 'accepted') {
        return NextResponse.json(
          { error: 'Recommendation must be accepted before publishing' },
          { status: 400 }
        );
      }
      updateData.status = 'published';
      updateData.isPublic = true;
      updateData.publishedAt = new Date();
    }

    await recommendationsCollection.updateOne(
      { _id: new ObjectId(recommendationId) },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: `Recommendation ${action}ed`,
      recommendation: { ...recommendation, ...updateData }
    });
  } catch (error) {
    console.error('Update recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to update recommendation' },
      { status: 500 }
    );
  }
}
