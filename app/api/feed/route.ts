import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getCollection } from '@/lib/db';
import type { Activity } from '@/lib/models/Activity';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    const usersCollection = await getCollection('users');
    const activitiesCollection = await getCollection('activities');

    // Get current user
    const currentUser = await usersCollection.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = currentUser._id?.toString();

    // Get user's connections
    const connections = currentUser.connections || [];

    // Build query for activities from connections
    const query = {
      $or: [
        { userId: { $in: connections }, visibility: { $in: ['public', 'connections'] } },
        { userId, visibility: { $in: ['public', 'private', 'connections'] } }
      ]
    };

    // Get total count
    const totalCount = await activitiesCollection.countDocuments(query);

    // Get activities with pagination
    const activities = await activitiesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Enrich activities with user info
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const user = await usersCollection.findOne(
          { _id: new ObjectId(activity.userId) },
          {
            projection: {
              name: 1,
              photoURL: 1,
              headline: 1,
              role: 1
            }
          }
        );

        // Get related user info if exists
        let relatedUser = null;
        if (activity.relatedUserId) {
          relatedUser = await usersCollection.findOne(
            { _id: new ObjectId(activity.relatedUserId) },
            {
              projection: {
                name: 1,
                photoURL: 1,
                headline: 1
              }
            }
          );
        }

        return {
          ...activity,
          user,
          relatedUser
        };
      })
    );

    return NextResponse.json({
      activities: enrichedActivities,
      pagination: {
        skip,
        limit,
        total: totalCount,
        hasMore: skip + limit < totalCount
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}

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
      type,
      title,
      description,
      relatedUserId,
      relatedJobId,
      relatedSkillId,
      metadata,
      visibility
    } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection('users');
    const activitiesCollection = await getCollection('activities');

    // Get current user
    const currentUser = await usersCollection.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create activity
    const activity: Activity = {
      userId: currentUser._id?.toString() || '',
      type: type,
      title: title,
      description: description,
      relatedUserId,
      relatedJobId,
      relatedSkillId,
      metadata: metadata || {},
      visibility: visibility || 'connections',
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date()
    };

    const result = await activitiesCollection.insertOne(activity);

    return NextResponse.json(
      {
        success: true,
        message: 'Activity created',
        activityId: result.insertedId,
        activity
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create activity error:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
