import Link from "next/link";
import WorkerCard from "@/app/components/WorkerCard";
import SearchBar from "@/app/components/SearchBar";
import { searchFundis } from "@/lib/search";
import type { Worker } from "@/app/data/mockWorkers";

type SearchPageProps = {
  searchParams: Promise<{
    service?: string;
    location?: string;
  }>;
};

export const revalidate = 0;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = await searchParams;
  const service = query?.service?.toString() ?? "";
  const location = query?.location?.toString() ?? "";

  const fundis = await searchFundis({ service, location });

  const results: Worker[] = fundis.map((user: any) => ({
    id: user._id?.toString() ?? "",
    name: user.name,
    skill: user.skill ?? "General",
    location: user.location || "Nairobi",
    neighborhood: user.neighborhood || "",
    availability: user.availability ?? "Available Now",
    phone: user.phone,
    email: user.email,
    rating: user.rating ?? 0,
    jobsCompleted: user.jobsCompleted ?? 0,
    isVerified: user.isVerified || false,
    experience: user.experience || "",
    skills: user.skills || [],
    tvetInstitution: user.tvetInstitution || "",
    photoURL:
      user.photoURL ||
      "https://images.unsplash.com/photo-1529101091764-c3526daf38fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    hourlyRate: user.hourlyRate ?? "Negotiable",
    description:
      user.description ?? "Experienced fundi ready to help with your project.",
  }));

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Search Header */}
      <div className="gradient-hero pt-28 pb-10">
        <div className="container-max section-padding !pt-0 !pb-0">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2 text-center">
            Find Your Fundi
          </h1>
          <p className="text-white/70 text-center mb-8">
            {results.length > 0
              ? `${results.length} fundi${results.length !== 1 ? "s" : ""} found`
              : "Search by service and location"}
          </p>
          <SearchBar initialService={service} initialLocation={location} />
        </div>
      </div>

      {/* Results */}
      <div className="container-max section-padding">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-secondary-500">
              {service || location ? "Search Results" : "All Available Fundis"}
            </h2>
            <p className="text-neutral-500 mt-2">
              {service || location ? (
                <>
                  Showing fundis matching{" "}
                  <span className="font-semibold text-primary-500">
                    {service || "any service"}
                  </span>{" "}
                  in{" "}
                  <span className="font-semibold text-accent-500">
                    {location || "any location"}
                  </span>
                </>
              ) : (
                "Browse all verified fundis on our platform"
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="btn-secondary">
              ← Back to Home
            </Link>
            <Link href="/become-a-fundi" className="btn-primary">
              Become a Fundi
            </Link>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="rounded-3xl bg-white shadow-sm border border-neutral-200 p-16 text-center">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-heading font-semibold text-secondary-500 mb-3">
              No fundis found
            </h2>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              We couldn&apos;t find any fundis matching your search. Try a
              broader term or browse a different location.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/search" className="btn-secondary">
                View All Fundis
              </Link>
              <Link
                href="/become-a-fundi"
                className="text-primary-600 font-semibold underline hover:text-primary-700 transition-colors"
              >
                Know a fundi? Invite them to join
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {results.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
