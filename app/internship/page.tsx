"use client";

import { useState } from "react";
import Link from "next/link";

interface InternshipPosition {
  id: string;
  title: string;
  description: string;
  department: string;
  duration: string;
  tags: string[];
  trustLevel: string;
  icon: string;
}

const positions: InternshipPosition[] = [
  {
    id: 1,
    title: "Field Operations Intern",
    description: "Support our artisan vetting process and maintain service quality standards across the region.",
    department: "Operations",
    duration: "3 Months",
    tags: ["Operations"],
    trustLevel: "Verified Role",
    icon: "👷"
  },
  {
    id: 2,
    title: "Technical Product Intern",
    description: "Assist in developing the Kenyan Reliability System backend and improving mobile UX for local fundis.",
    department: "Engineering",
    duration: "6 Months",
    tags: ["Technical"],
    trustLevel: "High Trust",
    icon: "💻"
  },
  {
    id: 3,
    title: "Growth & Marketing Intern",
    description: "Help us scale our presence in local residential hubs through data-driven outreach and community events.",
    department: "Marketing",
    duration: "3 Months",
    tags: ["Marketing"],
    trustLevel: ""
  },
  {
    id: 4,
    title: "Trust & Safety Intern",
    description: "Review artisan documentation and help resolve community disputes to maintain our verified trust ecosystem.",
    department: "Trust & Safety",
    duration: "4 Months",
    tags: ["Trust"],
    trustLevel: ""
  }
];

const benefits = [
  "Direct mentorship from industry leaders",
  "Competitive stipends & travel allowance",
  "Potential for full-time conversion"
];

export default function InternshipPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "apply">("jobs");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    university: "",
    yearOfStudy: "",
    department: "",
    motivation: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Application submitted:", formData);
    alert("Thank you for applying! We'll review your application soon.");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link href="/" className="flex items-center gap-2 mb-6 text-neutral-600 hover:text-neutral-900">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-3xl font-bold text-secondary-900">Nurture Your Potential</h1>
          <p className="mt-2 text-neutral-600 max-w-2xl">
            Join the FundiWako internship program and bridge the gap between technical skill and professional excellence in the local artisan economy.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {activeTab === "jobs" ? (
          <div className="space-y-8">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search roles (e.g., Operations, Technical...)"
                  className="w-full px-5 py-3 rounded-xl border-2 border-neutral-200 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                <button className="px-6 py-3 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-800 transition">
                  📍 Nairobi
                </button>
                <button className="px-6 py-3 rounded-xl border-2 border-neutral-300 text-neutral-700 font-semibold hover:border-neutral-400 transition">
                  Department
                </button>
                <button className="px-6 py-3 rounded-xl border-2 border-neutral-300 text-neutral-700 font-semibold hover:border-neutral-400 transition">
                  🤖 AI
                </button>
              </div>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              {positions.map((position) => (
                <div key={position.id} className="bg-white rounded-2xl border-2 border-neutral-200 p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{position.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold text-secondary-900">{position.title}</h3>
                          <p className="text-sm text-neutral-500">{position.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4 text-sm">
                        {position.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                            ◉ {tag}
                          </span>
                        ))}
                        <span className="text-neutral-500">⏱ {position.duration}</span>
                        {position.trustLevel && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                            ✓ {position.trustLevel}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("apply")}
                      className="px-6 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition whitespace-nowrap"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Why Intern Section */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">Why Intern at FundiWako?</h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl">
                Experience the real-world impact of digitizing the informal economy. Our interns don't just work—they empower thousands of local artisans.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <p className="text-lg text-slate-200">{benefit}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
                  alt="FundiWako team"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="mb-8">
                <span className="inline-block px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
                  INTERNSHIP 2024
                </span>
                <h1 className="text-3xl font-bold text-secondary-900 mb-3">Join the Pro Force</h1>
                <p className="text-neutral-600">
                  Help us build the most trusted digital marketplace for local artisans in Kenya. We're looking for passionate minds to bridge the gap between skill and opportunity.
                </p>
              </div>

              {/* Timeline */}
              <div className="mb-8 p-6 bg-neutral-50 rounded-2xl">
                <h3 className="font-bold text-secondary-900 mb-4">Application Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-orange-500 bg-orange-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="font-semibold text-secondary-900">Phase 1: Open Applications</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-neutral-300 shrink-0" />
                    <span className="text-neutral-600">Phase 2: Portfolio Review</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-neutral-300 shrink-0" />
                    <span className="text-neutral-600">Phase 3: Cultural Interview</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Details */}
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-secondary-900 mb-4">
                    <span>👤</span> Personal Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-neutral-200 focus:border-orange-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@university.edu"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-neutral-200 focus:border-orange-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Background */}
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-secondary-900 mb-4">
                    <span>🎓</span> Academic Background
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">University/Institution</label>
                      <input
                        type="text"
                        name="university"
                        value={formData.university}
                        onChange={handleInputChange}
                        placeholder="e.g., University of Nairobi"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-neutral-200 focus:border-orange-500 outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">Current Year of Study</label>
                        <select
                          name="yearOfStudy"
                          value={formData.yearOfStudy}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-neutral-200 focus:border-orange-500 outline-none"
                          required
                        >
                          <option value="">Select Year</option>
                          <option value="Year 1">Year 1</option>
                          <option value="Year 2">Year 2</option>
                          <option value="Year 3">Year 3</option>
                          <option value="Year 4">Year 4</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">Department of Interest</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-neutral-200 focus:border-orange-500 outline-none"
                          required
                        >
                          <option value="">Select Department</option>
                          <option value="Software Engineering">Software Engineering</option>
                          <option value="Business">Business</option>
                          <option value="Operations">Operations</option>
                          <option value="Marketing">Marketing</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supporting Documents */}
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-secondary-900 mb-4">
                    <span>📎</span> Supporting Documents
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-3">CV/Resume</label>
                      <div className="border-2 border-dashed border-orange-300 rounded-2xl p-8 text-center hover:bg-orange-50 transition cursor-pointer">
                        <div className="text-3xl mb-2">☁️</div>
                        <p className="text-neutral-600">Upload PDF or drag</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-3">Cover Letter</label>
                      <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-8 text-center hover:bg-neutral-50 transition cursor-pointer">
                        <div className="text-3xl mb-2">📄</div>
                        <p className="text-neutral-600">Upload PDF or drag</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">Why do you want to intern with FundiWako?</label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    placeholder="Tell us about your motivation and what you hope to achieve..."
                    className="w-full px-4 py-3 rounded-2xl border-2 border-neutral-200 focus:border-orange-500 outline-none min-h-24"
                    required
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2"
                >
                  Submit Application
                  <span>→</span>
                </button>
                <p className="text-xs text-neutral-500 text-center">
                  By clicking submit, you agree to our processing of your personal data as per our Privacy Policy.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="fixed bottom-8 right-8 flex gap-2">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-6 py-3 rounded-2xl font-semibold transition ${
            activeTab === "jobs"
              ? "bg-orange-500 text-white shadow-lg"
              : "bg-white text-secondary-900 border-2 border-neutral-200"
          }`}
        >
          View Jobs
        </button>
        <button
          onClick={() => setActiveTab("apply")}
          className={`px-6 py-3 rounded-2xl font-semibold transition ${
            activeTab === "apply"
              ? "bg-orange-500 text-white shadow-lg"
              : "bg-white text-secondary-900 border-2 border-neutral-200"
          }`}
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}
