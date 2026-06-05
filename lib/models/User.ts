import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string; // hashed
  role: 'fundi' | 'admin' | 'client';
  idNumber: string;
  
  // Professional Profile Fields (Phase 1)
  headline?: string; // e.g., "Master Electrician • 12 years experience"
  about?: string; // Professional bio/summary
  coverImage?: string; // Cover photo URL
  profileCompleteness?: number; // 0-100 percentage
  
  // Verification & Badges (Phase 1)
  verificationBadges?: ('email_verified' | 'id_verified' | 'background_checked' | 'certified' | 'phone_verified')[];
  backgroundCheckStatus?: 'pending' | 'approved' | 'rejected' | 'none';
  backgroundCheckDate?: Date;
  
  // Skills with endorsements (Phase 1)
  endorsedSkills?: Array<{
    skillId?: string;
    name: string;
    yearsOfExperience?: number;
    endorsementCount: number;
    endorsedBy?: string[]; // Array of user IDs
    isPrimary?: boolean;
  }>;
  
  // Network Fields (Phase 1)
  connections?: string[]; // Array of user IDs (accepted connections)
  connectionRequests?: {
    pending?: Array<{ userId: string; requestedAt: Date; requestedBy: string }>;
    sent?: Array<{ userId: string; sentAt: Date }>;
  };
  blocked?: string[]; // Blocked users
  
  // Profile stats (Phase 1)
  profileViews?: Array<{ viewerId: string; viewedAt: Date }>;
  profileViewCount?: number;
  
  // Fundi-specific fields
  skill?: string;
  experience?: string;
  tvetInstitution?: string;
  description?: string;
  businessName?: string;
  businessRegistration?: string;
  location?: string;
  neighborhood?: string;
  certificates?: string[]; // URLs to uploaded certificates
  mpesaNumber?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  availability?: 'flexible' | 'fulltime' | 'parttime' | 'weekends';
  reasonForJoining?: string;
  photoURL?: string;
  hourlyRate?: string;
  rating?: number;
  jobsCompleted?: number;
  
  skills?: string[];
  
  // Client-specific fields
  homeAddress?: string;
  city?: string;
  preferredServices?: string[];
  
  // Admin-specific fields
  adminLevel?: 'super' | 'moderator';
  permissions?: string[];
  
  // Email verification & security
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  
  // Password reset
  resetToken?: string;
  resetTokenExpires?: Date;
  lastPasswordChange?: Date;
  
  // Common fields
  isVerified: boolean;
  contactClicks?: number;
  notifications?: Notification[];
  
  // Encrypted sensitive fields (stored as encrypted strings)
  // These fields are encrypted in database and decrypted when needed
  bankAccountNumberEncrypted?: string;
  bankAccountNameEncrypted?: string;
  mpesaNumberEncrypted?: string;
  idNumberEncrypted?: string;
  phoneEncrypted?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface Notification {
  _id?: ObjectId;
  type: 'view' | 'contact' | 'rating' | 'system';
  message: string;
  senderName?: string;
  createdAt: Date;
  isRead: boolean;
}

export interface WorkerApplication {
  _id?: ObjectId;
  name: string;
  phone: string;
  idNumber: string;
  email: string;
  skill: string;
  experience: string;
  tvetInstitution?: string;
  description: string;
  location: string;
  neighborhood: string;
  businessName?: string;
  businessRegistration?: string;
  certificates?: string[];
  mpesaNumber?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  availability?: string;
  reasonForJoining?: string;
  skills?: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  submittedAt: Date;
}

export interface Rating {
  _id?: ObjectId;
  fundiId: string; // ID of the fundi being rated
  clientId: string; // ID of the client giving the rating
  rating: number; // 1-5 stars
  review?: string; // Optional review text
  createdAt: Date;
  updatedAt: Date;
}