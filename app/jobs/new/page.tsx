"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FUNDI_SERVICE_CATALOG } from "@/lib/serviceCatalog";

export default function NewJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const [form, setForm] = useState({ title: "", serviceCategory: FUNDI_SERVICE_CATALOG[0].title, description: "", location: "", budgetType: "fixed", budgetMin: "", budgetMax: "", duration: "", skills: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && role !== "client") router.replace("/jobs");
  }, [status, role, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budgetMin: Number(form.budgetMin),
          budgetMax: Number(form.budgetMax),
          skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const details = Object.values(data.details || {}).flat().join(" ");
        throw new Error(details || data.error || "Could not post this job");
      }
      router.push(`/jobs/${data.jobId}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not post this job");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || role !== "client") return <div className="min-h-[60vh] bg-neutral-50" />;

  return (
    <main className="min-h-[70vh] bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/jobs" className="text-sm font-semibold text-primary-800 hover:underline">Back to jobs</Link>
        <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary-700">Client job post</p>
          <h1 className="mt-2 text-3xl font-heading font-bold text-neutral-900">Describe the work you need</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Fundis will review your scope and send a proposal with a price and estimated duration.</p>
          {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
          <form onSubmit={submit} className="mt-7 space-y-5">
            <Field label="Job title"><input required minLength={5} maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Replace leaking kitchen pipes" className={inputClass} /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Service"><select value={form.serviceCategory} onChange={(event) => setForm({ ...form, serviceCategory: event.target.value })} className={inputClass}>{FUNDI_SERVICE_CATALOG.map((service) => <option key={service.title} value={service.title}>{service.title}</option>)}</select></Field>
              <Field label="Location"><input required minLength={3} maxLength={160} value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Town or neighbourhood" className={inputClass} /></Field>
            </div>
            <Field label="Work description"><textarea required minLength={20} maxLength={2000} rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe the task, current condition, materials, and any access details." className={`${inputClass} resize-y`} /></Field>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Budget type"><select value={form.budgetType} onChange={(event) => setForm({ ...form, budgetType: event.target.value })} className={inputClass}><option value="fixed">Fixed project</option><option value="hourly">Hourly</option></select></Field>
              <Field label="Minimum (KES)"><input required type="number" min="1" max="10000000" step="1" value={form.budgetMin} onChange={(event) => setForm({ ...form, budgetMin: event.target.value })} className={inputClass} /></Field>
              <Field label="Maximum (KES)"><input required type="number" min="1" max="10000000" step="1" value={form.budgetMax} onChange={(event) => setForm({ ...form, budgetMax: event.target.value })} className={inputClass} /></Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Expected duration"><input maxLength={120} value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} placeholder="e.g. 2–3 days" className={inputClass} /></Field>
              <Field label="Skills or materials"><input value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} placeholder="Comma-separated" className={inputClass} /></Field>
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-neutral-100 pt-5">
              <Link href="/jobs" className="inline-flex min-h-11 items-center rounded-xl border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">Cancel</Link>
              <button type="submit" disabled={submitting} className="btn-primary min-h-11 disabled:cursor-wait disabled:opacity-60">{submitting ? "Posting…" : "Post job"}</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

const inputClass = "mt-2 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/15";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-neutral-800">{label}{children}</label>;
}