import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../app/api/auth/[...nextauth]/route';
import { getCollection } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!session || !user?.id || !user?.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const internshipApplications = await getCollection('internship_applications');
    const postingsCollection = await getCollection('corporate_postings');

    if (user.role === 'admin') {
      const applications = await internshipApplications
        .find({})
        .sort({ submittedAt: -1 })
        .toArray();

      return NextResponse.json(applications);
    }

    if (user.role === 'client' || user.role === 'fundi') {
      const applications = await internshipApplications
        .find({ createdBy: user.id })
        .sort({ submittedAt: -1 })
        .toArray();

      return NextResponse.json(applications);
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('Error fetching internship applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
