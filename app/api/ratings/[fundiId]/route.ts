import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';

// GET /api/ratings/[fundiId] - Get all reviews for a specific fundi
export async function GET(request: NextRequest, context: { params: Promise<{ fundiId: string }> }) {
  try {
    const { fundiId } = await context.params;

    if (!fundiId || !ObjectId.isValid(fundiId)) {
      return NextResponse.json({ error: 'Invalid fundi ID' }, { status: 400 });
    }

    const ratingsCollection = await getCollection('ratings');
    const usersCollection = await getCollection('users');

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, oldest, highest, lowest
    const filterRating = parseInt(searchParams.get('filterRating') || '0');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = { fundiId };
    if (filterRating > 0 && filterRating <= 5) {
      query.rating = filterRating;
    }

    // Build sort
    let sort: any = { createdAt: -1 }; // default newest
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'highest':
        sort = { rating: -1, createdAt: -1 };
        break;
      case 'lowest':
        sort = { rating: 1, createdAt: -1 };
        break;
    }

    // Get total count
    const totalCount = await ratingsCollection.countDocuments(query);

    // Get paginated reviews
    const reviews = await ratingsCollection
      .find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Enrich with client names
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        let clientName = 'Anonymous';
        if (review.clientId && review.clientId !== 'guest') {
          try {
            const client = await usersCollection.findOne({ _id: new ObjectId(review.clientId) });
            if (client) {
              clientName = client.name;
            }
          } catch {
            // Invalid ObjectId, keep anonymous
          }
        }
        return {
          _id: review._id,
          rating: review.rating,
          review: review.review,
          clientName,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        };
      })
    );

    // Calculate rating distribution
    const allRatings = await ratingsCollection.find({ fundiId }).toArray();
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    allRatings.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[star as keyof typeof distribution]++;
      totalRating += r.rating;
    });

    const averageRating = allRatings.length > 0 
      ? Math.round((totalRating / allRatings.length) * 10) / 10 
      : 0;

    return NextResponse.json({
      reviews: enrichedReviews,
      totalCount,
      averageRating,
      distribution,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
