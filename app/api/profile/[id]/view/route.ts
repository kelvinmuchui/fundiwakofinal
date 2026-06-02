import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(
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

    // Get current user
    const currentUser = await usersCollection.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent recording own profile views
    if (currentUser._id?.toString() === id) {
      return NextResponse.json(
        { error: 'Cannot record own profile view' },
        { status: 400 }
      );
    }

    // Record profile view
    const profileView = {
      viewerId: currentUser._id?.toString(),
      viewedAt: new Date()
    };

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { profileViews: profileView },
        $inc: { profileViewCount: 1 }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Profile view recorded'
    });
  } catch (error) {
    console.error('Record profile view error:', error);
    return NextResponse.json(
      { error: 'Failed to record profile view' },
      { status: 500 }
    );
  }
}
