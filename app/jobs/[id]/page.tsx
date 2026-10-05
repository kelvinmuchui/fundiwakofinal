"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";

type Job = {
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
};

type Proposal = {
  _id: string;
  coverLetter: string;
  amount: number;
  duration: string;
  status: string;
  fundi?: { _id: string; name: string; skill?: string; location?: string; rating?: number; jobsCompleted?: number; photoURL?: string; isVerified?: boolean } | null;
};

export default function MarketplaceJobPage() {
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const [job, setJob] = useState<Job | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [hasSubmittedProposal, setHasSubmittedProposal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") router.replace("/auth");
  }, [sessionStatus, router]);

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !jobId) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load job");
        if (!active) return;
        setJob(data.job);
        setHasSubmittedProposal(Boolean(data.hasSubmittedProposal));
        if (role === "client") {
          const proposalResponse = await fetch(`/api/jobs/${jobId}/proposals`);
          const proposalData = await proposalResponse.json();
          if (!proposalResponse.ok) throw new Error(proposalData.error || "Could not load proposals");
          if (active) setProposals(proposalData.proposals || []);
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load job");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [sessionStatus, jobId, role]);

  const submitProposal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorking(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/jobs/${jobId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverLetter, amount: Number(amount), duration }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not send proposal");
      setHasSubmittedProposal(true);
      setMessage("Your proposal has been sent to the client.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not send proposal");
    } finally {
      setWorking(false);
    }
  };

  const decideProposal = async (proposal: Proposal, status: "accepted" | "rejected") => {
    setWorking(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/jobs/${jobId}/proposals/${proposal._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update proposal");
      if (status === "accepted") {
        setMessage("Proposal accepted. A contract has been created for this job.");
        setJob((current) => current ? { ...current, status: "awarded" } : current);
        setProposals((current) => current.map((item) => ({ ...item, status: item._id === proposal._id ? "accepted" : item.status === "pending" ? "rejected" : item.status })));
      } else {
        setProposals((current) => current.map((item) => item._id === proposal._id ? { ...item, status: "rejected" } : item));
      }
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : "Could not update proposal");
    } finally {
      setWorking(false);
    }
  };

  if (loading || sessionStatus === "loading") return <main className="min-h-[60vh] bg-neutral-50" />;
  if (!job) return <main className="min-h-[60vh] bg-neutral-50 px-4 py-12"><div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center"><h1 className="text-xl font-bold text-neutral-900">Job unavailable</h1><p className="mt-2 text-sm text-neutral-600">{error || "This job may have been closed or removed."}</p><Link href="/jobs" className="btn-primary mt-5">Back to jobs</Link></div></main>;

  const canPropose = role === "fundi" && job.status === "open" && !hasSubmittedProposal;
  const canReview = role === "client" && job.status === "open";

  return (
    <main className="min-h-[70vh] bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/jobs" className="text-sm font-semibold text-primary-800 hover:underline">Back to jobs</Link>
        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        {message && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</p>}

        <section className="mt-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-800">{job.serviceCategory}</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold capitalize text-neutral-700">{job.status}</span>
          </div>
          <h1 className="mt-4 text-3xl font-heading font-bold text-neutral-900">{job.title}</h1>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-neutral-700">{job.description}</p>
          <div className="mt-6 grid gap-4 border-y border-neutral-100 py-5 sm:grid-cols-3">
            <Detail label="Location" value={job.location} />
            <Detail label="Budget" value={`KES ${job.budgetMin.toLocaleString()}–${job.budgetMax.toLocaleString()}${job.budgetType === "hourly" ? " / hr" : ""}`} />
            <Detail label="Expected duration" value={job.duration || "To be agreed"} />
          </div>
          {job.skills.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{job.skills.map((skill) => <span key={skill} className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700">{skill}</span>)}</div>}
        </section>

        {canPropose && (
          <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-heading font-bold text-neutral-900">Send a proposal</h2>
            <p className="mt-1 text-sm text-neutral-600">Share how you would approach the work and give a clear price and timeframe.</p>
            <form onSubmit={submitProposal} className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-neutral-800">Proposal amount (KES)<input required type="number" min="1" max="10000000" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} className={inputClass} /></label>
              <label className="block text-sm font-semibold text-neutral-800">Estimated duration<input required minLength={2} maxLength={120} value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="e.g. 2 days" className={inputClass} /></label>
              <label className="block text-sm font-semibold text-neutral-800">Cover letter<textarea required minLength={30} maxLength={2000} rows={5} value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} placeholder="Explain relevant experience and how you will complete the job." className={`${inputClass} resize-y`} /></label>
              <button disabled={working} className="btn-primary min-h-11 disabled:opacity-60">{working ? "Sending…" : "Send proposal"}</button>
            </form>
          </section>
        )}
        {role === "fundi" && hasSubmittedProposal && <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">You have already submitted a proposal for this job.</p>}

        {role === "client" && (
          <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-heading font-bold text-neutral-900">Proposals</h2><p className="mt-1 text-sm text-neutral-600">Compare each fundi’s approach, price, and experience.</p></div><span className="text-sm font-semibold text-neutral-600">{proposals.length}</span></div>
            {proposals.length === 0 ? <p className="mt-5 rounded-xl bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-600">No proposals yet. Fundis can respond while this job is open.</p> : (
              <div className="mt-5 space-y-4">
                {proposals.map((proposal) => (
                  <article key={proposal._id} className="rounded-xl border border-neutral-200 p-4 sm:p-5">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div><h3 className="font-semibold text-neutral-900">{proposal.fundi?.name || "Fundi"}</h3><p className="mt-1 text-sm text-neutral-600">{[proposal.fundi?.skill, proposal.fundi?.location].filter(Boolean).join(" · ")}</p></div>
                      <div className="sm:text-right"><p className="font-bold text-neutral-900">KES {proposal.amount.toLocaleString()}</p><p className="mt-1 text-sm text-neutral-600">{proposal.duration}</p></div>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-neutral-700">{proposal.coverLetter}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold capitalize text-neutral-700">{proposal.status}</span>
                      {canReview && proposal.status === "pending" && <div className="flex gap-2"><button type="button" disabled={working} onClick={() => decideProposal(proposal, "rejected")} className="min-h-10 rounded-xl border border-neutral-300 px-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">Decline</button><button type="button" disabled={working} onClick={() => decideProposal(proposal, "accepted")} className="min-h-10 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">Accept and create contract</button></div>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

const inputClass = "mt-2 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/15";

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{label}</p><p className="mt-1 text-sm font-semibold text-neutral-900">{value}</p></div>;
}