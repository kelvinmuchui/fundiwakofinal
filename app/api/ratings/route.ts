import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { ApiErrorHandler, createSuccessResponse } from '@/lib/errorHandler';
import { logActivity } from '@/lib/activityLogger';

export async function POST(request: NextRequest) {
  return ApiErrorHandler.withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const clientId = user?.id || 'guest';

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

    // Check if user already rated this fundi (skipped for guest users)
    const ratingsCollection = await getCollection('ratings');
    let existingRating = null;

    if (clientId !== 'guest') {
      existingRating = await ratingsCollection.findOne({
        fundiId,
        clientId
      });
    }

    const ratingData = {
      fundiId,
      clientId,
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

    // Log rating activity for fundi
    try {
      await logActivity(
        fundiId,
        'rating_received',
        'Rating Received',
        `Received ${rating}★ rating${review ? ' with review' : ''}`,
        {
          ratingValue: rating,
          review: review?.substring(0, 100), // Truncate long reviews
          averageRating: Math.round(averageRating * 10) / 10
        }
      );
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // Don't fail rating creation if activity logging fails
    }

    return createSuccessResponse(
      existingRating ? 'Rating updated successfully' : 'Rating submitted successfully',
      { averageRating: Math.round(averageRating * 10) / 10 }
    );
  }, 'POST /api/ratings');
}