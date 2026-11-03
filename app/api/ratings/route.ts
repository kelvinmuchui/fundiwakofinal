import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { ApiErrorHandler, createSuccessResponse } from '@/lib/errorHandler';
import { logActivity } from '@/lib/activityLogger';

async function getClientSession() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== 'client' || !ObjectId.isValid(user.id)) return null;
  return user;
}

export async function GET(request: NextRequest) {
  return ApiErrorHandler.withErrorHandler(async () => {
    const user = await getClientSession();
    if (!user) return NextResponse.json({ error: 'Only signed-in clients can view their review status' }, { status: 401 });

    const bookingId = new URL(request.url).searchParams.get('bookingId');
    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: 'A valid booking ID is required' }, { status: 400 });
    }

    const bookingsCollection = await getCollection('bookings');
    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(bookingId),
      clientId: user.id,
      status: 'completed',
    });
    if (!booking) return NextResponse.json({ error: 'Completed booking not found' }, { status: 404 });

    const ratingsCollection = await getCollection('ratings');
    const review = await ratingsCollection.findOne({ bookingId, clientId: user.id });
    return NextResponse.json({
      review: review ? {
        rating: review.rating,
        review: review.review || '',
      } : null,
    });
  }, 'GET /api/ratings');
}

export async function POST(request: NextRequest) {
  return ApiErrorHandler.withErrorHandler(async () => {
    const user = await getClientSession();
    if (!user) return NextResponse.json({ error: 'Only signed-in clients can review a fundi' }, { status: 401 });

    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid review data' }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const { bookingId, fundiId, rating } = input;
    const review = typeof input.review === 'string' ? input.review.trim() : '';

    if (
      typeof bookingId !== 'string' ||
      !ObjectId.isValid(bookingId) ||
      typeof fundiId !== 'string' ||
      !ObjectId.isValid(fundiId) ||
      typeof rating !== 'number' ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      (input.review !== undefined && typeof input.review !== 'string') ||
      review.length > 500
    ) {
      return NextResponse.json({ error: 'Provide a valid booking, fundi, rating from 1 to 5, and review of up to 500 characters' }, { status: 400 });
    }

    const bookingsCollection = await getCollection('bookings');
    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(bookingId),
      clientId: user.id,
      fundiId,
      status: 'completed',
    });
    if (!booking) {
      return NextResponse.json({ error: 'You can review a fundi after your completed booking' }, { status: 403 });
    }

    const usersCollection = await getCollection('users');
    const fundi = await usersCollection.findOne({
      _id: new ObjectId(fundiId),
      role: 'fundi',
    });
    if (!fundi) return NextResponse.json({ error: 'Fundi not found' }, { status: 404 });

    const ratingsCollection = await getCollection('ratings');
    const existingReview = await ratingsCollection.findOne({ bookingId, clientId: user.id });
    const now = new Date();
    const ratingData = {
      fundiId,
      clientId: user.id,
      bookingId,
      rating,
      review,
      updatedAt: now,
    };

    if (existingReview) {
      await ratingsCollection.updateOne({ _id: existingReview._id }, { $set: ratingData });
    } else {
      await ratingsCollection.insertOne({ ...ratingData, createdAt: now });
    }

    const allRatings = await ratingsCollection.find({ fundiId }).toArray();
    const averageRating = allRatings.reduce((sum, item) => sum + item.rating, 0) / allRatings.length;
    const roundedAverage = Math.round(averageRating * 10) / 10;

    await usersCollection.updateOne(
      { _id: new ObjectId(fundiId), role: 'fundi' },
      { $set: { rating: roundedAverage, updatedAt: now } },
    );

    try {
      await logActivity(
        fundiId,
        'rating_received',
        'Rating Received',
        `Received ${rating}★ rating${review ? ' with review' : ''}`,
        {
          relatedUserId: user.id,
          metadata: {
            bookingId,
            ratingValue: rating,
            review: review.substring(0, 100),
            averageRating: roundedAverage,
          },
        },
      );
    } catch (logError) {
      console.error('Error logging rating activity:', logError);
    }

    return createSuccessResponse(
      existingReview ? 'Review updated successfully' : 'Review submitted successfully',
      { averageRating: roundedAverage, review: { rating, review } },
    );
  }, 'POST /api/ratings');
}
