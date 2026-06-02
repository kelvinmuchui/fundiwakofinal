"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

interface ActivityUser {
  _id: string;
  name: string;
  photoURL: string;
  headline: string;
  role: string;
}

interface Activity {
  _id: string;
  userId: string;
  type: string;
  title: string;
  description?: string;
  user?: ActivityUser;
  relatedUser?: ActivityUser;
  metadata?: Record<string, any>;
  createdAt: string;
  likes: number;
  comments: any[];
}

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
}

export default function ActivityFeed({ limit = 10, showHeader = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/feed?limit=${limit}&skip=0`);
      if (!response.ok) throw new Error("Failed to fetch activities");

      const data = await response.json();
      setActivities(data.activities || []);
      setHasMore(data.pagination?.hasMore || false);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activity feed");
      toast.error("Failed to load activity feed");
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      job_completed: "✓",
      skill_endorsed: "⭐",
      recommendation_given: "💬",
      joined_platform: "🎉",
      certification_completed: "📜",
      profile_updated: "✏️",
      connection_made: "🤝",
      milestone_reached: "🏆",
      rating_received: "⭐"
    };
    return icons[type] || "•";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchActivities}
          className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No activities yet. Start connecting with people!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Activity Feed</h2>
          <p className="text-gray-600">See what your network is up to</p>
        </div>
      )}

      {activities.map((activity) => (
        <div
          key={activity._id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex gap-3">
            {/* User Avatar */}
            {activity.user?.photoURL && (
              <div className="flex-shrink-0">
                <Link href={`/fundi/profile/${activity.userId}`}>
                  <Image
                    src={activity.user.photoURL}
                    alt={activity.user.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </Link>
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Activity Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Link href={`/fundi/profile/${activity.userId}`}>
                    <span className="font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
                      {activity.user?.name || "User"}
                    </span>
                  </Link>
                  {activity.user?.headline && (
                    <p className="text-sm text-gray-600">{activity.user.headline}</p>
                  )}
                </div>
                <span className="text-2xl">{getActivityIcon(activity.type)}</span>
              </div>

              {/* Activity Content */}
              <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
              {activity.description && (
                <p className="text-gray-700 mb-2">{activity.description}</p>
              )}

              {/* Activity Metadata */}
              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="bg-gray-50 rounded p-2 mb-2 text-sm text-gray-600">
                  {activity.metadata.skillName && (
                    <p>Skill: <span className="font-medium">{activity.metadata.skillName}</span></p>
                  )}
                  {activity.metadata.rating && (
                    <p>Rating: <span className="font-medium">⭐ {activity.metadata.rating}/5</span></p>
                  )}
                  {activity.metadata.jobTitle && (
                    <p>Job: <span className="font-medium">{activity.metadata.jobTitle}</span></p>
                  )}
                </div>
              )}

              {/* Activity Footer */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{formatDate(activity.createdAt)}</span>
                <div className="flex gap-3">
                  <button className="hover:text-gray-900">👍 {activity.likes}</button>
                  <button className="hover:text-gray-900">💬 {activity.comments?.length || 0}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={() => {
            /* Load more */
          }}
          className="w-full py-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          Load More
        </button>
      )}
    </div>
  );
}
