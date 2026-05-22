import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { ApiErrorHandler, createSuccessResponse } from '@/lib/errorHandler';
import { corporatePostingSchema, getValidationErrorMessages } from '@/lib/validation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  return ApiErrorHandler.withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const body = await request.json();

    const validation = corporatePostingSchema.safeParse(body);
    if (!validation.success) {
      const errors = getValidationErrorMessages(validation.error);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const posting = validation.data;
    const postingsCollection = await getCollection('corporate_postings');

    const result = await postingsCollection.insertOne({
      ...posting,
      submittedBy: user?.id ?? null,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return createSuccessResponse('Your hiring request has been submitted successfully.', {
      postingId: result.insertedId,
    }, 201);
  }, 'POST /api/hire-fundis');
}

export async function GET(request: NextRequest) {
  return ApiErrorHandler.withErrorHandler(async () => {
    const postingsCollection = await getCollection('corporate_postings');
    const postings = await postingsCollection
      .find()
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return createSuccessResponse('Corporate postings retrieved successfully.', { postings });
  }, 'GET /api/hire-fundis');
}
