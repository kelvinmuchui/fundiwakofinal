import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { ApiErrorHandler, createSuccessResponse } from '@/lib/errorHandler';

const FALLBACK_FUNDIS = [
  {
    id: 'fallback-plumber-1',
    name: 'Martin Kamau',
    skill: 'Plumbing',
    skills: ['Plumbing', 'Pipe repair'],
    location: 'Nairobi',
    neighborhood: 'Kilimani',
    rating: 4.8,
    jobsCompleted: 142,
    hourlyRate: 'KSh 1500',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
  },
  {
    id: 'fallback-electrician-1',
    name: 'Aisha Muli',
    skill: 'Electrical',
    skills: ['Electrical', 'Lighting installation'],
    location: 'Nairobi',
    neighborhood: 'Westlands',
    rating: 4.9,
    jobsCompleted: 186,
    hourlyRate: 'KSh 1800',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
  },
  {
    id: 'fallback-carpenter-1',
    name: 'Daniel Kariuki',
    skill: 'Carpentry',
    skills: ['Carpentry', 'Cabinet making'],
    location: 'Kisumu',
    neighborhood: 'Milimani',
    rating: 4.6,
    jobsCompleted: 98,
    hourlyRate: 'KSh 2200',
    photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
  },
  {
    id: 'fallback-painter-1',
    name: 'Faith Njeri',
    skill: 'Painting',
    skills: ['Painting', 'Interior design'],
    location: 'Nakuru',
    neighborhood: 'Kivumbini',
    rating: 4.7,
    jobsCompleted: 86,
    hourlyRate: 'KSh 1700',
    photoURL: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    isVerified: false,
  },
  {
    id: 'fallback-mechanic-1',
    name: 'Brian Otieno',
    skill: 'Automotive Mechanics',
    skills: ['Automotive Mechanics', 'Diagnostics'],
    location: 'Mombasa',
    neighborhood: 'Nyali',
    rating: 4.5,
    jobsCompleted: 110,
    hourlyRate: 'KSh 2500',
    photoURL: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
  },
] as const;

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

function getComparableRate(rate: unknown): number | null {
  if (typeof rate === 'number') return Number.isFinite(rate) ? rate : null;
  if (typeof rate !== 'string') return null;
  const normalized = rate.replace(/,/g, '');
  const amount = normalized.match(/\d+(?:\.\d+)?/);
  return amount ? Number(amount[0]) : null;
}

type FundiDocument = {
  _id: { toString(): string };
  name?: string;
  skill?: string;
  skills?: string[];
  location?: string;
  neighborhood?: string;
  city?: string;
  rating?: number;
  jobsCompleted?: number;
  hourlyRate?: string | number;
  photoURL?: string;
  isVerified?: boolean;
};

function filterFallbackFundis(params: {
  skill: string;
  location: string;
  minRating: number;
  maxPrice: number;
}) {
  const { skill, location, minRating, maxPrice } = params;

  return FALLBACK_FUNDIS.filter((fundi) => {
    const matchesSkill = !skill || [fundi.skill, ...(fundi.skills ?? [])].some((value) =>
      value.toLowerCase().includes(skill.toLowerCase())
    );
    const matchesLocation = !location || [fundi.location, fundi.neighborhood].some((value) =>
      value.toLowerCase().includes(location.toLowerCase())
    );
    const matchesRating = fundi.rating >= minRating;
    const matchesPrice = maxPrice <= 0 || (getComparableRate(fundi.hourlyRate) ?? Number.POSITIVE_INFINITY) <= maxPrice;

    return matchesSkill && matchesLocation && matchesRating && matchesPrice;
  }).slice(0, 20).map((fundi) => ({
    id: fundi.id,
    name: fundi.name,
    skill: fundi.skill,
    skills: fundi.skills,
    location: fundi.location,
    neighborhood: fundi.neighborhood,
    rating: fundi.rating,
    jobsCompleted: fundi.jobsCompleted,
    hourlyRate: fundi.hourlyRate,
    photoURL: fundi.photoURL,
    isVerified: fundi.isVerified,
  }));
}

export async function GET(request: NextRequest) {
  return ApiErrorHandler.withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get('skill')?.trim() || '';
    const location = searchParams.get('location')?.trim() || '';
    const minRatingParam = searchParams.get('minRating');
    const maxPriceParam = searchParams.get('maxPrice');
    const minRating = minRatingParam ? Number(minRatingParam) : 0;
    const maxPrice = maxPriceParam ? Number(maxPriceParam) : 0;

    if (skill.length > 100 || location.length > 100) {
      return NextResponse.json({ error: 'Search terms must be 100 characters or fewer' }, { status: 400 });
    }
    if (!Number.isFinite(minRating) || minRating < 0 || minRating > 5) {
      return NextResponse.json({ error: 'Minimum rating must be between 0 and 5' }, { status: 400 });
    }
    if (!Number.isFinite(maxPrice) || (maxPriceParam !== null && maxPrice <= 0)) {
      return NextResponse.json({ error: 'Maximum price must be a positive number' }, { status: 400 });
    }

    try {
      const usersCollection = await getCollection('users');
      const query: Record<string, unknown> = { role: 'fundi' };
      const andClauses: Record<string, unknown>[] = [];

      if (minRating > 0) {
        query.rating = { $gte: minRating };
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

      const fundis: FundiDocument[] = [];
      for await (const fundi of usersCollection.find<FundiDocument>(query)) {
        const rate = getComparableRate(fundi.hourlyRate);
        if (maxPrice > 0 && (rate === null || rate > maxPrice)) continue;
        fundis.push(fundi);
        if (fundis.length === 20) break;
      }

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
    } catch (error) {
      console.warn('MongoDB search failed; using cached fallback fundis.', error);
      return createSuccessResponse(
        'Fundis retrieved successfully',
        filterFallbackFundis({ skill, location, minRating, maxPrice }),
      );
    }
  }, 'GET /api/location/search');
}