import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { ApiErrorHandler, createSuccessResponse } from '@/lib/errorHandler';
import { bookingSchema, getValidationErrorMessages } from '@/lib/validation';

export async function POST(request: NextRequest) {
  return ApiErrorHandler.withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const clientId = user?.id || 'guest';

    const body = await request.json();

    // Validate input with Zod schema
    const validation = bookingSchema.safeParse(body);
    if (!validation.success) {
      const errors = getValidationErrorMessages(validation.error);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { fundiId, serviceType, description, preferredDate, preferredTime, location } = validation.data;

    // Verify the fundi exists and is actually a fundi
    const usersCollection = await getCollection('users');
    const fundi = await usersCollection.findOne({
      _id: new ObjectId(fundiId),
      role: 'fundi'
    });

    if (!fundi) {
      return NextResponse.json({ error: 'Fundi not found' }, { status: 404 });
    }

    const bookingsCollection = await getCollection('bookings');

    const bookingData = {
      fundiId,
      clientId,
      serviceType,
      description: description.trim(),
      preferredDate,
      preferredTime,
      location: location.trim(),
      status: 'pending', // pending, accepted, in_progress, completed, cancelled
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await bookingsCollection.insertOne(bookingData);

    return createSuccessResponse('Booking created successfully', {
      bookingId: result.insertedId
    }, 201);
  }, 'POST /api/bookings');
}

export async function GET(request: NextRequest) {
  return ApiErrorHandler.withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingsCollection = await getCollection('bookings');
    const usersCollection = await getCollection('users');

    // Get bookings where user is either client or fundi
    const bookings = await bookingsCollection.find({
      $or: [
        { clientId: userId },
        { fundiId: userId }
      ]
    }).sort({ createdAt: -1 }).toArray();

    // Enrich with user data
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const fundi = await usersCollection.findOne({ _id: new ObjectId(booking.fundiId) });
        const client = booking.clientId !== 'guest' ?
          await usersCollection.findOne({ _id: new ObjectId(booking.clientId) }) : null;

        return {
          ...booking,
          fundi: fundi ? {
            _id: fundi._id,
            name: fundi.name,
            skill: fundi.skill,
            phone: fundi.phone,
            photoURL: fundi.photoURL
          } : null,
          client: client ? {
            _id: client._id,
            name: client.name,
            phone: client.phone
          } : { name: 'Guest User' }
        };
      })
    );

    return createSuccessResponse('Bookings retrieved successfully', enrichedBookings);
  }, 'GET /api/bookings');
}

export async function PATCH(request: NextRequest) {
  return ApiErrorHandler.withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const userId = user?.id;
    const userRole = user?.role;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, status } = body;
    const allowedStatuses = ['accepted', 'in_progress', 'completed', 'cancelled', 'declined'];

    if (!bookingId || !status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid booking update' }, { status: 400 });
    }

    const bookingsCollection = await getCollection('bookings');
    const booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (userRole === 'fundi' && booking.fundiId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (userRole === 'client' && booking.clientId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (userRole === 'client' && status !== 'cancelled') {
      return NextResponse.json({ error: 'Clients may only cancel bookings' }, { status: 403 });
    }

    await bookingsCollection.updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: { status, updatedAt: new Date() } }
    );

    return createSuccessResponse('Booking status updated successfully');
  }, 'PATCH /api/bookings');
}
