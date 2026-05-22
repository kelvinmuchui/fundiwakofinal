"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Booking {
  _id: string;
  fundiId: string;
  clientId: string;
  serviceType: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  status: string;
  createdAt: string;
  fundi: {
    _id: string;
    name: string;
    skill: string;
    phone: string;
    photoURL?: string;
  };
  client: {
    _id?: string;
    name: string;
    phone?: string;
  };
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-800",
  in_progress: "bg-sky-100 text-sky-800",
  completed: "bg-slate-100 text-slate-800",
  cancelled: "bg-rose-100 text-rose-700",
  "awaiting quote": "bg-orange-100 text-orange-800",
  default: "bg-neutral-100 text-neutral-700",
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBookings();
    }
  }, [status]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const json = await response.json();
        setBookings(Array.isArray(json) ? json : json.data || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const userName = session?.user?.name ? String(session.user.name) : "Customer";

  const activeRequests = useMemo(() => {
    return bookings.filter((booking) =>
      !["completed", "cancelled"].includes(booking.status)
    );
  }, [bookings]);

  const recentActivity = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [bookings]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const statusLabel = (statusValue: string) => {
    return statusValue.replace(/_/g, " ");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Please sign in to view your dashboard</h1>
          <Link href="/auth/signin" className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-orange-600 transition">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <div className="rounded-4xl bg-slate-950 px-8 py-10 text-white shadow-xl">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Welcome back</p>
                  <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Welcome back, {userName}</h1>
                  <p className="mt-3 max-w-2xl text-sm text-slate-300">You have {activeRequests.length} active service request{activeRequests.length === 1 ? "" : "s"} today.</p>
                </div>

                <Link
                  href="/hire-fundis"
                  className="inline-flex items-center justify-center rounded-3xl bg-orange-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
                >
                  <span className="mr-2 text-lg">+</span>
                  Book New Service
                </Link>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="rounded-4xl bg-white p-6 shadow-lg shadow-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Active Requests</h2>
                    <p className="mt-2 text-sm text-slate-500">Quick view of your ongoing services.</p>
                  </div>
                  <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">{activeRequests.length}</span>
                </div>

                <div className="mt-6 space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      <div className="h-20 rounded-3xl bg-slate-100 animate-pulse" />
                      <div className="h-20 rounded-3xl bg-slate-100 animate-pulse" />
                    </div>
                  ) : activeRequests.length === 0 ? (
                    <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                      No active requests yet. Start by booking a new service.
                    </div>
                  ) : (
                    activeRequests.slice(0, 3).map((booking) => (
                      <div key={booking._id} className="rounded-[1.75rem] border border-slate-200 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{booking.serviceType}</p>
                            <p className="mt-2 text-sm text-slate-500">Requested {formatDate(booking.createdAt)} • {booking.fundi.name}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[booking.status] ?? statusStyles.default}`}>
                            {statusLabel(booking.status)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {activeRequests.length > 3 && (
                  <div className="mt-6 text-right">
                    <Link href="/dashboard" className="text-sm font-semibold text-orange-600 hover:text-orange-700">View all requests →</Link>
                  </div>
                )}
              </section>

              <section className="rounded-4xl bg-slate-950 p-6 text-white shadow-lg shadow-slate-300">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Pro Member</p>
                    <h2 className="mt-3 text-2xl font-semibold">Premium benefits</h2>
                  </div>
                  <div className="rounded-3xl bg-slate-900 px-4 py-2 text-sm text-slate-300">Active</div>
                </div>

                <p className="mt-6 text-sm leading-7 text-slate-300">You've saved KES 4,500 this month with Pro discounts and faster artisan matching.</p>

                <Link
                  href="/profile"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-orange-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition"
                >
                  Manage Subscription
                </Link>
              </section>
            </div>

            <section className="rounded-4xl bg-white p-6 shadow-lg shadow-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
                  <p className="mt-2 text-sm text-slate-500">Your latest service history and bookings.</p>
                </div>
                <Link href="/dashboard" className="text-sm font-semibold text-orange-600 hover:text-orange-700">See all</Link>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Artisan</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-500">Loading activity...</td>
                      </tr>
                    ) : recentActivity.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-500">No recent activity yet.</td>
                      </tr>
                    ) : (
                      recentActivity.map((booking) => (
                        <tr key={booking._id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">{booking.serviceType}</td>
                          <td className="px-6 py-4 text-slate-600">{booking.fundi.name}</td>
                          <td className="px-6 py-4 text-slate-600">{formatDate(booking.preferredDate)}</td>
                          <td className="px-6 py-4 text-slate-900">KES 12,400</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-4xl bg-white p-6 shadow-lg shadow-slate-200">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
                <span className="text-sm text-slate-500">Tap any card</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Link href="/search" className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 text-center transition hover:border-orange-300 hover:bg-orange-50">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">↺</div>
                  <p className="text-sm font-semibold text-slate-900">Book Again</p>
                </Link>
                <Link href="/support" className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 text-center transition hover:border-orange-300 hover:bg-orange-50">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">?</div>
                  <p className="text-sm font-semibold text-slate-900">Help Center</p>
                </Link>
                <Link href="/payments" className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 text-center transition hover:border-orange-300 hover:bg-orange-50">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">💳</div>
                  <p className="text-sm font-semibold text-slate-900">Payments</p>
                </Link>
                <Link href="/profile" className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 text-center transition hover:border-orange-300 hover:bg-orange-50">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">⚙️</div>
                  <p className="text-sm font-semibold text-slate-900">Settings</p>
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
