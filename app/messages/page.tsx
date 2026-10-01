"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MessagesList from "../components/MessagesList";

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
  }, [router, status]);

  if (status === "loading" || !session) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary-600">Workspace</p>
            <h1 className="mt-2 text-3xl font-heading font-bold text-secondary-500">Messages</h1>
            <p className="mt-2 text-sm text-neutral-500">Keep client conversations and job details in one place.</p>
          </div>
          {(session.user as { role?: string }).role === "fundi" && <Link href="/fundi/dashboard" className="text-sm font-semibold text-primary-600 hover:text-primary-700">Back to dashboard</Link>}
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
          <MessagesList />
        </div>
      </div>
    </div>
  );
}