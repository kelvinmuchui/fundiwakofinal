"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

interface RecommendationUser {
  _id: string;
  name: string;
  photoURL?: string;
  headline?: string;
  role: string;
}

interface Recommendation {
  _id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  rating: number;
  relationship: string;
  status: "pending" | "accepted" | "rejected" | "published";
  isPublic: boolean;
  recommender?: RecommendationUser;
  createdAt: string;
  likes?: number;
  likedBy?: string[];
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  isOwner?: boolean;
  onStatusChange?: (id: string, status: string) => void;
}

export default function RecommendationCard({
  recommendation,
  isOwner = false,
  onStatusChange
}: RecommendationCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(recommendation.status);

  const getRatingStars = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const handleAction = async (action: "publish" | "accept" | "reject") => {
    if (!isOwner) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/recommendations/write", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId: recommendation._id,
          action
        })
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action} recommendation`);
        return;
      }

      setCurrentStatus(action === "publish" ? "published" : action === "accept" ? "accepted" : "rejected");
      toast.success(`Recommendation ${action}ed!`);
      onStatusChange?.(recommendation._id, action);
    } catch (error) {
      console.error("Action error:", error);
      toast.error(`Failed to ${action} recommendation`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Awaiting Review" },
      accepted: { bg: "bg-blue-100", text: "text-blue-800", label: "Accepted" },
      published: { bg: "bg-green-100", text: "text-green-800", label: "Published" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Declined" }
    };

    const badge = badges[currentStatus];
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {recommendation.recommender?.photoURL && (
            <Link href={`/fundi/profile/${recommendation.fromUserId}`}>
              <Image
                src={recommendation.recommender.photoURL}
                alt={recommendation.recommender.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          )}
          <div className="flex-1">
            <Link href={`/fundi/profile/${recommendation.fromUserId}`}>
              <span className="font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
                {recommendation.recommender?.name || "User"}
              </span>
            </Link>
            <p className="text-sm text-gray-600">{recommendation.recommender?.headline}</p>
            <p className="text-xs text-gray-500 mt-1">
              {recommendation.relationship === "client"
                ? "Hired as a client"
                : recommendation.relationship === "colleague"
                  ? "Worked as a colleague"
                  : "Worked as an employer"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl mb-2">{getRatingStars(recommendation.rating)}</div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-700 mb-3 italic">"{recommendation.content}"</p>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-100 pt-3">
        <span>{formatDate(recommendation.createdAt)}</span>

        {isOwner && currentStatus === "pending" && (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction("accept")}
              disabled={isLoading}
              className="px-3 py-1 bg-green-100 text-green-600 hover:bg-green-200 rounded font-medium text-xs disabled:opacity-50"
            >
              {isLoading ? "..." : "Accept"}
            </button>
            <button
              onClick={() => handleAction("reject")}
              disabled={isLoading}
              className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded font-medium text-xs disabled:opacity-50"
            >
              {isLoading ? "..." : "Decline"}
            </button>
          </div>
        )}

        {isOwner && currentStatus === "accepted" && !recommendation.isPublic && (
          <button
            onClick={() => handleAction("publish")}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded font-medium text-xs disabled:opacity-50"
          >
            {isLoading ? "..." : "Publish"}
          </button>
        )}

        {currentStatus === "published" && (
          <div className="flex gap-2 text-gray-600">
            <span>👍 {recommendation.likes || 0}</span>
          </div>
        )}
      </div>
    </div>
  );
}
