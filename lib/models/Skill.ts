import { ObjectId } from 'mongodb';

export interface Skill {
  _id?: string | ObjectId;
  userId: string; // User who has the skill
  name: string; // Skill name (e.g., "Plumbing", "Electrical Wiring")
  category?: string; // Category (e.g., "Plumbing", "Electrical")
  yearsOfExperience?: number;
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description?: string;
  
  // Endorsements
  endorsementCount: number;
  endorsedBy: Array<{
    userId: string;
    endorsedAt: Date;
  }>;
  
  // Verification
  isVerified: boolean; // Admin verified this skill
  certificates?: Array<{
    name: string;
    issuer: string;
    issueDate?: Date;
    expiryDate?: Date;
    url?: string;
  }>;
  
  // Portfolio/Evidence
  portfolioItems?: Array<{
    id?: string;
    title: string;
    description?: string;
    imageUrl?: string;
    link?: string;
  }>;
  
  // Trending
  isTrending?: boolean;
  trendingScore?: number;
  
  // Metadata
  isPrimary?: boolean; // Primary skill displayed on profile
  visibility: 'public' | 'connections' | 'private';
  
  createdAt: Date;
  updatedAt: Date;
  lastEndorsedAt?: Date;
}

export interface SkillEndorsement {
  _id?: string | ObjectId;
  endorserId: string; // User doing the endorsing
  skillOwnerId: string; // User who has the skill
  skillId: string; // Skill being endorsed
  skillName: string; // Skill name for quick reference
  message?: string; // Optional message with the endorsement
  status: 'pending' | 'accepted'; // If user can approve endorsements
  createdAt: Date;
  acceptedAt?: Date;
}

export interface SkillCategory {
  _id?: string | ObjectId;
  name: string;
  description?: string;
  icon?: string;
  skills?: string[]; // Array of related skill names
}
