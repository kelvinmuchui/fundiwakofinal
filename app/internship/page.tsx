"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface InternshipPosting {
  _id: string;
  companyName: string;
  serviceCategory: string;
  duration?: string;
  description: string;
  location: string;
  positions: number;
  preferredStartDate?: string;
  status: string;
}

interface ApplicationForm {
  postingId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  institution: string;
  yearOfStudy: string;
  areaOfInterest: string;
  motivation: string;
  resumeUrl: string;
}

const initialFormData: ApplicationForm = {
  postingId: "",
  applicantName: "",
  applicantEmail: "",
  applicantPhone: "",
  institution: "",
  yearOfStudy: "",
  areaOfInterest: "",
  motivation: "",
  resumeUrl: "",
};

export default function InternshipPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "apply">("jobs");
  const [postings, setPostings] = useState<InternshipPosting[]>([]);
  const [selectedPosting, setSelectedPosting] = useState<InternshipPosting | null>(null);
  const [formData, setFormData] = useState<ApplicationForm>(initialFormData);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    async function fetchPostings() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/internships");
        const data = await response.json();
        if (response.ok && Array.isArray(data.internships)) {
          setPostings(data.internships);
        } else {
          console.error(data);
          setPostings([]);
        }
      } catch (error) {
        console.error(error);
        setPostings([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPostings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectPosting = (posting: InternshipPosting) => {
    setSelectedPosting(posting);
    setFormData((prev) => ({ ...prev, postingId: posting._id }));
    setActiveTab("apply");
    setStatusMessage("");
    setStatusType(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");
    setStatusType(null);

    try {
      const response = await fetch("/api/internships/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        setStatusType("error");
        if (data.details && typeof data.details === "object") {
          setStatusMessage(Object.values(data.details).join(" ") || data.error || "Unable to submit.");
        } else {
          setStatusMessage(data.error || "Unable to submit.");
        }
        return;
      }

      setStatusType("success");
      setStatusMessage("Your internship application has been submitted successfully.");
      setFormData(initialFormData);
      setSelectedPosting(null);
    } catch (error) {
      console.error(error);
      setStatusType("error");
      setStatusMessage("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link href="/" className="flex items-center gap-2 mb-6 text-neutral-600 hover:text-neutral-900">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-3xl font-bold text-secondary-900">Explore Internship Opportunities</h1>
          <p className="mt-2 text-neutral-600 max-w-2xl">
            Browse live internships from corporates and submit a targeted application directly through FundiWako.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h2 className="text-2xl font-semibold text-secondary-900">Available internships</h2>
            <p className="text-neutral-500">Only approved internship postings are shown here.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-5 py-3 rounded-2xl font-semibold transition ${
                activeTab === "jobs" ? "bg-orange-500 text-white" : "bg-white border border-neutral-200 text-secondary-900"
              }`}
            >
              Browse postings
            </button>
            <button
              onClick={() => setActiveTab("apply")}
              className={`px-5 py-3 rounded-2xl font-semibold transition ${
                activeTab === "apply" ? "bg-orange-500 text-white" : "bg-white border border-neutral-200 text-secondary-900"
              }`}
            >
              Apply now
            </button>
          </div>
        </div>

        {activeTab === "jobs" ? (
          <div className="space-y-6">
            {isLoading ? (
              <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">Loading internship postings...</div>
            ) : postings.length === 0 ? (
              <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
                There are no approved internship postings at the moment. Check back soon.
              </div>
            ) : (
              postings.map((posting) => (
                <div key={posting._id} className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm hover:shadow-lg transition">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-orange-600 uppercase tracking-[0.35em]">{posting.serviceCategory.replace(/_/g, " ").toUpperCase()}</p>
                      <h3 className="mt-3 text-2xl font-bold text-secondary-900">{posting.companyName} Internship</h3>
                      <p className="mt-2 text-neutral-600 max-w-3xl">{posting.description}</p>
                    </div>
                    <button
                      onClick={() => handleSelectPosting(posting)}
                      className="inline-flex items-center justify-center rounded-3xl bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700 transition"
                    >
                      Apply for this role
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl bg-slate-50 border border-neutral-200 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Location</p>
                      <p className="mt-2 text-sm text-secondary-900">{posting.location}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 border border-neutral-200 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Positions</p>
                      <p className="mt-2 text-sm text-secondary-900">{posting.positions}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 border border-neutral-200 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Status</p>
                      <p className="mt-2 text-sm text-secondary-900">{posting.status}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-secondary-900">Internship application</h2>
              <p className="mt-2 text-neutral-600 max-w-2xl">
                Apply to a specific posting and let the hiring team review your profile.
              </p>
              {selectedPosting ? (
                <div className="mt-4 rounded-3xl border border-orange-100 bg-orange-50 p-4">
                  <p className="text-sm text-orange-700">Applying to</p>
                  <h3 className="mt-1 text-lg font-semibold text-secondary-900">{selectedPosting.companyName} Internship</h3>
                  <p className="text-sm text-neutral-600">{selectedPosting.description}</p>
                </div>
              ) : (
                <div className="mt-4 rounded-3xl border border-neutral-200 bg-slate-50 p-4">
                  <p className="text-sm text-neutral-500">Select a posting from the job list, or enter your details below to submit a general internship application.</p>
                </div>
              )}
            </div>

            {statusMessage && (
              <div className={`rounded-3xl p-4 mb-6 text-sm ${statusType === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {statusMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">Full Name</span>
                  <input
                    type="text"
                    name="applicantName"
                    value={formData.applicantName}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-3xl border border-neutral-200 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">Email Address</span>
                  <input
                    type="email"
                    name="applicantEmail"
                    value={formData.applicantEmail}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-3xl border border-neutral-200 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">Phone Number</span>
                  <input
                    type="tel"
                    name="applicantPhone"
                    value={formData.applicantPhone}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-3xl border border-neutral-200 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">Institution</span>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-3xl border border-neutral-200 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">Year of Study</span>
                  <select
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-orange-500 focus:outline-none"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">Area of Interest</span>
                  <input
                    type="text"
                    name="areaOfInterest"
                    value={formData.areaOfInterest}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-3xl border border-neutral-200 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none"
                    required
                  />
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">Resume / Portfolio URL</span>
                  <input
                    type="url"
                    name="resumeUrl"
                    value={formData.resumeUrl}
                    onChange={handleInputChange}
                    placeholder="https://"
                    className="mt-2 block w-full rounded-3xl border border-neutral-200 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none"
                  />
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">Why do you want to intern with this company?</span>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-3xl border border-neutral-200 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none min-h-[140px]"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-3xl bg-orange-600 px-6 py-4 text-white font-semibold hover:bg-orange-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit application'}
                </button>
                <div className="text-sm text-neutral-500">
                  {selectedPosting ? `Posting: ${selectedPosting.companyName}` : 'Choose a posting from the list to prefill the internship reference.'}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
