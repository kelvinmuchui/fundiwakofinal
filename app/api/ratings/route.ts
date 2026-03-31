import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.id) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    const { fundiId, rating, review } = await request.json();

    if (!fundiId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Verify the fundi exists and is actually a fundi
    const usersCollection = await getCollection('users');
    const fundi = await usersCollection.findOne({
      _id: new ObjectId(fundiId),
      role: 'fundi'
    });

    if (!fundi) {
      return NextResponse.json({ error: 'Fundi not found' }, { status: 404 });
    }

    // Check if user already rated this fundi
    const ratingsCollection = await getCollection('ratings');
    const existingRating = await ratingsCollection.findOne({
      fundiId,
      clientId: user.id
    });

    const ratingData = {
      fundiId,
      clientId: user.id,
      rating: Number(rating),
      review: review?.trim() || undefined,
      updatedAt: new Date()
    };

    if (existingRating) {
      // Update existing rating
      await ratingsCollection.updateOne(
        { _id: existingRating._id },
        { $set: ratingData }
      );
    } else {
      // Create new rating
      const newRatingData = {
        ...ratingData,
        createdAt: new Date()
      };
      await ratingsCollection.insertOne(newRatingData);
    }

    // Calculate new average rating
    const allRatings = await ratingsCollection.find({ fundiId }).toArray();
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    // Update fundi's average rating
    await usersCollection.updateOne(
      { _id: new ObjectId(fundiId) },
      {
        $set: {
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully',
      averageRating: Math.round(averageRating * 10) / 10
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}