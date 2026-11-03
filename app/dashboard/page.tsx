"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import ClientReviewForm from "@/app/components/ClientReviewForm";

interface Booking {
  _id: string;
  fundiId: string;
  serviceType: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  status: string;
  paymentStatus?: string;
  createdAt: string;
  quoteAmount?: number;
  fundi: {
    _id: string;
    name: string;
    skill: string;
    photoURL?: string;
  } | null;
}

type BookingFilter = "all" | "active" | "completed";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-emerald-50 text-emerald-700",
  in_progress: "bg-sky-50 text-sky-700",
  completion_requested: "bg-orange-50 text-orange-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-rose-50 text-rose-700",
  declined: "bg-rose-50 text-rose-700",
  "awaiting quote": "bg-orange-50 text-orange-700",
};

const isActiveBooking = (booking: Booking) =>
  !["completed", "cancelled", "declined"].includes(booking.status);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [filter, setFilter] = useState<BookingFilter>("all");

  const fetchBookings = useCallback(async () => {
    setLoadError("");
    try {
      const response = await fetch("/api/bookings", { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to load bookings (${response.status})`);
      const json: { data?: Booking[] } = await response.json();
      setBookings(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setLoadError("Your requests could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") void fetchBookings();
    if (status === "unauthenticated") setLoading(false);
  }, [status, fetchBookings]);

  const activeRequests = useMemo(() => bookings.filter(isActiveBooking), [bookings]);
  const completedRequests = useMemo(
    () => bookings.filter((booking) => booking.status === "completed"),
    [bookings],
  );
  const visibleBookings = useMemo(() => {
    if (filter === "active") return activeRequests;
    if (filter === "completed") return completedRequests;
    return bookings;
  }, [activeRequests, bookings, completedRequests, filter]);

  const userName = session?.user?.name ? String(session.user.name).split(" ")[0] : "there";

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date not set";
    const date = new Date(dateString);
    return Number.isNaN(date.getTime())
      ? "Date not set"
      : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const cancelBooking = async (bookingId: string) => {
    setActionLoading(bookingId);
    setActionError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: "cancelled" }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Your request could not be cancelled.");
      }
      await fetchBookings();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Your request could not be cancelled.");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmCompletion = async (bookingId: string) => {
    setActionLoading(bookingId);
    setActionError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: "completed" }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Work completion could not be confirmed.");
      }
      router.push(`/payments?bookingId=${encodeURIComponent(bookingId)}&action=release`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Work completion could not be confirmed.");
    } finally {
      setActionLoading(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Sign in to view your dashboard</h1>
          <p className="mt-3 text-slate-600">Manage your bookings and find trusted professionals.</p>
          <Link href="/auth/signin" className="mt-6 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16 pt-28 sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-600">CLIENT DASHBOARD</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Good to see you, {userName}
            </h1>
            <p className="mt-2 text-slate-600">Everything for your projects, in one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/search" className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">
              Find a professional
            </Link>
            <Link href="/jobs/new" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Post a job
            </Link>
          </div>
        </header>

        <section aria-label="Booking overview" className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active requests", value: loading ? "—" : activeRequests.length },
            { label: "Completed projects", value: loading ? "—" : completedRequests.length },
            { label: "All requests", value: loading ? "—" : bookings.length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{stat.value}</p>
            </div>
          ))}
        </section>

        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Your requests</h2>
                <p className="mt-1 text-sm text-slate-500">Track bookings and stay up to date with your fundis.</p>
              </div>
              <div className="flex rounded-xl bg-slate-100 p-1" aria-label="Filter requests">
                {(["all", "active", "completed"] as BookingFilter[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${filter === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {loadError && (
              <div role="alert" className="m-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <p>{loadError}</p>
                <button type="button" onClick={() => void fetchBookings()} className="mt-2 font-semibold underline">Try again</button>
              </div>
            )}
            {actionError && (
              <p role="alert" className="mx-5 mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{actionError}</p>
            )}

            {loading ? (
              <div className="space-y-3 p-5 sm:p-6" role="status" aria-label="Loading requests">
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ) : visibleBookings.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-xl text-orange-600">+</div>
                <h3 className="mt-4 font-semibold text-slate-900">
                  {filter === "all" ? "No requests yet" : `No ${filter} requests`}
                </h3>
                <p className="mt-2 text-sm text-slate-500">Find a local professional and send your first request.</p>
                <Link href="/search" className="mt-5 inline-flex font-semibold text-orange-600 hover:text-orange-700">Browse professionals →</Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {visibleBookings.map((booking) => (
                  <li key={booking._id} className="p-5 sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-950">{booking.serviceType}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[booking.status] ?? "bg-slate-100 text-slate-600"}`}>
                            {booking.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {booking.fundi?.name ?? "Professional"}{booking.fundi?.skill ? ` · ${booking.fundi.skill}` : ""}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          {formatDate(booking.preferredDate)}{booking.preferredTime ? ` · ${booking.preferredTime}` : ""}
                          {booking.location ? ` · ${booking.location}` : ""}
                        </p>
                        {booking.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{booking.description}</p>}
                        {userRole === "client" && booking.status === "completed" && booking.fundi && (
                          <ClientReviewForm
                            bookingId={booking._id}
                            fundiId={booking.fundiId}
                            fundiName={booking.fundi.name}
                          />
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {booking.quoteAmount !== undefined && (
                          <span className="text-sm font-semibold text-slate-700">KES {booking.quoteAmount.toLocaleString()}</span>
                        )}
                        {userRole === "client" && booking.status === "accepted" && booking.paymentStatus !== "escrowed" && booking.quoteAmount && (
                          <Link
                            href={`/payments?bookingId=${encodeURIComponent(booking._id)}&action=fund`}
                            className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                          >
                            Fund escrow · KES {booking.quoteAmount.toLocaleString()}
                          </Link>
                        )}
                        {userRole === "client" && booking.status === "completion_requested" && (
                          <button
                            type="button"
                            onClick={() => void confirmCompletion(booking._id)}
                            disabled={actionLoading === booking._id}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {actionLoading === booking._id ? "Confirming…" : "Confirm work complete"}
                          </button>
                        )}
                        {isActiveBooking(booking) && ["pending", "accepted"].includes(booking.status) && (
                          <button
                            type="button"
                            onClick={() => void cancelBooking(booking._id)}
                            disabled={actionLoading === booking._id}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-rose-300 hover:text-rose-700 disabled:opacity-50"
                          >
                            {actionLoading === booking._id ? "Cancelling…" : "Cancel"}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-bold text-slate-950">Quick links</h2>
              <nav className="mt-3 divide-y divide-slate-100">
                {[
                  { label: "My profile", href: "/profile", detail: "Update your account details" },
                  { label: "Contracts", href: "/contracts", detail: "Review your agreements" },
                  { label: "Payments", href: "/payments", detail: "View payments and escrow" },
                  { label: "My jobs", href: "/jobs", detail: "Manage your job posts" },
                  { label: "Messages", href: "/messages", detail: "Contact your professionals" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="block py-3 transition hover:text-orange-700">
                    <span className="block text-sm font-semibold text-slate-800">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{item.detail}</span>
                  </Link>
                ))}
              </nav>
            </section>
            <section className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
              <h2 className="font-bold text-slate-950">Need a hand?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Browse verified professionals by service, location, rating, and price.</p>
              <Link href="/search" className="mt-4 inline-flex text-sm font-semibold text-orange-700 hover:text-orange-800">Explore fundis →</Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
