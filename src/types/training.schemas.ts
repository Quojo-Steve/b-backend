import { z } from 'zod';
import { ApplicationStatus, TrainingStatus } from './training.types';

export const submitApplicationSchema = z.object({
  cohortId: z.string().min(1, 'Cohort is required.'),
  applicantFullName: z.string().min(2, 'Applicant full name is required.'),
  applicantEmail: z.string().trim().toLowerCase().email('A valid email address is required.'),
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

export const listApplicationsQuerySchema = z.object({
  cohortId: z.string().min(1).optional(),
  trainingId: z.string().min(1).optional(),
});
export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;

const dateField = (label: string) =>
  z.coerce.date({ errorMap: () => ({ message: `${label} must be a valid date.` }) });

const endsAfterStart = (d: { startDate?: Date; endDate?: Date }) =>
  !d.startDate || !d.endDate || d.startDate < d.endDate;

const cohortBase = z.object({
  name: z.string().trim().min(2, 'Cohort name is required.'),
  startDate: dateField('Cohort start date'),
  endDate: dateField('Cohort end date'),
  capacity: z.coerce
    .number()
    .int('Application limit must be a whole number.')
    .min(1, 'Application limit must be at least 1.'),
});

export const cohortInputSchema = cohortBase.refine(endsAfterStart, {
  message: 'Cohort end date must be after its start date.',
  path: ['endDate'],
});
export const updateCohortSchema = cohortBase.partial().refine(endsAfterStart, {
  message: 'Cohort end date must be after its start date.',
  path: ['endDate'],
});
export type CohortInputDto = z.infer<typeof cohortInputSchema>;
export type UpdateCohortDto = z.infer<typeof updateCohortSchema>;

const trainingBase = z.object({
  title: z.string().trim().min(3, 'Title is required.'),
  description: z.string().max(5000).optional(),
  startDate: dateField('Training start date'),
  endDate: dateField('Training end date'),
});

export const createTrainingSchema = trainingBase
  .extend({
    cohorts: z.array(cohortInputSchema).min(1, 'At least one cohort is required.').max(50),
  })
  .refine(endsAfterStart, {
    message: 'Training end date must be after its start date.',
    path: ['endDate'],
  });
export type CreateTrainingDto = z.infer<typeof createTrainingSchema>;

export const updateTrainingSchema = trainingBase.partial().refine(endsAfterStart, {
  message: 'Training end date must be after its start date.',
  path: ['endDate'],
});
export type UpdateTrainingDto = z.infer<typeof updateTrainingSchema>;

export const updateTrainingStatusSchema = z.object({
  status: z.nativeEnum(TrainingStatus, {
    errorMap: () => ({ message: 'status must be either "published" or "disabled".' }),
  }),
});
