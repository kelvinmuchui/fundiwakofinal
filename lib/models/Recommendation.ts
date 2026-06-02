import { ObjectId } from 'mongodb';

export interface Recommendation {
  _id?: string | ObjectId;
  fromUserId: string; // User giving the recommendation
  toUserId: string; // User receiving the recommendation
  content: string; // The recommendation text
  rating: number; // 1-5 stars
  relationship: 'client' | 'colleague' | 'employer'; // Nature of relationship
  jobTitle?: string; // Job title during the relationship
  verified: boolean; // Has the recipient verified/accepted this?
  status: 'pending' | 'accepted' | 'rejected' | 'published'; // Recommendation status
  isPublic: boolean; // Is this visible on public profile?
  likes?: number; // Like count
  likedBy?: string[]; // Users who liked this recommendation
  
  // Metadata
  context?: {
    projectName?: string;
    duration?: string;
    skillsHighlighted?: string[];
  };
  
  createdAt: Date;
  acceptedAt?: Date;
  publishedAt?: Date;
  updatedAt: Date;
}

export interface RecommendationRequest {
  _id?: string | ObjectId;
  fromUserId: string; // User requesting the recommendation
  toUserId: string; // User who should give it
  message?: string; // Optional message with the request
  status: 'pending' | 'accepted' | 'declined';
  relationship?: 'client' | 'colleague' | 'employer';
  expiresAt?: Date; // Request expires after 60 days
  reminderSent?: boolean;
  createdAt: Date;
  respondedAt?: Date;
}
