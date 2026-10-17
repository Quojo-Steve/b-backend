import { z } from 'zod';
import { PressReleaseStatus } from './pressRelease.types';
import { frenchField } from './frenchField';

export const createPressReleaseSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  titleFr: frenchField(z.string()),
  summary: z.string().min(5, 'Summary is required.').max(50000, 'Summary must be 50000 characters or fewer.').optional(),
  summaryFr: frenchField(z.string().max(50000, 'French summary must be 50000 characters or fewer.')),
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
