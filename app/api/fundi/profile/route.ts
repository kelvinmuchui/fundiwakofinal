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

    const body = await request.json();
    const {
      name,
      phone,
      skill,
      skills,
      experience,
      description,
      location,
      neighborhood,
      availability,
      hourlyRate,
      tvetInstitution,
      reasonForJoining,
      photoURL
    } = body;

    // Validate required fields
    if (!name || !phone || !skill || !experience || !description || !location || !neighborhood) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection('users');
    const result = await usersCollection.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          name,
          phone,
          skill,
          skills: skills || [skill],
          experience,
          description,
          location,
          neighborhood,
          availability: availability || 'flexible',
          hourlyRate,
          tvetInstitution,
          reasonForJoining,
          photoURL,
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
