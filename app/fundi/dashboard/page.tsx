"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bell, BriefcaseBusiness, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, LayoutDashboard, Mail, MapPin, Menu, Settings, UserRound, X, type LucideIcon } from "lucide-react";

type Booking = {
  _id: string;
  serviceType: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  status: string;
  createdAt: string;
  quoteAmount?: number;
  client?: { name?: string; phone?: string };
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

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_progress: "bg-sky-50 text-sky-700 border-sky-200",
  completed: "bg-neutral-100 text-neutral-600 border-neutral-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const navigation = [
  { label: "Overview", href: "/fundi/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/fundi/dashboard#bookings", icon: BriefcaseBusiness },
  { label: "Messages", href: "/messages", icon: Mail },
  { label: "My profile", href: "/fundi/profile", icon: UserRound },
];

export default function FundiDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<FundiProfile>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

    const loadDashboard = async () => {
      try {
        const [profileResponse, bookingResponse, messageResponse] = await Promise.all([
          fetch("/api/fundi/profile"),
          fetch("/api/bookings"),
          fetch("/api/messages"),
        ]);

        if (profileResponse.ok) setProfile(await profileResponse.json());
        if (bookingResponse.ok) {
          const bookingData = await bookingResponse.json();
          setBookings(Array.isArray(bookingData) ? bookingData : bookingData.data || []);
        }
        if (messageResponse.ok) {
          const messageData = await messageResponse.json();
          setUnreadMessages((messageData.conversations || []).reduce((total: number, conversation: { unreadCount?: number }) => total + (conversation.unreadCount || 0), 0));
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router, session, status]);

  const activeBookings = useMemo(() => bookings.filter((booking) => !["completed", "cancelled"].includes(booking.status)), [bookings]);
  const pendingBookings = useMemo(() => bookings.filter((booking) => booking.status === "pending"), [bookings]);
  const completedBookings = useMemo(() => bookings.filter((booking) => booking.status === "completed"), [bookings]);
  const profileFields = [profile.name, profile.skill, profile.description, profile.location, profile.neighborhood, profile.availability];
  const profileStrength = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);
  const stats: { value: string; label: string; icon: LucideIcon; style: string }[] = [
    { value: pendingBookings.length.toString(), label: "New requests", icon: Clock3, style: "text-amber-600 bg-amber-50" },
    { value: activeBookings.length.toString(), label: "Active jobs", icon: BriefcaseBusiness, style: "text-sky-600 bg-sky-50" },
    { value: completedBookings.length.toString(), label: "Completed", icon: CheckCircle2, style: "text-emerald-600 bg-emerald-50" },
  ];

  const updateBooking = async (bookingId: string, nextStatus: string) => {
    setActionLoading(bookingId);
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: nextStatus }),
      });
      if (response.ok) setBookings((current) => current.map((booking) => booking._id === bookingId ? { ...booking, status: nextStatus } : booking));
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (value: string) => new Date(value).toLocaleDateString("en-KE", { month: "short", day: "numeric" });
  const displayName = profile.name || session?.user?.name || "Fundi";

  if (status === "loading" || loading) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-secondary-500">
      <div className="mx-auto max-w-360 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <Link href="/fundi/dashboard" className="font-heading text-xl font-bold">Fundi<span className="gradient-text">Wako</span></Link>
          <button type="button" onClick={() => setMobileNavOpen(!mobileNavOpen)} className="p-2 rounded-xl bg-white border border-neutral-200" aria-label="Toggle dashboard navigation">
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
          <aside className={`${mobileNavOpen ? "block" : "hidden"} lg:block`}>
            <div className="lg:sticky lg:top-32">
              <Link href="/fundi/dashboard" className="hidden lg:block font-heading text-2xl font-bold mb-10">Fundi<span className="gradient-text">Wako</span></Link>
              <div className="bg-white border border-neutral-200 rounded-2xl p-3 shadow-sm">
                <p className="px-3 pt-2 pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">Workspace</p>
                <nav className="space-y-1">
                  {navigation.map(({ label, href, icon: Icon }) => (
                    <Link key={label} href={href} onClick={() => setMobileNavOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${label === "Overview" ? "bg-primary-50 text-primary-600" : "text-neutral-600 hover:bg-neutral-50 hover:text-secondary-500"}`}>
                      <Icon size={18} strokeWidth={1.8} />
                      <span>{label}</span>
                      {label === "Messages" && unreadMessages > 0 && <span className="ml-auto rounded-full bg-primary-500 px-2 py-0.5 text-[10px] text-white">{unreadMessages}</span>}
                    </Link>
                  ))}
                </nav>
                <div className="mt-5 border-t border-neutral-100 pt-3">
                  <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"><Settings size={18} strokeWidth={1.8} />Settings</Link>
                </div>
              </div>
              <div className="mt-5 hidden rounded-2xl bg-secondary-500 p-5 text-white lg:block">
                <p className="text-xs text-white/60">Your visibility</p>
                <p className="mt-2 font-heading text-lg font-bold">{profile.availability === "unavailable" ? "Currently offline" : "Available for work"}</p>
                <Link href="/fundi/profile" className="mt-4 inline-flex text-xs font-semibold text-primary-300">Update availability <ChevronRight size={14} /></Link>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-primary-600">{new Date().toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric" })}</p>
                <h1 className="mt-2 text-3xl font-heading font-bold tracking-tight sm:text-4xl">Good morning, {displayName.split(" ")[0]}.</h1>
                <p className="mt-2 text-sm text-neutral-500">Here is what is happening with your FundiWako business.</p>
              </div>
              <Link href="/fundi/profile" className="btn-primary self-start sm:self-auto">Edit profile</Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map(({ value, label, icon: StatIcon, style }) => <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${style}`}><StatIcon size={19} /></div><p className="mt-4 text-2xl font-heading font-bold">{value}</p><p className="mt-1 text-xs text-neutral-500">{label}</p></div>)}
            </div>

            <section id="bookings" className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-neutral-100 px-5 py-5 sm:px-6">
                <div><h2 className="font-heading text-lg font-bold">Booking requests</h2><p className="mt-1 text-xs text-neutral-500">Respond quickly to win more work.</p></div>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-600">{activeBookings.length} active</span>
              </div>
              <div className="divide-y divide-neutral-100">
                {activeBookings.length === 0 ? <div className="px-6 py-14 text-center"><BriefcaseBusiness className="mx-auto text-neutral-300" size={32} /><h3 className="mt-3 font-semibold">No active bookings yet</h3><p className="mt-1 text-sm text-neutral-500">Keep your profile complete so clients can find you.</p></div> : activeBookings.slice(0, 5).map((booking) => (
                  <div key={booking._id} className="px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{booking.serviceType}</h3><span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyles[booking.status] || "bg-neutral-50 text-neutral-600 border-neutral-200"}`}>{booking.status.replace("_", " ")}</span></div><p className="mt-2 text-sm text-neutral-500">{booking.client?.name || "Client"} · {formatDate(booking.preferredDate)} at {booking.preferredTime}</p><p className="mt-1 flex items-center gap-1 text-xs text-neutral-400"><MapPin size={13} />{booking.location}</p><p className="mt-3 max-w-xl text-sm text-neutral-600">{booking.description}</p></div>
                      <div className="flex shrink-0 gap-2">
                        {booking.status === "pending" && <><button type="button" disabled={actionLoading === booking._id} onClick={() => updateBooking(booking._id, "accepted")} className="rounded-xl bg-primary-500 px-3 py-2 text-xs font-bold text-white hover:bg-primary-600 disabled:opacity-50">Accept</button><button type="button" disabled={actionLoading === booking._id} onClick={() => updateBooking(booking._id, "declined")} className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50">Decline</button></>}
                        {booking.status === "accepted" && <button type="button" disabled={actionLoading === booking._id} onClick={() => updateBooking(booking._id, "in_progress")} className="rounded-xl bg-secondary-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Start job</button>}
                        {booking.status === "in_progress" && <button type="button" disabled={actionLoading === booking._id} onClick={() => updateBooking(booking._id, "completed")} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Mark complete</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>

          <aside className="grid content-start gap-5">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-heading font-bold">Profile strength</h2><span className="text-sm font-bold text-primary-600">{profileStrength}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${profileStrength}%` }} /></div><p className="mt-3 text-xs leading-5 text-neutral-500">Complete your profile to appear more often in client searches.</p><Link href="/fundi/profile" className="mt-4 inline-flex items-center text-xs font-bold text-primary-600">Improve profile <ChevronRight size={14} /></Link></section>
            <section className="rounded-2xl bg-secondary-500 p-5 text-white"><div className="flex items-center justify-between"><p className="text-xs text-white/60">This month</p><CircleDollarSign size={19} className="text-primary-300" /></div><p className="mt-3 text-3xl font-heading font-bold">KES 0</p><p className="mt-1 text-xs text-white/60">Completed job earnings</p><div className="mt-5 flex h-12 items-end gap-1.5" aria-hidden="true">{[35, 52, 44, 62, 48, 76, 58].map((height, index) => <span key={index} className="flex-1 rounded-t bg-primary-400/60" style={{ height: `${height}%` }} />)}</div><p className="mt-3 text-[11px] text-white/50">Earnings tracking will update when clients pay through FundiWako.</p></section>
            <section className="rounded-2xl border border-primary-100 bg-primary-50 p-5"><div className="flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-600"><Bell size={18} /></div><span className="text-xs font-bold text-primary-700">{profile.isVerified ? "Verified" : "Pending"}</span></div><h2 className="mt-4 font-heading font-bold">Build client trust</h2><p className="mt-2 text-xs leading-5 text-neutral-600">Add recent work photos and complete your verification to stand out to clients.</p><Link href="/fundi/profile" className="mt-4 inline-flex text-xs font-bold text-primary-700">Update portfolio <ChevronRight size={14} /></Link></section>
          </aside>
        </div>
      </div>
    </div>
  );
}