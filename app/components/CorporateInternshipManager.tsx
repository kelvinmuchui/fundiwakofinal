"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface CorporatePosting {
  _id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  location: string;
  postingType: string;
  serviceCategory: string;
  positions: number;
  preferredStartDate?: string;
  duration?: string;
  description: string;
  status: string;
  submittedBy?: string;
}

interface InternshipApplication {
  _id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  institution: string;
  yearOfStudy: string;
  areaOfInterest: string;
  motivation: string;
  postingCompany: string;
  postingCategory: string;
  status: string;
  submittedAt: string;
}

export default function CorporateInternshipManager() {
  const { data: session, status } = useSession();
  const [postings, setPostings] = useState<CorporatePosting[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!session?.user) return;

    const role = (session.user as any).role;
    if (role !== 'client' && role !== 'admin') return;

    setLoading(true);
    setError('');

    Promise.all([
      fetch('/api/hire-fundis', { credentials: 'include' }).then((res) => res.json()),
      fetch('/api/internship-applications', { credentials: 'include' }).then((res) => res.json()),
    ])
      .then(([postingsData, appsData]) => {
        if (postingsData?.data?.postings) {
          const ownPostings = (postingsData.data.postings as CorporatePosting[]).filter(
            (item) => item.postingType === 'internship' && ((session.user as any).role === 'admin' || item.submittedBy === (session.user as any).id)
          );
          setPostings(ownPostings);
        }

        if (Array.isArray(appsData)) {
          setApplications(appsData as InternshipApplication[]);
        }

        if (!postingsData?.data?.postings && !Array.isArray(appsData)) {
          setError('Unable to load internship information.');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to load internship dashboard data.');
      })
      .finally(() => setLoading(false));
  }, [session, status]);

  if (status === 'loading') {
    return (
      <div className="bg-white rounded-4xl p-8 shadow-xl border border-neutral-200">
        <p className="text-sm text-neutral-500">Checking your session...</p>
      </div>
    );
  }

  if (!session?.user || ((session.user as any).role !== 'client' && (session.user as any).role !== 'admin')) {
    return (
      <div className="bg-white rounded-4xl p-8 shadow-xl border border-neutral-200">
        <h3 className="text-xl font-semibold text-secondary-700 mb-3">Corporate internship dashboard</h3>
        <p className="text-neutral-500 mb-4">Sign in as a corporate or admin user to view your internship postings and applicants.</p>
        <Link href="/auth" className="inline-flex items-center justify-center rounded-3xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition">
          Sign in to continue
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-4xl p-8 shadow-xl border border-neutral-200">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary-500 font-semibold">Corporate internship dashboard</p>
          <h3 className="mt-2 text-2xl font-semibold text-secondary-700">Your internship postings and applicants</h3>
        </div>
        <Link href="/internship" className="inline-flex items-center justify-center rounded-full border border-orange-500 px-5 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition">
          Browse active internships
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading your postings and applications...</p>
      ) : error ? (
        <p className="text-sm text-rose-500">{error}</p>
      ) : (
        <div className="space-y-8">
          <div>
            <h4 className="text-lg font-semibold text-secondary-700 mb-4">Your internship postings</h4>
            {postings.length === 0 ? (
              <p className="text-neutral-500">No internship postings found. Use the form below to create your first posting.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {postings.map((posting) => (
                  <div key={posting._id} className="rounded-3xl border border-neutral-200 p-5">
                    <p className="text-sm text-neutral-500 mb-2">{posting.companyName}</p>
                    <h5 className="text-lg font-semibold text-secondary-900 mb-2">{posting.serviceCategory.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} Internship</h5>
                    <p className="text-sm text-neutral-500 mb-3">{posting.location}</p>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${posting.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {posting.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-lg font-semibold text-secondary-700 mb-4">Internship applications</h4>
            {applications.length === 0 ? (
              <p className="text-neutral-500">No applications have been submitted for your internships yet.</p>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application._id} className="rounded-3xl border border-neutral-200 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm text-neutral-500">{application.postingCompany} • {application.postingCategory}</p>
                        <h5 className="text-lg font-semibold text-secondary-900">{application.applicantName}</h5>
                        <p className="text-sm text-neutral-500">{application.applicantEmail} · {application.applicantPhone}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${application.status === 'submitted' ? 'bg-slate-100 text-slate-700' : application.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {application.status}
                      </span>
                    </div>
                    <div className="mt-4 text-sm text-neutral-600">
                      <p><strong>Institution:</strong> {application.institution}</p>
                      <p><strong>Year:</strong> {application.yearOfStudy}</p>
                      <p><strong>Area of interest:</strong> {application.areaOfInterest}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
