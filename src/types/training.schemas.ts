import { z } from 'zod';
import { ApplicationStatus } from './training.types';

export const submitApplicationSchema = z.object({
  applicantFullName: z.string().min(2, 'Applicant full name is required.'),
  applicantEmail: z.string().email('A valid email address is required.'),
  country: z.string().min(2, 'Country is required.'),
  organisation: z.string().min(2).optional(),
  motivation: z
    .string()
    .min(20, 'Please provide at least a short paragraph on your motivation.')
    .max(2000, 'Motivation statement must be under 2000 characters.'),
});

export type SubmitApplicationDto = z.infer<typeof submitApplicationSchema>;

export const reviewApplicationSchema = z.object({
  status: z.enum([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED], {
    errorMap: () => ({ message: 'Status must be either "approved" or "rejected".' }),
  }),
  reviewNotes: z.string().max(2000).optional(),
});

export type ReviewApplicationDto = z.infer<typeof reviewApplicationSchema>;
