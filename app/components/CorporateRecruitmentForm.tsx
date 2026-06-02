"use client";

import { useState } from "react";

type FormData = {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyWebsite: string;
  location: string;
  serviceCategory: string;
  postingType: string;
  positions: string;
  preferredStartDate: string;
  duration: string;
  description: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialFormData: FormData = {
  companyName: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  companyWebsite: "",
  location: "",
  serviceCategory: "plumbing",
  postingType: "corporate_hire",
  positions: "1",
  preferredStartDate: "",
  duration: "",
  description: "",
};

const postingOptions = [
  { value: "internship", label: "Internship" },
  { value: "corporate_hire", label: "Corporate Hire" },
  { value: "recruitment", label: "Long-term Recruitment" },
];

const serviceOptions = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "carpentry", label: "Carpentry" },
  { value: "painting", label: "Painting" },
  { value: "masonry", label: "Masonry" },
  { value: "cleaning", label: "Cleaning" },
  { value: "general", label: "General / Multi-skill" },
];

type Props = {
  onSuccess?: () => void;
};

export default function CorporateRecruitmentForm({ onSuccess }: Props) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");
    setStatusType(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/hire-fundis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          positions: Number(formData.positions),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusType("error");
        if (data.details && typeof data.details === "object") {
          setErrors(data.details);
          setStatusMessage("Please fix the highlighted fields and try again.");
        } else {
          setStatusMessage(data.error || "Unable to submit your request.");
        }
      } else {
        setStatusType("success");
        setStatusMessage(data.message || "Your request has been submitted successfully.");
        setFormData(initialFormData);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      setStatusType("error");
      setStatusMessage("Something went wrong. Please try again later.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-4xl bg-white p-8 shadow-xl border border-neutral-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary-500">Recruitment request</p>
          <h3 className="mt-3 text-2xl font-semibold text-secondary-700">
            {formData.postingType === 'internship' ? 'Internship request form' : 'Corporate application form'}
          </h3>
          <p className="mt-2 text-sm text-neutral-500">
            Share the details of your hiring or internship needs and we&apos;ll save it in our recruitment queue.
          </p>
        </div>

        {statusMessage && (
          <div className={`rounded-3xl p-4 text-sm ${statusType === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {statusMessage}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Company name</span>
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. GreenBuild Ltd"
              className={`mt-2 block w-full rounded-3xl border px-4 py-3 text-sm focus:ring-2 focus:ring-primary-400 ${errors.companyName ? "border-rose-500" : "border-neutral-200"}`}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Contact name</span>
            <input
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              placeholder="e.g. Agnes Mwangi"
              className={`mt-2 block w-full rounded-3xl border px-4 py-3 text-sm focus:ring-2 focus:ring-primary-400 ${errors.contactName ? "border-rose-500" : "border-neutral-200"}`}
              required
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Contact email</span>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="contact@company.co.ke"
              className={`mt-2 block w-full rounded-3xl border px-4 py-3 text-sm focus:ring-2 focus:ring-primary-400 ${errors.contactEmail ? "border-rose-500" : "border-neutral-200"}`}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Phone number</span>
            <input
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="+254 700 000 000"
              className={`mt-2 block w-full rounded-3xl border px-4 py-3 text-sm focus:ring-2 focus:ring-primary-400 ${errors.contactPhone ? "border-rose-500" : "border-neutral-200"}`}
              required
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Location</span>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Nairobi, Kenya"
              className={`mt-2 block w-full rounded-3xl border px-4 py-3 text-sm focus:ring-2 focus:ring-primary-400 ${errors.location ? "border-rose-500" : "border-neutral-200"}`}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Company website <span className="text-neutral-400">(optional)</span></span>
            <input
              type="url"
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={handleChange}
              placeholder="https://www.example.co.ke"
              className="mt-2 block w-full rounded-3xl border border-neutral-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-400"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Request type</span>
            <select
              name="postingType"
              value={formData.postingType}
              onChange={handleChange}
              className="mt-2 block w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary-400"
            >
              {postingOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Service category</span>
            <select
              name="serviceCategory"
              value={formData.serviceCategory}
              onChange={handleChange}
              className="mt-2 block w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary-400"
            >
              {serviceOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Number of positions</span>
            <input
              type="number"
              name="positions"
              min="1"
              max="100"
              value={formData.positions}
              onChange={handleChange}
              className={`mt-2 block w-full rounded-3xl border px-4 py-3 text-sm focus:ring-2 focus:ring-primary-400 ${errors.positions ? "border-rose-500" : "border-neutral-200"}`}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Preferred start date</span>
            <input
              type="date"
              name="preferredStartDate"
              value={formData.preferredStartDate}
              onChange={handleChange}
              className="mt-2 block w-full rounded-3xl border border-neutral-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-400"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-neutral-700">Expected duration</span>
          <input
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g. 3 months, ongoing, one-time"
            className="mt-2 block w-full rounded-3xl border border-neutral-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-400"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-700">Describe your hiring need</span>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Tell us about the project, required skills, experience level, and any special requirements."
            className={`mt-2 block w-full rounded-3xl border px-4 py-3 text-sm focus:ring-2 focus:ring-primary-400 ${errors.description ? "border-rose-500" : "border-neutral-200"}`}
            required
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-3xl bg-primary-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting request..." : "Submit request"}
        </button>
      </form>
    </div>
  );
}
