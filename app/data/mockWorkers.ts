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
}

export const mockWorkers: Worker[] = [
  {
    id: "w1",
    name: "John Kamau",
    skill: "Plumber",
    location: "Nairobi",
    availability: "Available Now",
    phone: "+254 712 345 678",
    email: "john.kamau@example.com",
    rating: 4.8,
    jobsCompleted: 145,
    photoURL: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    hourlyRate: "KES 1,500/hr",
    description: "Experienced plumber with 10+ years in residential and commercial work. Specializes in leak repairs, pipe installations, and drainage solutions."
  },
  {
    id: "w2",
    name: "Jane Kipchoge",
    skill: "Electrician",
    location: "Nairobi",
    availability: "Available in 1-2 days",
    phone: "+254 723 456 789",
    email: "jane.kipchoge@example.com",
    rating: 4.9,
    jobsCompleted: 298,
    photoURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    hourlyRate: "KES 2,000/hr",
    description: "Master electrician with expert-level knowledge. Full house wiring, fault diagnostics, and solar installation services available."
  },
  {
    id: "w3",
    name: "Peter Mwangi",
    skill: "Carpenter",
    location: "Westlands, Nairobi",
    availability: "Available Now",
    phone: "+254 734 567 890",
    email: "peter.mwangi@example.com",
    rating: 4.7,
    jobsCompleted: 87,
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    hourlyRate: "KES 1,800/hr",
    description: "Skilled carpenter specializing in custom furniture, door installations, and wooden flooring. Attention to detail is my trademark."
  },
  {
    id: "w4",
    name: "Grace Achieng",
    skill: "Painter",
    location: "Karen, Nairobi",
    availability: "Available in 1-2 days",
    phone: "+254 745 678 901",
    email: "grace.achieng@example.com",
    rating: 4.6,
    jobsCompleted: 156,
    photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    hourlyRate: "KES 1,200/hr",
    description: "Professional painter with expertise in interior and exterior work. All types of finishes and textures available."
  },
  {
    id: "w5",
    name: "David Kipkemboi",
    skill: "Mason",
    location: "Kiambu",
    availability: "Busy",
    phone: "+254 756 789 012",
    email: "david.kipkemboi@example.com",
    rating: 4.5,
    jobsCompleted: 203,
    photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    hourlyRate: "KES 1,400/hr",
    description: "Experienced mason for bricklaying, plastering, and concrete work. Currently booked but accepting future bookings."
  },
  {
    id: "w6",
    name: "Amina Hassan",
    skill: "Cleaner",
    location: "Makati, Nairobi",
    availability: "Available Now",
    phone: "+254 767 890 123",
    email: "amina.hassan@example.com",
    rating: 4.9,
    jobsCompleted: 412,
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    hourlyRate: "KES 800/hr",
    description: "Deep cleaning specialist. Post-construction cleanup, carpet cleaning, and upholstery services. Eco-friendly products used."
  },
  {
    id: "w7",
    name: "Samuel Kipchoge",
    skill: "Plumber",
    location: "Kisumu",
    availability: "Available Now",
    phone: "+254 778 901 234",
    email: "samuel.kipchoge@example.com",
    rating: 4.4,
    jobsCompleted: 62,
    photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    hourlyRate: "KES 1,300/hr",
    description: "Local plumber in Kisumu serving residential customers. Affordable rates and reliable same-day service."
  },
  {
    id: "w8",
    name: "Mary Njugush",
    skill: "Electrician",
    location: "Mombasa",
    availability: "Available in 1-2 days",
    phone: "+254 789 012 345",
    email: "mary.njugush@example.com",
    rating: 4.8,
    jobsCompleted: 178,
    photoURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    hourlyRate: "KES 1,900/hr",
    description: "Coastal electrician with experience in marine and residential installations. Quality workmanship guaranteed."
  },
  {
    id: "w9",
    name: "Francis Mutua",
    skill: "Carpenter",
    location: "Nairobi",
    availability: "Available Now",
    phone: "+254 790 123 456",
    email: "francis.mutua@example.com",
    rating: 4.6,
    jobsCompleted: 119,
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    hourlyRate: "KES 1,700/hr",
    description: "Trained in the latest carpentry techniques. Kitchen cabinets, built-in storage, and custom designs a specialty."
  },
  {
    id: "w10",
    name: "Rose Kimani",
    skill: "Painter",
    location: "Nairobi",
    availability: "Available in 1-2 days",
    phone: "+254 701 234 567",
    email: "rose.kimani@example.com",
    rating: 4.7,
    jobsCompleted: 189,
    photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    hourlyRate: "KES 1,350/hr",
    description: "Specialty painter known for decorative finishes and color consultations. Residential and commercial projects welcome."
  },
  {
    id: "w11",
    name: "George Omondi",
    skill: "Mason",
    location: "Mombasa",
    availability: "Available Now",
    phone: "+254 712 345 678",
    email: "george.omondi@example.com",
    rating: 4.5,
    jobsCompleted: 95,
    photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    hourlyRate: "KES 1,350/hr",
    description: "Coastal mason experienced with cement work near the ocean. Quality materials and lasting results guaranteed."
  },
  {
    id: "w12",
    name: "Lucy Kiplagat",
    skill: "Cleaner",
    location: "Nairobi",
    availability: "Available Now",
    phone: "+254 723 456 789",
    email: "lucy.kiplagat@example.com",
    rating: 4.8,
    jobsCompleted: 367,
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    hourlyRate: "KES 900/hr",
    description: "Professional cleaner with corporate and residential experience. Scheduled or one-time cleaning services available. Fast turnaround times."
  }
];
