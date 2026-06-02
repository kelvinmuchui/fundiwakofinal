import { ObjectId } from 'mongodb';

export interface Connection {
  _id?: string | ObjectId;
  userId: string; // The user initiating the connection
  connectedUserId: string; // The user being connected with
  status: 'accepted' | 'pending' | 'rejected' | 'blocked';
  requestedAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  blockedAt?: Date;
  mutual?: boolean; // True if both users connected each other
  relationship?: 'client' | 'fundi' | 'colleague'; // Type of relationship
  notes?: string; // Optional notes about the connection
  metadata?: {
    mutualConnections?: number;
    commonSkills?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectionRequest {
  _id?: string | ObjectId;
  fromUserId: string;
  toUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  respondedAt?: Date;
}
