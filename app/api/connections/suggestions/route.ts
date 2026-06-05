import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getCollection } from '@/lib/db';
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
    const limit = parseInt(searchParams.get('limit') || '10');

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
    const currentConnections = currentUser.connections || [];
    const blockedUsers = currentUser.blocked || [];

    // Get pending connection requests
    const pendingConnections = await connectionsCollection
      .find({
        $or: [
          { userId, status: 'pending' },
          { connectedUserId: userId, status: 'pending' }
        ]
      })
      .toArray();

    const pendingIds = pendingConnections.map(c => 
      c.userId === userId ? c.connectedUserId : c.userId
    );

    // Get users with mutual connections
    const suggestions = await usersCollection
      .aggregate([
        {
          $match: {
            _id: { 
              $nin: [
                new ObjectId(userId),
                ...currentConnections.map((id: string) => new ObjectId(id)),
                ...pendingIds.map((id: string) => new ObjectId(id)),
                ...blockedUsers.map((id: string) => new ObjectId(id))
              ]
            },
            role: { $in: ['fundi', 'client'] },
            isVerified: true
          }
        },
        {
          $addFields: {
            // Calculate mutual connections
            mutualCount: {
              $size: {
                $setIntersection: ['$connections', currentConnections]
              }
            }
          }
        },
        {
          $sort: { mutualCount: -1, rating: -1, jobsCompleted: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            _id: 1,
            name: 1,
            headline: 1,
            photoURL: 1,
            role: 1,
            rating: 1,
            jobsCompleted: 1,
            mutualCount: 1,
            verificationBadges: 1,
            endorsedSkills: { $slice: ['$endorsedSkills', 3] }
          }
        }
      ])
      .toArray();

    return NextResponse.json({
      suggestions,
      count: suggestions.length
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
