import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid fundi ID' }, { status: 400 });
    }

    const usersCollection = await getCollection('users');
    const fundi = await usersCollection.findOne(
      { _id: new ObjectId(id), role: 'fundi' },
      { projection: { password: 0, resetToken: 0, resetTokenExpires: 0, verificationToken: 0, verificationTokenExpires: 0, bankAccountNumberEncrypted: 0, mpesaNumberEncrypted: 0, idNumberEncrypted: 0 } }
    );

    if (!fundi) {
      return NextResponse.json({ error: 'Fundi not found' }, { status: 404 });
    }

    return NextResponse.json({
      _id: fundi._id.toString(),
      name: fundi.name,
      email: fundi.email,
      skill: fundi.skill,
      skills: fundi.skills,
      experience: fundi.experience,
      description: fundi.description,
      location: fundi.location,
      neighborhood: fundi.neighborhood,
      availability: fundi.availability,
      hourlyRate: fundi.hourlyRate,
      tvetInstitution: fundi.tvetInstitution,
      reasonForJoining: fundi.reasonForJoining,
      photoURL: fundi.photoURL,
      isVerified: fundi.isVerified,
      showcasePhotos: fundi.showcasePhotos,
      rating: fundi.rating,
      jobsCompleted: fundi.jobsCompleted,
      profileViews: fundi.profileViews?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching public fundi profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
