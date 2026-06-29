import { ObjectId } from 'mongodb';

export type DisputeReason = 
  | 'work_incomplete'
  | 'poor_quality'
  | 'no_show'
  | 'unresponsive'
  | 'other';

export type DisputeStatus = 
  | 'open'
  | 'in_mediation'
  | 'resolved_refunded'
  | 'resolved_released'
  | 'resolved_split';

export interface Dispute {
  _id?: ObjectId;
  transactionId: ObjectId;         // The escrow transaction in dispute
  bookingId?: ObjectId;            // The associated booking (if any)
  raisedBy: string;                // User ID of the person who raised the dispute
  against: string;                 // User ID of the other party
  reason: DisputeReason;
  description: string;
  evidenceUrls: string[];          // Array of URLs to uploaded images/documents
  status: DisputeStatus;
  
  // Resolution details
  resolutionNotes?: string;
  adminAssignedId?: string;
  resolvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
