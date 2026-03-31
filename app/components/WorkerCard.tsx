"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Worker } from "../data/mockWorkers";
import StarRating from "./StarRating";

interface WorkerCardProps {
  worker: Worker;
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  const [showContact, setShowContact] = useState(false);
  const [currentRating, setCurrentRating] = useState(worker.rating);
  const { data: session, status } = useSession();

  // Helper to determine availability badge color
  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'Available Now': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Available in 1-2 days': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Busy': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const handleRatingSubmit = async (rating: number, review?: string) => {
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fundiId: worker.id,
          rating,
          review,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      const data = await response.json();
      setCurrentRating(data.averageRating);
      alert('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
      throw error;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300 group flex flex-col h-full transform hover:-translate-y-1">
      <div className="flex items-start gap-4 mb-4">
        {/* Profile Image with subtle gradient ring */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-400 to-secondary-400 rounded-full blur-[2px] opacity-70 group-hover:opacity-100 transition-opacity"></div>
          {/* Using img tag directly to avoid next/image domain configuration issues for mock data */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={worker.photoURL} 
            alt={worker.name} 
            className="w-20 h-20 rounded-full object-cover relative z-10 border-2 border-white"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-heading font-bold text-xl text-neutral-800">{worker.name}</h3>
              <p className="text-sm font-semibold text-primary-600 mb-1">{worker.skill}</p>
            </div>
            <div className="flex items-center bg-neutral-50 px-2 py-1 rounded-lg">
              <StarRating
                currentRating={currentRating}
                onRatingSubmit={handleRatingSubmit}
                readonly={false}
                showReviewInput={true}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-neutral-500">
            <span className="flex items-center">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {worker.location}
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
            <span>{worker.jobsCompleted} jobs</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
            <span className="font-medium text-neutral-700">{worker.hourlyRate}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-neutral-600 line-clamp-2">
        {worker.description}
      </div>

      <div className="mt-auto pt-4 border-t border-neutral-100">
        <div className="flex justify-between items-center mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getAvailabilityColor(worker.availability)}`}>
            {worker.availability}
          </span>
        </div>

        {/* Contact Reveal Section */}
        {showContact ? (
          <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 animate-fade-in shadow-inner">
            <p className="text-xs font-semibold text-primary-800 uppercase tracking-wider mb-2">Direct Contact</p>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary-600 shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <a href={`tel:${worker.phone}`} className="font-heading font-bold text-lg text-primary-700 hover:text-primary-800 transition-colors">
                {worker.phone}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary-600 shadow-sm">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <a href={`mailto:${worker.email}`} className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors">
                {worker.email}
              </a>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link
              href={`/fundi/public/${worker.id}`}
              className="flex-1 py-3 px-4 rounded-xl font-heading font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <span>View Profile</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <button 
              onClick={() => setShowContact(true)}
              className="flex-1 py-3 px-4 rounded-xl font-heading font-semibold text-white bg-neutral-900 hover:bg-primary-600 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <span>Contact</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
