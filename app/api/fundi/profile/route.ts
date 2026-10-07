import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCollection } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session?.user as any)?.role;
    if (userRole !== 'fundi') {
      return NextResponse.json({ error: 'Not a fundi' }, { status: 403 });
    }

    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne(
      { email: session.user.email },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session?.user as any)?.role;
    if (userRole !== 'fundi') {
      return NextResponse.json({ error: 'Not a fundi' }, { status: 403 });
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid profile update' }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const hasField = (field: string) => Object.prototype.hasOwnProperty.call(input, field);
    const coreFields = ['name', 'phone', 'skill', 'experience', 'description', 'location', 'neighborhood'];
    const updates: Record<string, unknown> = {};

    if (coreFields.some(hasField)) {
      const missingFields = coreFields.filter(
        (field) => typeof input[field] !== 'string' || !input[field].trim()
      );
      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: `Please complete the required profile fields: ${missingFields.join(', ')}` },
          { status: 400 }
        );
      }

      for (const field of coreFields) {
        updates[field] = (input[field] as string).trim();
      }

      if (hasField('skills')) {
        if (!Array.isArray(input.skills) || !input.skills.every((value) => typeof value === 'string')) {
          return NextResponse.json({ error: 'Skills must be a list of text values' }, { status: 400 });
        }
        updates.skills = input.skills.map((value) => value.trim()).filter(Boolean);
      } else {
        updates.skills = [updates.skill];
      }
    }

    if (hasField('availability')) {
      const validAvailability = ['flexible', 'fulltime', 'parttime', 'weekends', 'available', 'busy', 'available-soon', 'unavailable'];
      if (typeof input.availability !== 'string' || !validAvailability.includes(input.availability)) {
        return NextResponse.json({ error: 'Invalid availability status' }, { status: 400 });
      }
      updates.availability = input.availability;
    }

    for (const field of ['hourlyRate', 'tvetInstitution', 'reasonForJoining']) {
      if (hasField(field)) {
        updates[field] = input[field];
      }
    }

    if (hasField('photoURL')) {
      if (typeof input.photoURL !== 'string' && input.photoURL !== null) {
        return NextResponse.json({ error: 'Invalid profile photo' }, { status: 400 });
      }
      updates.photoURL = input.photoURL;
    }

    if (hasField('showcasePhotos')) {
      if (
        !Array.isArray(input.showcasePhotos) ||
        input.showcasePhotos.length > 6 ||
        !input.showcasePhotos.every((photo) => typeof photo === 'string')
      ) {
        return NextResponse.json({ error: 'Showcase photos must be a list of up to 6 images' }, { status: 400 });
      }
      updates.showcasePhotos = input.showcasePhotos;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No profile fields were provided' }, { status: 400 });
    }

    const usersCollection = await getCollection('users');
    const result = await usersCollection.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // In MongoDB driver 6.x, findOneAndUpdate returns the document directly
    const updatedUser = (result as any).value || result;
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
