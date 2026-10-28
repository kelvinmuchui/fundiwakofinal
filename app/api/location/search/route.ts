import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { ApiErrorHandler, createSuccessResponse } from '@/lib/errorHandler';

const SKILL_ALIASES: Record<string, string[]> = {
  Plumbing: ['plumbing', 'plumber'],
  Electrical: ['electrical', 'electrician'],
  Carpentry: ['carpentry', 'carpenter'],
  Painting: ['painting', 'painter'],
  Masonry: ['masonry', 'mason'],
  Cleaning: ['cleaning', 'cleaner'],
  Roofing: ['roofing', 'roofer'],
  'Welding & Metalwork': ['welding', 'welder', 'metalwork', 'metal worker'],
  'Tiling & Flooring': ['tiling', 'tiler', 'flooring'],
  'Landscaping & Gardening': ['landscaping', 'landscaper', 'gardening', 'gardener'],
  'ICT & Computer Repair': ['ict', 'computer repair', 'computer technician', 'it support'],
  'Barista & Hospitality': ['barista', 'hospitality'],
  'Fashion & Design': ['fashion', 'tailor', 'tailoring', 'fashion design'],
  'Animal Health & Veterinary': ['animal health', 'veterinary', 'veterinarian', 'vet'],
  'Solar Installation': ['solar installation', 'solar installer'],
  'Automotive Mechanics': ['automotive mechanics', 'automotive', 'mechanic'],
  'Beauty & Hair': ['beauty', 'hair', 'barber', 'hairdresser'],
  'Appliance Repair': ['appliance repair', 'appliance technician'],
  'Pest Control': ['pest control', 'exterminator'],
  'HVAC & Refrigeration': ['hvac', 'refrigeration', 'air conditioning'],
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSkillRegex(skill: string) {
  const category = Object.keys(SKILL_ALIASES).find(
    (title) => title.toLowerCase() === skill.toLowerCase()
  );
  const terms = category ? SKILL_ALIASES[category] : [skill];
  return new RegExp(terms.map(escapeRegex).join('|'), 'i');
}

export async function GET(request: NextRequest) {
  return ApiErrorHandler.withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get('skill')?.trim() || '';
    const location = searchParams.get('location')?.trim() || '';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '0');

    if (skill.length > 100 || location.length > 100) {
      return NextResponse.json({ error: 'Search terms must be 100 characters or fewer' }, { status: 400 });
    }

    const usersCollection = await getCollection('users');
    const query: Record<string, unknown> = { role: 'fundi' };
    const andClauses: Record<string, unknown>[] = [];

    // Rating Filter
    if (minRating > 0) {
      query.rating = { $gte: minRating };
    }

    // Price Filter (Handling string prices like "KES 1,500/hr")
    // Note: In a real app, prices should be stored as numbers. 
    // This is a simplified regex approach for the current data format.
    if (maxPrice > 0) {
      query.hourlyRate = { $exists: true };
      // We'll filter this in memory for now if stored as string, or use a better query if stored as number
    }

    if (skill) {
      const skillRegex = getSkillRegex(skill);
      andClauses.push({
        $or: [{ skill: skillRegex }, { skills: skillRegex }],
      });
    }

    if (location) {
      const locationRegex = new RegExp(escapeRegex(location), 'i');
      andClauses.push({
        $or: [
          { neighborhood: locationRegex },
          { location: locationRegex },
          { city: locationRegex },
        ],
      });
    }

    if (andClauses.length) {
      query.$and = andClauses;
    }

    const fundis = await usersCollection.find(query).limit(20).toArray();

    // Format response
    const formattedFundis = fundis.map((fundi) => ({
      id: fundi._id.toString(),
      name: fundi.name,
      skill: fundi.skill,
      skills: fundi.skills || [],
      location: fundi.location,
      neighborhood: fundi.neighborhood,
      rating: fundi.rating || 0,
      jobsCompleted: fundi.jobsCompleted || 0,
      hourlyRate: fundi.hourlyRate,
      photoURL: fundi.photoURL,
      isVerified: fundi.isVerified || false,
    }));

    return createSuccessResponse('Fundis retrieved successfully', formattedFundis);
  }, 'GET /api/location/search');
}