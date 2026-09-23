import { z } from 'zod';
import { NewsStatus } from './news.types';

/**
 * Requests hit this endpoint as multipart/form-data (to carry the optional
 * image file alongside it), so every field arrives as a string - z.coerce
 * is used wherever a non-string type is actually needed.
 */
export const createNewsSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  tag: z.string().min(2, 'Tag is required.'),
  pillar: z.string().min(2, 'Pillar is required.'),
  note: z.string().min(5, 'Note is required.').max(500, 'Note must be 500 characters or fewer.'),
  body: z.string().optional(),
  publishedDate: z.coerce.date().optional(), // defaults to "now" in the service if omitted
});
export type CreateNewsDto = z.infer<typeof createNewsSchema>;

export const updateNewsSchema = createNewsSchema.partial();
export type UpdateNewsDto = z.infer<typeof updateNewsSchema>;

export const updateNewsStatusSchema = z.object({
  status: z.nativeEnum(NewsStatus, {
    errorMap: () => ({ message: 'status must be either "published" or "disabled".' }),
  }),
});
export type UpdateNewsStatusDto = z.infer<typeof updateNewsStatusSchema>;