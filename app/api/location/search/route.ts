import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { ApiErrorHandler, createSuccessResponse } from '@/lib/errorHandler';

export async function GET(request: NextRequest) {
  return ApiErrorHandler.withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '10'); // km
    const skill = searchParams.get('skill');
    const location = searchParams.get('location');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '0');

    // Validate coordinates if provided
    if ((lat !== 0 || lng !== 0) && (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180)) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    if (radius < 0 || radius > 100) {
      return NextResponse.json({ error: 'Radius must be between 0 and 100 km' }, { status: 400 });
    }

    const usersCollection = await getCollection('users');

    let query: any = { role: 'fundi' };

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

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radius * 1000,
        },
      };
    }

    if (skill || location) {
      const andClauses: any[] = [];

      if (skill) {
        const skillRegex = new RegExp(skill.trim(), 'i');
        andClauses.push({
          $or: [
            { skill: skillRegex },
            { skills: { $in: [skill] } },
            { description: skillRegex },
          ],
        });
      }

      if (location) {
        const regex = new RegExp(location.trim(), 'i');
        andClauses.push({
          $or: [
            { neighborhood: regex }, 
            { location: typeof location === 'string' ? regex : { $exists: true } }, 
            { city: regex }
          ],
        });
      }

      if (andClauses.length) {
        query = { ...query, $and: andClauses };
      }
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
      distance:
        lat && lng && fundi.location?.coordinates
          ? calculateDistance(lat, lng, fundi.location.coordinates[1], fundi.location.coordinates[0])
          : undefined,
      rating: fundi.rating || 0,
      jobsCompleted: fundi.jobsCompleted || 0,
      hourlyRate: fundi.hourlyRate,
      photoURL: fundi.photoURL,
      isVerified: fundi.isVerified || false,
    }));

    return createSuccessResponse('Fundis retrieved successfully', formattedFundis);
  }, 'GET /api/location/search');
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}