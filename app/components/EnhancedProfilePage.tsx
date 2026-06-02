"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import VerificationBadge from "@/app/components/VerificationBadge";
import ConnectionButton from "@/app/components/ConnectionButton";
import SkillEndorsement from "@/app/components/SkillEndorsement";
import RecommendationCard from "@/app/components/RecommendationCard";
import { Bookmark, MapPin, Clock, Star } from "lucide-react";

interface EnhancedProfilePageProps {
  userId: string;
}

export default function EnhancedProfilePage({ userId }: EnhancedProfilePageProps) {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState("not_connected");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const isOwnProfile = session?.user?.email === user?.email;
  const isConnected = connectionStatus === "connected";

  useEffect(() => {
    fetchUserProfile();
    fetchRecommendations();
    recordProfileView();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setUser(data.user);
      setConnectionStatus(data.connectionStatus || "not_connected");
      calculateProfileCompleteness(data.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`/api/recommendations?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch recommendations");

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const recordProfileView = async () => {
    if (isOwnProfile) return;
    try {
      await fetch(`/api/profile/${userId}/view`, { method: "POST" });
    } catch (error) {
      console.error("Error recording view:", error);
    }
  };

  const calculateProfileCompleteness = (userData: any) => {
    const fields = [
      "headline",
      "about",
      "photoURL",
      "endorsedSkills",
      "location",
      "hourlyRate",
      "coverImage"
    ];
    const completed = fields.filter((field) => userData[field]).length;
    setProfileCompleteness(Math.round((completed / fields.length) * 100));
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-center py-8 text-gray-600">Profile not found</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Cover Image Section */}
      <div className="relative h-64 bg-gradient-to-r from-primary-600 to-accent-600 overflow-hidden group">
        {user.coverImage ? (
          <Image
            src={user.coverImage}
            alt="Cover"
            fill
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600" />
        )}
        {isOwnProfile && (
          <button className="absolute top-4 right-4 px-4 py-2 bg-white/90 hover:bg-white rounded-lg font-medium text-gray-900 transition-all">
            Edit Cover
          </button>
        )}
      </div>

      {/* Profile Container */}
      <div className="container-max px-4 -mt-32 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-6">
            {/* Avatar */}
            <div className="relative">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.name}
                  width={140}
                  height={140}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                  {user.name.charAt(0)}
                </div>
              )}
              {user.verificationBadges && user.verificationBadges.length > 0 && (
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  {user.verificationBadges.map((badge: string) => (
                    <VerificationBadge key={badge} type={badge as any} />
                  ))}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
              <p className="text-xl text-primary-600 font-medium mb-3">
                {user.headline || `${user.role === "fundi" ? "Fundi" : "Client"}`}
              </p>

              <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.hourlyRate && (
                  <div className="flex items-center gap-1">
                    <span>KSh {user.hourlyRate}/hr</span>
                  </div>
                )}
                {user.jobsCompleted && (
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{user.jobsCompleted} jobs completed</span>
                  </div>
                )}
                {user.rating && (
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <span>{user.rating.toFixed(1)}/5</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {!isOwnProfile && (
                  <>
                    <ConnectionButton
                      targetUserId={userId}
                      status={connectionStatus as any}
                      onStatusChange={setConnectionStatus}
                      size="md"
                    />
                    <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium transition-all">
                      Message
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium transition-all">
                      <Bookmark size={18} className="inline mr-2" />
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Completeness */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-1">{profileCompleteness}%</div>
              <p className="text-sm text-gray-600">Profile Complete</p>
              <div className="mt-2 w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileCompleteness}%` }}
                />
              </div>
            </div>
          </div>

          {/* About Section */}
          {user.about && (
            <div className="border-t pt-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
              <p className="text-gray-700 leading-relaxed">{user.about}</p>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Section */}
            {user.endorsedSkills && user.endorsedSkills.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Skills & Endorsements</h2>
                <div className="space-y-3">
                  {user.endorsedSkills.map((skill: any, index: number) => (
                    <SkillEndorsement
                      key={index}
                      skill={skill}
                      targetUserId={userId}
                      isConnected={isConnected}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Recommendations ({recommendations.length})
                </h2>
                <div className="space-y-4">
                  {recommendations.map((rec: any) => (
                    <RecommendationCard
                      key={rec._id}
                      recommendation={rec}
                      isOwner={isOwnProfile}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Connections */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Network</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Connections</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {user.connections?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Endorsements</span>
                  <span className="text-2xl font-bold text-accent-600">
                    {user.endorsedSkills?.reduce((sum: number, s: any) => sum + s.endorsementCount, 0) || 0}
                  </span>
                </div>
                <button className="w-full px-4 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 font-medium transition-all mt-3">
                  View Connections
                </button>
              </div>
            </div>

            {/* Profile Views */}
            {!isOwnProfile && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Views</h3>
                <p className="text-3xl font-bold text-gray-900">{user.profileViewCount || 0}</p>
                <p className="text-sm text-gray-600">people viewed your profile this month</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
