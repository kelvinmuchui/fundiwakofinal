"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  LayoutDashboard,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Settings,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

type BookingStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled" | "declined";

type Booking = {
  _id: string;
  serviceType: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  status: BookingStatus;
  createdAt: string;
  quoteAmount?: number;
  clientId: string;
  client?: { _id?: string; name?: string; phone?: string };
};

type FundiProfile = {
  name?: string;
  skill?: string;
  description?: string;
  location?: string;
  neighborhood?: string;
  photoURL?: string;
  isVerified?: boolean;
  profileViews?: number;
  contactClicks?: number;
  availability?: string;
};

type Conversation = { unreadCount?: number };

const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_progress: "bg-sky-50 text-sky-700 border-sky-200",
  completed: "bg-neutral-100 text-neutral-600 border-neutral-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  declined: "bg-rose-50 text-rose-700 border-rose-200",
};

const navigation = [
  { label: "Overview", href: "/fundi/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/fundi/dashboard#bookings", icon: BriefcaseBusiness },
  { label: "Messages", href: "/messages", icon: Mail },
  { label: "My profile", href: "/fundi/profile", icon: UserRound },
];

async function readError(response: Response, fallback: string) {
  const result = await response.json().catch(() => null);
  return typeof result?.error === "string" ? result.error : fallback;
}

export default function FundiDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<FundiProfile>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  const loadDashboard = useCallback(async () => {
    setDashboardError("");
    try {
      const [profileResponse, bookingResponse] = await Promise.all([
        fetch("/api/fundi/profile", { cache: "no-store" }),
        fetch("/api/bookings", { cache: "no-store" }),
      ]);
      if (!profileResponse.ok) {
        throw new Error(await readError(profileResponse, "Could not load your profile."));
      }
      if (!bookingResponse.ok) {
        throw new Error(await readError(bookingResponse, "Could not load your booking requests."));
      }

      const profileData: FundiProfile = await profileResponse.json();
      const bookingResult = await bookingResponse.json();
      const bookingData = bookingResult.data ?? bookingResult;
      if (!Array.isArray(bookingData)) {
        throw new Error("The booking service returned an unexpected response.");
      }

      setProfile(profileData);
      setBookings(bookingData);

      const messageResponse = await fetch("/api/messages", { cache: "no-store" });
      if (messageResponse.ok) {
        const messageData: { conversations?: Conversation[] } = await messageResponse.json();
        setUnreadMessages(
          (messageData.conversations ?? []).reduce(
            (total, conversation) => total + (conversation.unreadCount ?? 0),
            0,
          ),
        );
      }
    } catch (error) {
      console.error("Error loading fundi dashboard:", error);
      setDashboardError(error instanceof Error ? error.message : "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth");
      return;
    }
    if ((session.user as { role?: string }).role !== "fundi") {
      router.push("/");
      return;
    }

    void loadDashboard();
  }, [loadDashboard, router, session, status]);

  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "pending"),
    [bookings],
  );
  const activeBookings = useMemo(
    () => bookings.filter((booking) => ["accepted", "in_progress"].includes(booking.status)),
    [bookings],
  );
  const completedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "completed"),
    [bookings],
  );
  const closedBookings = useMemo(
    () => bookings.filter((booking) => ["cancelled", "declined"].includes(booking.status)),
    [bookings],
  );
  const profileFields = [
    profile.name,
    profile.skill,
    profile.description,
    profile.location,
    profile.neighborhood,
    profile.availability,
  ];
  const profileStrength = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100,
  );
  const stats: { value: string; label: string; icon: LucideIcon; style: string }[] = [
    { value: pendingBookings.length.toString(), label: "New requests", icon: Clock3, style: "text-amber-600 bg-amber-50" },
    { value: activeBookings.length.toString(), label: "Active jobs", icon: BriefcaseBusiness, style: "text-sky-600 bg-sky-50" },
    { value: completedBookings.length.toString(), label: "Completed jobs", icon: CheckCircle2, style: "text-emerald-600 bg-emerald-50" },
  ];

  const updateBooking = async (bookingId: string, nextStatus: BookingStatus) => {
    setActionLoading(bookingId);
    setDashboardError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: nextStatus }),
      });
      if (!response.ok) {
        throw new Error(await readError(response, "Could not update this request."));
      }
      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId ? { ...booking, status: nextStatus } : booking,
        ),
      );
    } catch (error) {
      console.error("Error updating booking:", error);
      setDashboardError(error instanceof Error ? error.message : "Could not update this request.");
    } finally {
      setActionLoading(null);
    }
  };

  const messageClient = async (clientId: string) => {
    setActionLoading(`message:${clientId}`);
    setDashboardError("");
    try {
      const response = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: clientId }),
      });
      if (!response.ok) {
        throw new Error(await readError(response, "Could not open a conversation with this client."));
      }
      const result: { conversationId: string } = await response.json();
      router.push(`/messages/${result.conversationId}`);
    } catch (error) {
      console.error("Error opening client conversation:", error);
      setDashboardError(error instanceof Error ? error.message : "Could not open this conversation.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Date not set"
      : date.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
  };
  const displayName = profile.name || session?.user?.name || "Fundi";

  const renderBookingSection = (
    title: string,
    description: string,
    items: Booking[],
    emptyMessage: string,
  ) => (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-100 px-5 py-5 sm:px-6">
        <div>
          <h2 className="font-heading text-lg font-bold">{title}</h2>
          <p className="mt-1 text-xs text-neutral-500">{description}</p>
        </div>
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-600">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <BriefcaseBusiness className="mx-auto text-neutral-700" size={30} />
          <p className="mt-3 text-sm text-neutral-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {items.map((booking) => (
            <article key={booking._id} className="px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{booking.serviceType}</h3>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyles[booking.status]}`}>
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-500">
                    {booking.client?.name || "Client"} · {formatDate(booking.preferredDate)} at {booking.preferredTime}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                    <MapPin size={13} /> {booking.location}
                  </p>
                  <p className="mt-3 max-w-xl whitespace-pre-wrap text-sm text-neutral-600">{booking.description}</p>
                  {booking.quoteAmount != null && (
                    <p className="mt-2 text-sm font-semibold text-secondary-500">
                      Quote: KES {booking.quoteAmount.toLocaleString("en-KE")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {booking.status === "pending" && (
                    <>
                      <button
                        type="button"
                        disabled={actionLoading === booking._id}
                        onClick={() => void updateBooking(booking._id, "accepted")}
                        className="rounded-xl bg-primary-500 px-3 py-2 text-xs font-bold text-white hover:bg-primary-600 disabled:opacity-50"
                      >
                        {actionLoading === booking._id ? "Saving..." : "Accept request"}
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === booking._id}
                        onClick={() => void updateBooking(booking._id, "declined")}
                        className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {booking.status === "accepted" && (
                    <button
                      type="button"
                      disabled={actionLoading === booking._id}
                      onClick={() => void updateBooking(booking._id, "in_progress")}
                      className="rounded-xl bg-secondary-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      Start job
                    </button>
                  )}
                  {booking.status === "in_progress" && (
                    <button
                      type="button"
                      disabled={actionLoading === booking._id}
                      onClick={() => void updateBooking(booking._id, "completed")}
                      className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      Mark complete
                    </button>
                  )}
                  {booking.clientId && booking.clientId !== "guest" && (
                    <button
                      type="button"
                      disabled={actionLoading === `message:${booking.clientId}`}
                      onClick={() => void messageClient(booking.clientId)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    >
                      <MessageCircle size={14} />
                      Message client
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-secondary-500">
      <div className="mx-auto max-w-360 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <Link href="/fundi/dashboard" className="font-heading text-xl font-bold">
            Fundi<span className="gradient-text">Wako</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="rounded-xl border border-neutral-200 bg-white p-2"
            aria-label="Toggle dashboard navigation"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
          <aside className={`${mobileNavOpen ? "block" : "hidden"} lg:block`}>
            <div className="lg:sticky lg:top-32">
              <Link href="/fundi/dashboard" className="mb-10 hidden font-heading text-2xl font-bold lg:block">
                Fundi<span className="gradient-text">Wako</span>
              </Link>
              <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                <p className="px-3 pb-3 pt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">Workspace</p>
                <nav className="space-y-1">
                  {navigation.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${label === "Overview" ? "bg-primary-50 text-primary-600" : "text-neutral-600 hover:bg-neutral-50 hover:text-secondary-500"}`}
                    >
                      <Icon size={18} strokeWidth={1.8} />
                      <span>{label}</span>
                      {label === "Messages" && unreadMessages > 0 && (
                        <span className="ml-auto rounded-full bg-primary-500 px-2 py-0.5 text-[10px] text-white">{unreadMessages}</span>
                      )}
                    </Link>
                  ))}
                </nav>
                <div className="mt-5 border-t border-neutral-100 pt-3">
                  <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50">
                    <Settings size={18} strokeWidth={1.8} /> Settings
                  </Link>
                </div>
              </div>
              <div className="mt-5 hidden rounded-2xl bg-secondary-500 p-5 text-white lg:block">
                <p className="text-xs text-white/60">Your visibility</p>
                <p className="mt-2 font-heading text-lg font-bold">
                  {profile.availability === "unavailable" ? "Currently offline" : "Available for work"}
                </p>
                <Link href="/fundi/profile" className="mt-4 inline-flex text-xs font-semibold text-primary-300">
                  Update availability <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-primary-600">
                  {new Date().toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                  Welcome, {displayName.split(" ")[0]}.
                </h1>
                <p className="mt-2 text-sm text-neutral-500">Manage requests, jobs, and your client conversations.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/jobs" className="btn-secondary self-start sm:self-auto">Browse jobs</Link>
                <Link href="/contracts" className="self-start rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 sm:self-auto">Contracts</Link>
                <Link href="/fundi/profile" className="btn-primary self-start sm:self-auto">Edit profile</Link>
              </div>
            </div>

            {dashboardError && (
              <div role="alert" className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <p>{dashboardError}</p>
                <button type="button" onClick={() => void loadDashboard()} className="shrink-0 font-semibold underline">Try again</button>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map(({ value, label, icon: StatIcon, style }) => (
                <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${style}`}><StatIcon size={19} /></div>
                  <p className="mt-4 font-heading text-2xl font-bold">{value}</p>
                  <p className="mt-1 text-xs text-neutral-500">{label}</p>
                </div>
              ))}
            </div>

            <div id="bookings" className="mt-6 space-y-5">
              {renderBookingSection("New requests", "Review and accept the work you want to take on.", pendingBookings, "New client requests will appear here.")}
              {renderBookingSection("Active jobs", "Keep track of accepted work and mark jobs complete when finished.", activeBookings, "Accepted jobs will appear here.")}
              {renderBookingSection("Completed jobs", "Your completed work and client details.", completedBookings, "Completed jobs will appear here.")}
              {closedBookings.length > 0 && renderBookingSection("Closed requests", "Declined or cancelled bookings.", closedBookings, "No closed requests.")}
            </div>
          </main>

          <aside className="grid content-start gap-5">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                {profile.photoURL ? (
                  <Image
                    src={profile.photoURL}
                    alt={`${displayName}'s profile`}
                    width={52}
                    height={52}
                    unoptimized
                    className="h-13 w-13 rounded-full border border-neutral-200 object-cover"
                  />
                ) : (
                  <div className="flex h-13 w-13 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                    <UserRound size={23} />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="truncate font-heading font-bold">{displayName}</h2>
                  <p className="truncate text-xs text-neutral-500">{profile.skill || "Add your main skill"}</p>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500">
                <MapPin size={14} /> {[profile.neighborhood, profile.location].filter(Boolean).join(", ") || "Add your location"}
              </p>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">
                {profile.description || "Add a short introduction so clients can learn about your experience."}
              </p>
              <Link href="/fundi/profile" className="mt-4 inline-flex items-center text-xs font-bold text-primary-600">
                View and edit profile <ChevronRight size={14} />
              </Link>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-bold">Profile strength</h2>
                <span className="text-sm font-bold text-primary-600">{profileStrength}%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${profileStrength}%` }} />
              </div>
              <p className="mt-3 text-xs leading-5 text-neutral-500">Complete your profile to help clients find and trust you.</p>
              <Link href="/fundi/profile" className="mt-4 inline-flex items-center text-xs font-bold text-primary-600">Improve profile <ChevronRight size={14} /></Link>
            </section>

            <section className="rounded-2xl bg-secondary-500 p-5 text-white">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/60">This month</p>
                <CircleDollarSign size={19} className="text-primary-300" />
              </div>
              <p className="mt-3 font-heading text-3xl font-bold">KES 0</p>
              <p className="mt-1 text-xs text-white/60">Completed job earnings</p>
              <p className="mt-5 text-[11px] leading-5 text-white/60">Earnings tracking updates when payments are processed through FundiWako.</p>
            </section>

            <section className="rounded-2xl border border-primary-100 bg-primary-50 p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-600"><Bell size={18} /></div>
                <span className="text-xs font-bold text-primary-700">{profile.isVerified ? "Verified" : "Pending verification"}</span>
              </div>
              <h2 className="mt-4 font-heading font-bold">Build client trust</h2>
              <p className="mt-2 text-xs leading-5 text-neutral-600">Add recent work photos and complete verification to stand out to clients.</p>
              <Link href="/fundi/profile" className="mt-4 inline-flex text-xs font-bold text-primary-700">Update portfolio <ChevronRight size={14} /></Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
