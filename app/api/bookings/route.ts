import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { ApiErrorHandler, createSuccessResponse } from '@/lib/errorHandler';
import { bookingSchema, getValidationErrorMessages } from '@/lib/validation';
import { logActivity } from '@/lib/activityLogger';

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

    // Log booking activity
    try {
      await logActivity(
        clientId,
        'booking_created',
        'Booking Requested',
        `Requested ${serviceType} service from ${fundi.name}`,
        {
          relatedUserId: fundiId,
          metadata: {
            bookingId: result.insertedId.toString(),
            fundiName: fundi.name,
            serviceType,
            location,
            preferredDate
          }
        }
      );
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // Don't fail booking creation if activity logging fails
    }

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
    const { bookingId, status, quoteAmount } = body;
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

    // Get booking details for activity logging
    const usersCollection = await getCollection('users');
    const fundi = await usersCollection.findOne({ _id: new ObjectId(booking.fundiId) });

    const updateFields: any = { status, updatedAt: new Date() };
    if (status === 'accepted' && quoteAmount) {
      updateFields.quoteAmount = Number(quoteAmount);
      updateFields.paymentStatus = 'unpaid';
    }

    await bookingsCollection.updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: updateFields }
    );

    // Log booking status change activity
    try {
      const statusDescriptions: Record<string, string> = {
        accepted: 'Booking Accepted',
        in_progress: 'Booking In Progress',
        completed: 'Job Completed',
        cancelled: 'Booking Cancelled',
        declined: 'Booking Declined'
      };

      if (status === 'completed') {
        // Log for both fundi and client
        await logActivity(
          booking.fundiId,
          'job_completed',
          'Job Completed',
          `Completed booking for ${booking.serviceType}`,
          {
            relatedUserId: booking.clientId,
            metadata: {
              bookingId,
              clientId: booking.clientId,
              serviceType: booking.serviceType,
              completedDate: new Date()
            }
          }
        );
      }

      await logActivity(
        userId,
        'booking_status_updated',
        statusDescriptions[status] || 'Booking Updated',
        `${status.replace(/_/g, ' ')} - ${booking.serviceType}`,
        {
          metadata: {
            bookingId,
            newStatus: status,
            fundiName: fundi?.name
          }
        }
      );
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // Don't fail status update if activity logging fails
    }

    return createSuccessResponse('Booking status updated successfully');
  }, 'PATCH /api/bookings');
}
