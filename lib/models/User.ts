import { ObjectId } from 'mongodb';

export interface User {
  _id?: string | ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string; // hashed
  role: 'fundi' | 'admin' | 'client';
  idNumber: string;
  
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
  
  // Common fields
  isVerified: boolean;
  profileViews?: number;
  contactClicks?: number;
  notifications?: Notification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id?: string | ObjectId;
  type: 'view' | 'contact' | 'rating' | 'system';
  message: string;
  senderName?: string;
  createdAt: Date;
  isRead: boolean;
}

export interface WorkerApplication {
  _id?: string | ObjectId;
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
  _id?: string | ObjectId;
  fundiId: string; // ID of the fundi being rated
  clientId: string; // ID of the client giving the rating
  rating: number; // 1-5 stars
  review?: string; // Optional review text
  createdAt: Date;
  updatedAt: Date;
}