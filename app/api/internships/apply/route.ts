import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../app/api/auth/[...nextauth]/route';
import { getCollection } from '../../../../lib/db';
import { internshipApplicationSchema, getValidationErrorMessages } from '../../../../lib/validation';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const body = await request.json();
    const validation = internshipApplicationSchema.safeParse(body);

    if (!validation.success) {
      const errors = getValidationErrorMessages(validation.error);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const applicationData = validation.data;
    const postingsCollection = await getCollection('corporate_postings');
    const posting = await postingsCollection.findOne({
      _id: new ObjectId(applicationData.postingId),
      postingType: 'internship'
    });

    if (!posting) {
      return NextResponse.json({ error: 'Internship posting not found' }, { status: 404 });
    }

    const internshipApplications = await getCollection('internship_applications');
    const inserted = await internshipApplications.insertOne({
      postingId: applicationData.postingId,
      postingCompany: posting.companyName,
      postingCategory: posting.serviceCategory,
      postingLocation: posting.location,
      postingDescription: posting.description,
      postingStatus: posting.status,
      applicantName: applicationData.applicantName,
      applicantEmail: applicationData.applicantEmail,
      applicantPhone: applicationData.applicantPhone,
      institution: applicationData.institution,
      yearOfStudy: applicationData.yearOfStudy,
      areaOfInterest: applicationData.areaOfInterest,
      motivation: applicationData.motivation,
      resumeUrl: applicationData.resumeUrl || null,
      status: 'submitted',
      createdBy: user?.id ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      submittedAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Internship application submitted successfully', applicationId: inserted.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating internship application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
