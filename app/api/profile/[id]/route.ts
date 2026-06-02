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

    const usersCollection = await getCollection('users');
    const connectionsCollection = await getCollection('connections');

    // Get the requested user
    const user = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          password: 0,
          resetToken: 0,
          verificationToken: 0,
          mpesaNumberEncrypted: 0,
          bankAccountNumberEncrypted: 0,
          idNumberEncrypted: 0
        }
      }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Determine connection status if user is logged in
    let connectionStatus = 'not_connected';
    if (session?.user?.email) {
      const currentUser = await usersCollection.findOne({ email: session.user.email });
      if (currentUser) {
        const connection = await connectionsCollection.findOne({
          $or: [
            { userId: currentUser._id?.toString(), connectedUserId: id },
            { userId: id, connectedUserId: currentUser._id?.toString() }
          ]
        });

        if (connection) {
          connectionStatus = connection.status;
        }
      }
    }

    return NextResponse.json({
      user: {
        _id: user._id?.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        headline: user.headline,
        about: user.about,
        photoURL: user.photoURL,
        coverImage: user.coverImage,
        verificationBadges: user.verificationBadges || [],
        endorsedSkills: user.endorsedSkills || [],
        connections: user.connections || [],
        profileViewCount: user.profileViews?.length || 0,
        location: user.location,
        hourlyRate: user.hourlyRate,
        rating: user.rating,
        jobsCompleted: user.jobsCompleted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      connectionStatus
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
