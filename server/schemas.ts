import { z } from 'zod';

export const ProfileSchema = z.object({
  experience: z.string().trim().max(100).optional(),
  licenses: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
  availability: z.string().trim().max(100).optional(),
  interests: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
});

export const MatchRequestSchema = z.object({
  apiKey: z
    .string()
    .trim()
    .min(20)
    .max(150)
    .regex(/^[A-Za-z0-9_\-.]+$/, 'apiKey contains invalid characters'),
  profile: ProfileSchema,
});

export const ExpectedAISchema = z.array(
  z.object({
    title: z.string(),
    company: z.string(),
    type: z.string(),
    rate: z.string(),
    match: z.string(),
    tags: z.array(z.string()).default([]),
  }),
);

export const AuthProfileCreateSchema = z.object({
  role: z.enum(['dentist', 'client']),
});

export const UserProfilePatchSchema = ProfileSchema.extend({
  displayName: z.string().trim().min(2).max(100).optional(),
  photoURL: z.string().url().max(2048).optional(),
  onboardingComplete: z.boolean().optional(),
  verificationStatus: z.enum(['unverified', 'pending', 'approved', 'rejected']).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one profile field is required.',
});

export const GigCreateSchema = z.object({
  title: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(120),
  type: z.string().trim().min(2).max(60),
  rateLabel: z.string().trim().min(2).max(40),
  description: z.string().trim().max(1000).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  remoteOnly: z.boolean().default(true),
  status: z.enum(['draft', 'open', 'closed']).default('open'),
});

export const GigPatchSchema = z
  .object({
    title: z.string().trim().min(2).max(120).optional(),
    company: z.string().trim().min(2).max(120).optional(),
    type: z.string().trim().min(2).max(60).optional(),
    rateLabel: z.string().trim().min(2).max(40).optional(),
    description: z.string().trim().max(1000).optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
    remoteOnly: z.boolean().optional(),
    status: z.enum(['draft', 'open', 'closed']).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'At least one field is required.',
  });

export const VerificationSubmitSchema = z.object({
  legalName: z.string().trim().min(3).max(120),
  email: z.string().trim().email(),
  clinic: z.string().trim().min(2).max(160),
  issuingState: z.string().trim().min(2).max(80),
  licenseNumber: z.string().trim().min(6).max(80),
  documentName: z.string().trim().min(3).max(255),
  documentPath: z.string().trim().min(3).max(512).optional(),
  documentContentType: z.string().trim().min(3).max(120).optional(),
  documentSizeBytes: z.coerce.number().int().positive().max(10 * 1024 * 1024).optional(),
  hasSelfieCheck: z.literal(true),
  hasDisclosureConsent: z.literal(true),
});

export const AppointmentCreateSchema = z.object({
  dentistId: z.string().trim().min(2).max(128).optional(),
  dentistName: z.string().trim().min(2).max(120).optional(),
  reason: z.string().trim().min(10).max(500),
  scheduledFor: z.string().datetime().optional(),
});

export const AppointmentPatchSchema = z.object({
  status: z.enum(['requested', 'confirmed', 'completed', 'cancelled']),
  scheduledFor: z.string().datetime().optional(),
  dentistId: z.string().trim().min(2).max(128).optional(),
  dentistName: z.string().trim().min(2).max(120).optional(),
});

export const WithdrawalRequestSchema = z.object({
  amount: z.coerce.number().positive().max(50000),
  currency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase()),
  provider: z.enum(['stripe', 'mpesa']),
  destinationLabel: z.string().trim().min(3).max(120),
});

export const AdminVerificationDecisionSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  reviewNote: z.string().trim().max(400).optional(),
});

export const AdminWithdrawalDecisionSchema = z.object({
  status: z.enum(['queued', 'paid', 'failed']),
});

export const AdminUserRolePatchSchema = z.object({
  role: z.enum(['dentist', 'client', 'admin']),
});

export const StripeWebhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  created: z.number().optional(),
  data: z.object({
    object: z.record(z.string(), z.unknown()).optional(),
  }),
});
