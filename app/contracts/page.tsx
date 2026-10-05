"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Contract = {
  _id: string;
  jobId: string;
  title: string;
  description: string;
  amount: number;
  duration: string;
  status: string;
  milestones: Array<{ title: string; amount: number; status: string }>;
  createdAt: string;
};

export default function ContractsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth");
    if (status !== "authenticated") return;
    let active = true;
    fetch("/api/contracts")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load contracts");
        if (active) setContracts(data.contracts || []);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load contracts");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status, router]);

  return (
    <main className="min-h-[70vh] bg-neutral-50 pb-16">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary-700">Work agreements</p>
          <h1 className="mt-2 text-3xl font-heading font-bold text-neutral-900">Contracts</h1>
          <p className="mt-2 text-sm text-neutral-600">Accepted job proposals become shared contract records for the client and fundi.</p>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        {loading ? <div className="space-y-3">{[0, 1, 2].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl border border-neutral-200 bg-white" />)}</div> : contracts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">No contracts yet</h2>
            <p className="mt-2 text-sm text-neutral-600">Contracts appear here after a client accepts a proposal for a posted job.</p>
            <Link href="/jobs" className="btn-primary mt-5">Explore jobs</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <article key={contract._id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-heading font-bold text-neutral-900">{contract.title}</h2><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-800">{contract.status}</span></div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{contract.description}</p>
                    <p className="mt-3 text-xs text-neutral-500">Created {new Date(contract.createdAt).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })} · {contract.duration}</p>
                  </div>
                  <div className="shrink-0 sm:text-right"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Agreed amount</p><p className="mt-1 text-xl font-bold text-neutral-900">KES {contract.amount.toLocaleString()}</p></div>
                </div>
                <div className="mt-5 border-t border-neutral-100 pt-4">
                  <p className="text-sm font-semibold text-neutral-800">Milestones</p>
                  {contract.milestones.length === 0 ? <p className="mt-1 text-sm text-neutral-600">No milestones have been added to this contract yet.</p> : <ul className="mt-3 grid gap-2 sm:grid-cols-2">{contract.milestones.map((milestone, index) => <li key={`${milestone.title}-${index}`} className="flex justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2 text-sm"><span className="font-medium text-neutral-800">{milestone.title}</span><span className="shrink-0 text-neutral-600">KES {milestone.amount.toLocaleString()} · {milestone.status}</span></li>)}</ul>}
                </div>
                <Link href={`/jobs/${contract.jobId}`} className="mt-4 inline-flex text-sm font-semibold text-primary-800 hover:underline">View original job</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}