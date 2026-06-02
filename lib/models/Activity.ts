import { ObjectId } from 'mongodb';

export type ActivityType = 
  | 'job_completed'
  | 'skill_endorsed'
  | 'recommendation_given'
  | 'joined_platform'
  | 'certification_completed'
  | 'profile_updated'
  | 'connection_made'
  | 'milestone_reached'
  | 'rating_received';

export interface Activity {
  _id?: string | ObjectId;
  userId: string; // User who performed the activity
  type: ActivityType;
  title: string; // Short title for the activity
  description?: string; // Detailed description
  
  // Related information
  relatedUserId?: string; // If activity involves another user
  relatedJobId?: string; // If activity is job-related
  relatedSkillId?: string; // If activity is skill-related
  relatedRecommendationId?: string; // If activity is recommendation-related
  
  // Metadata
  metadata?: {
    skillName?: string;
    endorsementCount?: number;
    rating?: number;
    jobTitle?: string;
    [key: string]: any;
  };
  
  // Visibility settings
  visibility: 'public' | 'connections' | 'private';
  
  // Engagement metrics
  likes?: number;
  likedBy?: string[];
  comments?: Array<{
    userId: string;
    content: string;
    createdAt: Date;
  }>;
  
  // Display
  icon?: string; // Icon identifier for the activity type
  action?: string; // Action text (e.g., "View Profile")
  actionUrl?: string; // URL for the action
  
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserActivity {
  userId: string;
  recentActivities: Activity[];
  activityCount: number;
  lastActivityDate: Date;
}
