import { z } from 'zod';
import { NewsStatus } from './news.types';

/**
 * Requests hit this endpoint as multipart/form-data (to carry the optional
 * image file alongside it), so every field arrives as a string - z.coerce
 * is used wherever a non-string type is actually needed.
 */
export const createNewsSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  titleFr: z.string().min(3, 'French title is required.'),
  tag: z.string().min(2, 'Tag is required.'),
  tagFr: z.string().min(2, 'French tag is required.'),
  pillar: z.string().min(2, 'Pillar is required.'),
  pillarFr: z.string().min(2, 'French pillar is required.'),
  note: z.string().min(5, 'Note is required.').max(500, 'Note must be 500 characters or fewer.'),
  noteFr: z.string().min(5, 'French note is required.').max(500, 'French note must be 500 characters or fewer.'),
  body: z.string().optional(),
  bodyFr: z.string().optional(),
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