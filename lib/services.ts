import { getCollection } from "./db";

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
    return [
      {
        title: "Plumbing",
        description: "Fix leaks, install pipes, water heaters and full bathroom fittings.",
        fundiCount: 450,
        color: "gradient-primary",
        iconName: "plumbing",
      },
      {
        title: "Electrical",
        description: "Wiring, lighting installations, fault finding and repairs.",
        fundiCount: 380,
        color: "gradient-secondary",
        iconName: "electrical",
      },
      {
        title: "Carpentry",
        description: "Custom furniture, cabinet making, doors, roofing and wood repairs.",
        fundiCount: 290,
        color: "gradient-accent",
        iconName: "carpentry",
      },
      {
        title: "Painting",
        description: "Interior and exterior painting, wallpapering and finishing.",
        fundiCount: 310,
        color: "bg-fuchsia-500",
        iconName: "painting",
      },
      {
        title: "Masonry",
        description: "Bricklaying, plastering, concrete work and stonemasonry.",
        fundiCount: 240,
        color: "bg-blue-600",
        iconName: "masonry",
      },
      {
        title: "Cleaning",
        description: "Deep cleaning, post-construction cleanup, upholstery and carpet cleaning.",
        fundiCount: 420,
        color: "bg-emerald-500",
        iconName: "cleaning",
      },
    ];
  }
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

  const existingServices = await services.countDocuments();
  const existingTestimonials = await testimonials.countDocuments();

  if (existingServices === 0) {
    await services.insertMany([
      {
        title: "Plumbing",
        description: "Fix leaks, install pipes, water heaters and full bathroom fittings.",
        fundiCount: 450,
        color: "gradient-primary",
        iconName: "plumbing",
      },
      {
        title: "Electrical",
        description: "Wiring, lighting installations, fault finding and repairs.",
        fundiCount: 380,
        color: "gradient-secondary",
        iconName: "electrical",
      },
      {
        title: "Carpentry",
        description: "Custom furniture, cabinet making, doors, roofing and wood repairs.",
        fundiCount: 290,
        color: "gradient-accent",
        iconName: "carpentry",
      },
      {
        title: "Painting",
        description: "Interior and exterior painting, wallpapering and finishing.",
        fundiCount: 310,
        color: "bg-fuchsia-500",
        iconName: "painting",
      },
      {
        title: "Masonry",
        description: "Bricklaying, plastering, concrete work and stonemasonry.",
        fundiCount: 240,
        color: "bg-blue-600",
        iconName: "masonry",
      },
      {
        title: "Cleaning",
        description: "Deep cleaning, post-construction cleanup, upholstery and carpet cleaning.",
        fundiCount: 420,
        color: "bg-emerald-500",
        iconName: "cleaning",
      },
    ]);
  }

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
