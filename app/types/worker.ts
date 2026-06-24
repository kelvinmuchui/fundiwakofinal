export interface Worker {
  id: string;
  name: string;
  skill: string;
  location: string;
  availability: string;
  phone: string;
  email: string;
  rating: number;
  jobsCompleted: number;
  photoURL: string;
  hourlyRate: string;
  description: string;
  neighborhood?: string;
  isVerified?: boolean;
  experience?: string;
  skills?: string[];
  tvetInstitution?: string;
  distance?: number;
}
