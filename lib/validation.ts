import { z } from 'zod';

// ============= AUTH VALIDATION SCHEMAS =============

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  role: z.enum(['client', 'fundi', 'admin'], {
    errorMap: () => ({ message: 'Role must be client, fundi, or admin' })
  }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the Terms of Service and Privacy Policy'
  })
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginSchema>;

export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address')
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

export const setNewPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)')
});

export type SetNewPasswordInput = z.infer<typeof setNewPasswordSchema>;

// ============= WORKER/FUNDI VALIDATION SCHEMAS =============

export const workerApplicationSchema = z.object({
  userId: z.string(),
  skill: z.enum(['plumbing', 'electrical', 'carpentry', 'painting', 'masonry', 'cleaning'], {
    errorMap: () => ({ message: 'Invalid skill selection' })
  }),
  hourlyRate: z
    .number()
    .positive('Hourly rate must be positive')
    .min(100, 'Hourly rate must be at least 100')
    .max(50000, 'Hourly rate cannot exceed 50000'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  yearsOfExperience: z.number().int().min(0).max(80, 'Invalid years of experience'),
  certificateUrl: z.string().url('Invalid certificate URL').optional(),
  tvetInstitution: z.string().max(200).optional()
});

export type WorkerApplicationInput = z.infer<typeof workerApplicationSchema>;
export const corporatePostingSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().min(7, 'Invalid phone number').max(20, 'Invalid phone number'),
  companyWebsite: z.string().url('Invalid website URL').optional().or(z.literal('')),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  postingType: z.enum(['internship', 'corporate_hire', 'recruitment', 'tvet'], {
    errorMap: () => ({ message: 'Invalid request type' })
  }),
  serviceCategory: z.enum(['plumbing', 'electrical', 'carpentry', 'painting', 'masonry', 'cleaning', 'general'], {
    errorMap: () => ({ message: 'Invalid service category' })
  }),
  positions: z.number().int().min(1, 'At least one position is required').max(100, 'Please request 100 or fewer positions'),
  preferredStartDate: z.string().optional().or(z.literal('')),
  duration: z.string().max(100, 'Duration description is too long').optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be 1000 characters or fewer'),
});

export type CorporatePostingInput = z.infer<typeof corporatePostingSchema>;

export const internshipApplicationSchema = z.object({
  postingId: z.string().min(1, 'Internship posting ID is required'),
  applicantName: z.string().min(2, 'Name must be at least 2 characters'),
  applicantEmail: z.string().email('Invalid email address'),
  applicantPhone: z.string().min(7, 'Invalid phone number'),
  institution: z.string().min(2, 'Institution must be at least 2 characters'),
  yearOfStudy: z.string().min(1, 'Year of study is required'),
  areaOfInterest: z.string().min(2, 'Area of interest is required'),
  motivation: z.string().min(10, 'Motivation must be at least 10 characters').max(1000, 'Motivation must be 1000 characters or fewer'),
  resumeUrl: z.string().url('Invalid resume URL').optional().or(z.literal('')),
});

export type InternshipApplicationInput = z.infer<typeof internshipApplicationSchema>;
export const fundiProfileUpdateSchema = z.object({
  hourlyRate: z.number().positive().min(100).max(50000).optional(),
  description: z.string().min(10).max(500).optional(),
  availability: z.boolean().optional(),
  phoneNumber: z.string().regex(/^(\+?254|0)[0-9]{9}$/, 'Invalid phone number format').optional()
});

export type FundiProfileUpdateInput = z.infer<typeof fundiProfileUpdateSchema>;

// ============= BOOKING VALIDATION SCHEMAS =============

export const bookingSchema = z.object({
  fundiId: z.string().min(1, 'Fundi ID is required'),
  serviceType: z.enum(['repair', 'installation', 'consultation', 'emergency']),
  description: z.string().min(5, 'Description must be at least 5 characters').max(500),
  preferredDate: z
    .string()
    .refine(date => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Booking date must be today or in the future'),
  preferredTime: z.enum(['morning', 'afternoon', 'evening']),
  location: z.string().min(3, 'Location must be at least 3 characters')
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const bookingStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed'], {
    errorMap: () => ({ message: 'Invalid status' })
  }),
  notes: z.string().max(500).optional()
});

export type BookingStatusUpdateInput = z.infer<typeof bookingStatusUpdateSchema>;

// ============= RATING/REVIEW VALIDATION SCHEMAS =============

export const ratingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  funderId: z.string().min(1, 'Fundi ID is required'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  review: z.string().min(5, 'Review must be at least 5 characters').max(500).optional()
});

export type RatingInput = z.infer<typeof ratingSchema>;

// ============= ADMIN VALIDATION SCHEMAS =============

export const applicationApprovalSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().min(10, 'Rejection reason must be at least 10 characters').optional()
});

export type ApplicationApprovalInput = z.infer<typeof applicationApprovalSchema>;

export const identityVerificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  status: z.enum(['pending', 'verified', 'rejected']),
  rejectionReason: z.string().optional()
});

export type IdentityVerificationInput = z.infer<typeof identityVerificationSchema>;

// ============= DISPUTE VALIDATION SCHEMAS =============

export const raiseDisputeSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  bookingId: z.string().optional(),
  reason: z.enum(['work_incomplete', 'poor_quality', 'no_show', 'unresponsive', 'other'], {
    errorMap: () => ({ message: 'Invalid reason' })
  }),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  evidenceUrls: z.array(z.string().url('Invalid evidence URL')).max(5, 'Maximum 5 evidence files allowed').optional()
});

export type RaiseDisputeInput = z.infer<typeof raiseDisputeSchema>;

export const resolveDisputeSchema = z.object({
  resolutionNotes: z.string().min(10, 'Resolution notes must be at least 10 characters'),
  status: z.enum(['resolved_refunded', 'resolved_released', 'resolved_split']),
  splitPercentageClient: z.number().min(0).max(100).optional()
});

export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;

// ============= UTILITY FUNCTIONS =============

/**
 * Validate data against schema and return typed result or error
 */
export function validateData<T>(schema: z.ZodSchema, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error };
  }
  return { success: true, data: result.data as T };
}

/**
 * Get formatted error messages from Zod validation error
 */
export function getValidationErrorMessages(errors: z.ZodError): Record<string, string> {
  const messages: Record<string, string> = {};
  errors.errors.forEach(error => {
    const path = error.path.join('.');
    messages[path] = error.message;
  });
  return messages;
}
