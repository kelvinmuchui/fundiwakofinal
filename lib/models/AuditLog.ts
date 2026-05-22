import { ObjectId } from 'mongodb';

export interface AuditLog {
  _id?: string | ObjectId;
  action: 'register' | 'login' | 'logout' | 'approve_application' | 'reject_application' | 'verify_identity' | 'update_profile' | 'create_booking' | 'complete_booking' | 'submit_rating' | 'admin_user_action' | string;
  userId: string; // Who performed the action
  targetUserId?: string; // Who was affected (optional)
  targetId?: string; // Resource ID (booking, application, etc.)
  targetType?: string; // Type of resource (booking, application, user, etc.)
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  statusCode?: number;
  errorMessage?: string;
  changeDetails?: Record<string, any>; // What changed (before/after values)
  metadata?: Record<string, any>; // Additional context
  createdAt: Date;
}

export interface ComplianceLog {
  _id?: string | ObjectId;
  userId: string;
  action: 'accept_terms' | 'accept_privacy_policy' | 'accept_data_protection';
  accepted: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface IdentityVerification {
  _id?: string | ObjectId;
  userId: string;
  status: 'pending' | 'verified' | 'rejected';
  documentType: 'national_id' | 'passport' | 'driver_license';
  documentNumber: string;
  documentImageUrl?: string;
  verificationMethod: 'admin_review' | 'automated';
  verifiedBy?: string; // Admin ID who verified
  rejectionReason?: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  expiresAt?: Date; // Optional expiry date for some documents
}
