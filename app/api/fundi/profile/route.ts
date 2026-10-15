import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCollection } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const fundiProfileProjection = {
  _id: 1,
  name: 1,
  email: 1,
  phone: 1,
  skill: 1,
  skills: 1,
  experience: 1,
  description: 1,
  location: 1,
  neighborhood: 1,
  availability: 1,
  hourlyRate: 1,
  tvetInstitution: 1,
  reasonForJoining: 1,
  photoURL: 1,
  showcasePhotos: 1,
  isVerified: 1,
  profileViews: 1,
  profileViewCount: 1,
  contactClicks: 1,
  notifications: 1,
  certificates: 1,
  rating: 1,
  jobsCompleted: 1,
  createdAt: 1,
  updatedAt: 1,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'fundi') {
      return NextResponse.json({ error: 'Not a fundi' }, { status: 403 });
    }

    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne(
      { email: session.user.email, role: 'fundi' },
      { projection: fundiProfileProjection }
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
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

    for (const field of coreFields) {
      if (hasField(field)) {
        if (typeof input[field] !== 'string' || !input[field].trim()) {
          return NextResponse.json({ error: `${field} must be a non-empty text value` }, { status: 400 });
        }
        updates[field] = input[field].trim();
      }
    }

    if (hasField('skills')) {
      if (!Array.isArray(input.skills) || !input.skills.every((value) => typeof value === 'string')) {
        return NextResponse.json({ error: 'Skills must be a list of text values' }, { status: 400 });
      }
      const skills = input.skills.map((value) => value.trim()).filter(Boolean);
      updates.skills = skills;
      if (!hasField('skill') && skills.length > 0) updates.skill = skills[0];
    } else if (hasField('skill')) {
      updates.skills = [updates.skill];
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
    const fundiQuery = { email: session.user.email, role: 'fundi' };
    const result = await usersCollection.updateOne(
      fundiQuery,
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount !== 1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedProfile = await usersCollection.findOne(fundiQuery, { projection: fundiProfileProjection });
    if (!updatedProfile) {
      return NextResponse.json({ error: 'Profile was updated but could not be reloaded' }, { status: 500 });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
