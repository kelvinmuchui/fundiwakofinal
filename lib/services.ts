import { getCollection } from "./db";
import { FUNDI_SERVICE_CATALOG } from "./serviceCatalog";

export type Service = {
  title: string;
  description: string;
  fundiCount: number;
  color: string;
  iconName: string;
};

export type Testimonial = {
  name: string;
  location: string;
  service: string;
  rating: number;
  initials: string;
  review: string;
};

let seeded = false;

export async function ensureSeeded() {
  if (seeded) return;
  await seedSampleData();
  seeded = true;
}

export async function getServices(): Promise<Service[]> {
  try {
    await ensureSeeded();
    const servicesCollection = await getCollection<Service>("services");
    const usersCollection = await getCollection("users");
    
    // Get base services data
    const services = await servicesCollection.find().sort({ title: 1 }).toArray();
    
    // Calculate dynamic fundi counts
    const servicesWithCounts = await Promise.all(
      services.map(async (service) => {
        // Count fundis with this skill in primary OR secondary skills
        const fundiCount = await usersCollection.countDocuments({
          role: 'fundi',
          $or: [
            { skill: service.title },
            { skills: service.title }
          ]
        });
        
        return {
          ...service,
          fundiCount: fundiCount || 0
        };
      })
    );
    
    return servicesWithCounts;
  } catch (error) {
    console.error("Failed to fetch services from MongoDB:", error);
    // Return fallback mock data if MongoDB is unavailable
    return FUNDI_SERVICE_CATALOG.map((service) => ({ ...service, fundiCount: 0 }));
  }
}

export async function ensureServiceExists(title: string): Promise<string> {
  const normalizedTitle = title.trim();
  if (!normalizedTitle || normalizedTitle.length > 80) {
    throw new Error('Service title must be between 1 and 80 characters');
  }

  const servicesCollection = await getCollection<Service & { _id?: unknown }>('services');
  const escapedTitle = normalizedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const existingService = await servicesCollection.findOne({
    title: { $regex: `^${escapedTitle}$`, $options: 'i' }
  });

  if (existingService) return existingService.title;

  await servicesCollection.updateOne(
    { title: normalizedTitle },
    {
      $setOnInsert: {
        title: normalizedTitle,
        description: `${normalizedTitle} services offered by local fundis.`,
        color: 'bg-neutral-600',
        iconName: 'briefcase',
      }
    },
    { upsert: true }
  );

  return normalizedTitle;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    await ensureSeeded();
    const collection = await getCollection<Testimonial>("testimonials");
    const testimonials = await collection.find().sort({ name: 1 }).toArray();
    return testimonials;
  } catch (error) {
    console.error("Failed to fetch testimonials from MongoDB:", error);
    // Return fallback mock data if MongoDB is unavailable
    return [
      {
        name: "Sarah Wanjiku",
        location: "Nairobi",
        service: "Plumbing",
        rating: 5,
        initials: "SW",
        review:
          "Had a leaking pipe in the middle of the night. Found a fundi on this platform in 10 minutes. He arrived within the hour and fixed it perfectly. Life saver!",
      },
      {
        name: "David Ochieng",
        location: "Kisumu",
        service: "Electrical",
        rating: 5,
        initials: "DO",
        review:
          "We needed our new office fully wired. The electrician from FundiWako was professional, honest with material costs, and finished the job ahead of schedule.",
      },
      {
        name: "Grace Mutuku",
        location: "Mombasa",
        service: "Carpentry",
        rating: 4,
        initials: "GM",
        review:
          "Had custom kitchen cabinets made. Beautiful finish and exactly what we discussed. Only giving 4 stars because traffic made him a bit late on day one.",
      },
    ];
  }
}

export async function seedSampleData() {
  const services = await getCollection<Service>("services");
  const testimonials = await getCollection<Testimonial>("testimonials");

  const existingTestimonials = await testimonials.countDocuments();

  await Promise.all(FUNDI_SERVICE_CATALOG.map((service) =>
    services.updateOne({ title: service.title }, { $setOnInsert: service }, { upsert: true })
  ));

  if (existingTestimonials === 0) {
    await testimonials.insertMany([
      {
        name: "Sarah Wanjiku",
        location: "Nairobi",
        service: "Plumbing",
        rating: 5,
        initials: "SW",
        review:
          "Had a leaking pipe in the middle of the night. Found a fundi on this platform in 10 minutes. He arrived within the hour and fixed it perfectly. Life saver!",
      },
      {
        name: "David Ochieng",
        location: "Kisumu",
        service: "Electrical",
        rating: 5,
        initials: "DO",
        review:
          "We needed our new office fully wired. The electrician from FundiWako was professional, honest with material costs, and finished the job ahead of schedule.",
      },
      {
        name: "Grace Mutuku",
        location: "Mombasa",
        service: "Carpentry",
        rating: 4,
        initials: "GM",
        review:
          "Had custom kitchen cabinets made. Beautiful finish and exactly what we discussed. Only giving 4 stars because traffic made him a bit late on day one.",
      },
    ]);
  }
}
