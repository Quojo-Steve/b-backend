import { z } from 'zod';
import { PressReleaseStatus } from './pressRelease.types';

export const createPressReleaseSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  titleFr: z.string().min(3, 'French title is required.'),
  summary: z.string().min(5, 'Summary is required.').max(1000, 'Summary must be 1000 characters or fewer.').optional(),
  summaryFr: z.string().min(5, 'French summary is required.').max(1000, 'French summary must be 1000 characters or fewer.').optional(),
  releaseDate: z.coerce.date().optional(),
});

export type CreatePressReleaseDto = z.infer<typeof createPressReleaseSchema>;

export const updatePressReleaseSchema = createPressReleaseSchema.partial();
export type UpdatePressReleaseDto = z.infer<typeof updatePressReleaseSchema>;

export const updatePressReleaseStatusSchema = z.object({
  status: z.nativeEnum(PressReleaseStatus, {
    errorMap: () => ({ message: 'status must be either "published" or "disabled".' }),
  }),
});

export type UpdatePressReleaseStatusDto = z.infer<typeof updatePressReleaseStatusSchema>;
