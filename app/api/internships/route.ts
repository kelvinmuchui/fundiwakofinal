import { NextResponse } from 'next/server';
import { getCollection } from '../../../lib/db';

const fallbackInternships = [
  {
    _id: 'demo-internship-1',
    companyName: 'MajiFix Kenya',
    serviceCategory: 'plumbing',
    duration: '3 months',
    description: 'Join a hands-on plumbing internship focused on water systems, repairs, and site supervision.',
    location: 'Nairobi',
    positions: 4,
    preferredStartDate: '2026-07-20',
    status: 'approved',
  },
  {
    _id: 'demo-internship-2',
    companyName: 'BrightVolt Installations',
    serviceCategory: 'electrical',
    duration: '6 weeks',
    description: 'Support electrical installation projects and learn safe wiring practices with an experienced team.',
    location: 'Kisumu',
    positions: 2,
    preferredStartDate: '2026-08-01',
    status: 'pending',
  },
  {
    _id: 'demo-internship-3',
    companyName: 'UrbanBuild Works',
    serviceCategory: 'carpentry',
    duration: '2 months',
    description: 'Work alongside site carpenters on furniture fabrication, installations, and finishing tasks.',
    location: 'Mombasa',
    positions: 3,
    preferredStartDate: '2026-07-27',
    status: 'approved',
  },
];

export async function GET() {
  try {
    const postingsCollection = await getCollection('corporate_postings');
    const internships = await postingsCollection
      .find({ postingType: 'internship' })
      .sort({ createdAt: -1 })
      .toArray();

    if (internships.length > 0) {
      return NextResponse.json({ internships });
    }

    return NextResponse.json({ internships: fallbackInternships });
  } catch (error) {
    console.error('Error fetching internships:', error);
    return NextResponse.json({ internships: fallbackInternships });
  }
}
