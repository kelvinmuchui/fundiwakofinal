import { ObjectId } from 'mongodb';

export type MarketplaceJobStatus = 'open' | 'awarded' | 'cancelled' | 'completed';
export type MarketplaceProposalStatus = 'pending' | 'accepted' | 'rejected';
export type MarketplaceContractStatus = 'active' | 'completed' | 'cancelled' | 'disputed';

export interface MarketplaceProposal {
  _id?: ObjectId;
  jobId: ObjectId;
  clientId: string;
  fundiId: string;
  coverLetter: string;
  amount: number;
  duration: string;
  status: MarketplaceProposalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketplaceJob {
  _id?: ObjectId;
  clientId: string;
  title: string;
  serviceCategory: string;
  description: string;
  location: string;
  budgetType: 'fixed' | 'hourly';
  budgetMin: number;
  budgetMax: number;
  duration?: string;
  skills: string[];
  status: MarketplaceJobStatus;
  proposalCount: number;
  acceptedProposalId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketplaceContract {
  _id?: ObjectId;
  jobId: ObjectId;
  proposalId: ObjectId;
  clientId: string;
  fundiId: string;
  title: string;
  description: string;
  amount: number;
  duration: string;
  status: MarketplaceContractStatus;
  milestones: Array<{
    title: string;
    amount: number;
    status: 'pending' | 'funded' | 'submitted' | 'approved' | 'released';
  }>;
  createdAt: Date;
  updatedAt: Date;
}