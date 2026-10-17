import { z } from 'zod';
import { NewsStatus } from './news.types';
import { frenchField } from './frenchField';

/**
 * Requests hit this endpoint as multipart/form-data (to carry the optional
 * image file alongside it), so every field arrives as a string - z.coerce
 * is used wherever a non-string type is actually needed.
 */
export const createNewsSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  titleFr: frenchField(z.string()),
  tag: z.string().min(2, 'Tag is required.'),
  tagFr: frenchField(z.string()),
  pillar: z.string().min(2, 'Pillar is required.'),
  pillarFr: frenchField(z.string()),
  note: z.string().min(5, 'Note is required.').max(50000, 'Note must be 50000 characters or fewer.'),
  noteFr: frenchField(z.string().max(50000, 'French note must be 50000 characters or fewer.')),
  body: z.string().optional(),
  bodyFr: frenchField(z.string()),
  publishedDate: z.coerce.date().optional(),
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