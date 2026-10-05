"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FUNDI_SERVICE_CATALOG } from "@/lib/serviceCatalog";

type MarketplaceJob = {
  _id: string;
  title: string;
  serviceCategory: string;
  description: string;
  location: string;
  budgetType: "fixed" | "hourly";
  budgetMin: number;
  budgetMax: number;
  duration?: string;
  skills: string[];
  status: string;
  proposalCount: number;
  createdAt: string;
};

export default function JobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const [jobs, setJobs] = useState<MarketplaceJob[]>([]);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const controller = new AbortController();
    const loadJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (location.trim()) params.set("location", location.trim());
        const response = await fetch(`/api/jobs?${params}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load jobs");
        setJobs(data.jobs || []);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name !== "AbortError") {
          setError(loadError.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadJobs();
    return () => controller.abort();
  }, [status, category, location]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="min-h-[60vh] bg-neutral-50" />;
  }

  const isClient = role === "client";

  return (
    <main className="min-h-[70vh] bg-neutral-50 pb-16">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">FundiWako Marketplace</p>
              <h1 className="mt-2 text-3xl font-heading font-bold text-neutral-900">{isClient ? "Your posted jobs" : "Find work that fits"}</h1>
              <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                {isClient ? "Review your open opportunities and the proposals fundis have sent." : "Browse client requests and send a considered proposal for work you can deliver."}
              </p>
            </div>
            {isClient && <Link href="/jobs/new" className="btn-primary self-start sm:self-auto">Post a Job</Link>}
          </div>
          {!isClient && (
            <div className="mt-7 grid gap-3 sm:grid-cols-[minmax(0,1fr)_16rem]">
              <label className="sr-only" htmlFor="job-location">Filter by location</label>
              <input id="job-location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Filter by town or area" className="min-h-12 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/15" />
              <label className="sr-only" htmlFor="job-category">Filter by service</label>
              <select id="job-category" value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-12 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/15">
                <option value="">All services</option>
                {FUNDI_SERVICE_CATALOG.map((service) => <option key={service.title} value={service.title}>{service.title}</option>)}
              </select>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl border border-neutral-200 bg-white" />)}</div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">{isClient ? "You have not posted a job yet" : "No open jobs match those filters"}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">{isClient ? "Describe the work you need and compare proposals from local fundis." : "Try another service or location, then check back for new requests."}</p>
            {isClient && <Link href="/jobs/new" className="btn-primary mt-5">Post your first job</Link>}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <Link key={job._id} href={`/jobs/${job._id}`} className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-primary-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-600">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary-700">{job.serviceCategory}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${job.status === "open" ? "bg-emerald-50 text-emerald-800" : "bg-neutral-100 text-neutral-700"}`}>{job.status}</span>
                </div>
                <h2 className="mt-3 text-xl font-heading font-bold text-neutral-900 group-hover:text-primary-800">{job.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600">{job.description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-neutral-100 pt-4 text-sm text-neutral-600">
                  <span>{job.location}</span>
                  <span>KES {job.budgetMin.toLocaleString()}–{job.budgetMax.toLocaleString()} {job.budgetType === "hourly" ? "/ hr" : ""}</span>
                  {isClient && <span>{job.proposalCount} {job.proposalCount === 1 ? "proposal" : "proposals"}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}