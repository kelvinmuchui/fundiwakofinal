"use client";

import { useState } from "react";
import Link from "next/link";
import { Worker } from "../data/mockWorkers";
import BookingModal from "./BookingModal";

interface WorkerCardProps {
  worker: Worker;
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentRating, setCurrentRating] = useState(worker.rating);

  const formatRate = (rate: string | number | undefined) => {
    if (!rate) return "Negotiable";
    const rateStr = String(rate).trim();
    if (rateStr.toLowerCase().startsWith("ksh") || rateStr.toLowerCase().startsWith("kes")) {
      return rateStr;
    }
    if (/^[0-9,.]+$/.test(rateStr)) {
      return `KSh ${rateStr}`;
    }
    return rateStr;
  };

  const locationLabel = [
    worker.distance !== undefined ? `${worker.distance.toFixed(1)} km away` : null,
    worker.neighborhood,
    worker.location,
  ]
    .filter(Boolean)
    .join(" • ");

  const displaySkills = worker.skills?.slice(0, 4) ?? [];

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={worker.photoURL}
          alt={worker.name}
          className="h-56 w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/50 to-transparent" />

        <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-sm font-semibold text-secondary-900 shadow-sm">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-white text-sm">
            ★
          </span>
          <span>{currentRating.toFixed(1)}</span>
          <span className="text-neutral-500">({worker.jobsCompleted})</span>
        </div>

        {worker.isVerified && (
          <div className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-primary-700 shadow-sm">
            <svg className="h-3.5 w-3.5 text-primary-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg md:text-xl font-heading font-bold text-secondary-900 leading-tight">
              {worker.name}
            </h3>
            <p className="mt-2 text-sm text-neutral-500">{worker.skill}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-400">
              Starts at
            </p>
            <p className="mt-1 text-2xl md:text-3xl font-black text-primary-600">
              {formatRate(worker.hourlyRate)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
          <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{locationLabel || worker.location || "Location not set"}</span>
        </div>

        {displaySkills.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {displaySkills.map((skill, idx) => (
              <span key={idx} className="rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-700">
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-neutral-100">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={`/fundi/public/${worker.id}`}
              className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white py-3 text-sm font-semibold text-secondary-900 transition hover:bg-neutral-50"
            >
              View Profile
            </Link>
            <button
              type="button"
              onClick={() => setShowBookingModal(true)}
              className="inline-flex items-center justify-center rounded-2xl bg-orange-500 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition hover:bg-orange-600"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      <BookingModal
        fundiId={worker.id}
        fundiName={worker.name}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </div>
  );
}
