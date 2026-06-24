"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import WorkerCard from "@/app/components/WorkerCard";
import SearchBar from "@/app/components/SearchBar";
import { useGeolocation } from "@/lib/geolocation";
import type { Worker } from "@/app/types/worker";

type SearchPageProps = {
  searchParams: Promise<{
    service?: string;
    location?: string;
    lat?: string;
    lng?: string;
  }>;
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  const [query, setQuery] = useState({ service: "", location: "", lat: "", lng: "" });
  const [fundis, setFundis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { location: userLocation, loading: locationLoading } = useGeolocation();

  useEffect(() => {
    const loadSearchParams = async () => {
      const params = await searchParams;
      const newQuery = {
        service: params?.service?.toString() ?? "",
        location: params?.location?.toString() ?? "",
        lat: params?.lat?.toString() ?? userLocation?.latitude?.toString() ?? "",
        lng: params?.lng?.toString() ?? userLocation?.longitude?.toString() ?? "",
      };
      setQuery(newQuery);
      searchFundis(newQuery);
    };
    loadSearchParams();
  }, [searchParams, userLocation]);

  const searchFundis = async (searchQuery: typeof query) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.service) params.append('skill', searchQuery.service);
      if (searchQuery.location) params.append('location', searchQuery.location);
      if (searchQuery.lat && searchQuery.lng) {
        params.append('lat', searchQuery.lat);
        params.append('lng', searchQuery.lng);
        params.append('radius', '20'); // 20km radius
      }

      const response = await fetch(`/api/location/search?${params}`);
      const data = await response.json();
      const fundisData = Array.isArray(data) ? data : data?.data ?? [];
      if (Array.isArray(fundisData)) {
        setFundis(fundisData);
      } else {
        console.warn('Location search returned non-array response', data);
        setFundis([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setFundis([]);
    } finally {
      setLoading(false);
    }
  };

  const results: Worker[] = fundis.map((user: any) => ({
    id: user.id,
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
    photoURL: user.photoURL ||
      "https://images.unsplash.com/photo-1529101091764-c3526daf38fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    hourlyRate: user.hourlyRate ?? "Negotiable",
    description: user.description ?? "Experienced fundi ready to help with your project.",
    distance: user.distance,
  }));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Search Header */}
      <div className="gradient-hero py-24">
        <div className="container-max section-padding text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-primary-200 mb-4">
            Verified Trust • Local Reliability
          </p>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white leading-tight max-w-3xl mx-auto mb-4">
            Search artisan fundis that earn your trust.
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-10">
            Discover certified local professionals with clear ratings, verified profiles, and fast booking options.
          </p>
          <SearchBar initialService={query.service} initialLocation={query.location} />
          {locationLoading && (
            <p className="text-white/60 text-center text-sm mt-4">
              Getting your location...
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container-max section-padding">
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-6 mb-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-500">Minimum Rating</p>
              <div className="grid gap-2">
                {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                  <label key={rating} className="flex items-center gap-3 cursor-pointer rounded-2xl border border-neutral-200 px-4 py-3 transition hover:border-primary-400">
                    <input
                      type="radio"
                      name="rating"
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                      onChange={() => {
                        const newQuery = { ...query, minRating: rating.toString() };
                        setQuery(newQuery as any);
                        searchFundis(newQuery as any);
                      }}
                    />
                    <span className="text-sm text-neutral-700">{rating}+ Stars</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-500">Price Range</p>
              <select
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                onChange={(e) => {
                  const newQuery = { ...query, maxPrice: e.target.value };
                  setQuery(newQuery as any);
                  searchFundis(newQuery as any);
                }}
              >
                <option value="">Any Price</option>
                <option value="1000">Under KES 1,000/hr</option>
                <option value="2000">Under KES 2,000/hr</option>
                <option value="5000">Under KES 5,000/hr</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-500">Search Radius</p>
              <div className="space-y-3">
                <input
                  type="range"
                  min="1"
                  max="50"
                  defaultValue="20"
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>1km</span>
                  <span>50km</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">Filter results by rating, price, or distance.</p>
            <button
              onClick={() => {
                const resetQuery = { service: "", location: "", lat: "", lng: "" };
                setQuery(resetQuery);
                searchFundis(resetQuery);
              }}
              className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-3 text-sm font-semibold text-neutral-700 hover:border-primary-300 hover:text-primary-700 transition"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Main Results Area */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-heading font-bold text-secondary-500">
                {query.service || query.location ? "Search Results" : "Nearby Fundis"}
              </h2>
            </div>
            <div className="flex gap-3">
              <Link href="/become-a-fundi" className="btn-primary text-xs px-4 py-2">
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
    </div>
  );
}
