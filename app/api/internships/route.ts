import { NextResponse } from 'next/server';
import { getCollection } from '../../../lib/db';

export async function GET() {
  try {
    const postingsCollection = await getCollection('corporate_postings');
    const internships = await postingsCollection
      .find({ postingType: 'internship', status: 'approved' })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ internships });
  } catch (error) {
    console.error('Error fetching internships:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
