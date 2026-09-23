import { z } from 'zod';

export const createNewsletterSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  bodyHtml: z.string().min(10, 'Newsletter content is required.'),
});
export type CreateNewsletterDto = z.infer<typeof createNewsletterSchema>;

export const subscribeSchema = z.object({
  email: z.string().email('A valid email address is required.'),
});
export type SubscribeDto = z.infer<typeof subscribeSchema>;

export const unsubscribeSchema = z.object({
  email: z.string().email('A valid email address is required.'),
});
export type UnsubscribeDto = z.infer<typeof unsubscribeSchema>;
