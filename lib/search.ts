import { getCollection } from "./db";
import type { User } from "./models/User";
import { mockWorkers } from "@/app/data/mockWorkers";

export interface SearchFilters {
  service?: string;
  location?: string;
}

export async function searchFundis({ service, location }: SearchFilters) {
  try {
    const usersCollection = await getCollection<User>("users");

    const query: any = { role: "fundi" };
    const andClauses: any[] = [];

    if (service) {
      let serviceSearchTerm = service.trim();
      
      // Map common variations (e.g., "Electrical" -> "Electrician")
      const variations: Record<string, string> = {
        "Electrical": "(Electrical|Electrician)",
        "Plumbing": "(Plumbing|Plumber)",
        "Carpentry": "(Carpentry|Carpenter)",
        "Painting": "(Painting|Painter)",
        "Masonry": "(Masonry|Mason)",
        "Cleaning": "(Cleaning|Cleaner)"
      };
      
      const pattern = variations[serviceSearchTerm] || serviceSearchTerm;
      const regex = new RegExp(pattern, "i");
      
      andClauses.push({
        $or: [
          { skill: regex },
          { skills: regex },
          { description: regex },
          { businessName: regex },
          { businessRegistration: regex },
        ],
      });
    }

    if (location) {
      const regex = new RegExp(location.trim(), "i");
      andClauses.push({
        $or: [{ location: regex }, { neighborhood: regex }, { city: regex }],
      });
    }

    if (andClauses.length) {
      query.$and = andClauses;
    }

    const results = await usersCollection
      .find(query, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return results;
  } catch (error) {
    console.error("MongoDB search failed, using fallback data:", error);
    // Fallback: filter mock workers if DB is unavailable
    return filterMockWorkers({ service, location });
  }
}

function filterMockWorkers({ service, location }: SearchFilters) {
  let results = mockWorkers;

  if (service) {
    const term = service.toLowerCase();
    results = results.filter(
      (w) =>
        w.skill.toLowerCase().includes(term) ||
        w.description.toLowerCase().includes(term)
    );
  }

  if (location) {
    const term = location.toLowerCase();
    results = results.filter((w) => w.location.toLowerCase().includes(term));
  }

  // Map mock workers to match User-like shape for the search page
  return results.map((w) => ({
    _id: w.id,
    name: w.name,
    email: w.email,
    phone: w.phone,
    skill: w.skill,
    location: w.location,
    availability: w.availability,
    photoURL: w.photoURL,
    hourlyRate: w.hourlyRate,
    description: w.description,
    rating: w.rating,
    jobsCompleted: w.jobsCompleted,
  }));
}
