import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (!id || !type) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const usersCollection = await getCollection('users');
    const session = await getServerSession(authOptions);
    const senderName = session?.user?.name || 'A client';

    let update: any = {};
    let notification: any = null;

    if (type === 'view') {
      update = { $inc: { profileViews: 1 } };
    } else if (type === 'contact') {
      notification = {
        _id: new ObjectId(),
        type: 'contact',
        message: `${senderName} clicked on your contact information.`,
        senderName: senderName,
        createdAt: new Date(),
        isRead: false
      };
      update = { 
        $inc: { contactClicks: 1 },
        $push: { 
          notifications: {
            $each: [notification],
            $position: 0 // Newest first
          }
        }
      };
    } else {
      return NextResponse.json({ error: 'Invalid track type' }, { status: 400 });
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      update
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Fundi not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Tracked ${type} successfully`,
      notification: notification
    });

  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
