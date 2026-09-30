import { z } from 'zod';

const booleanField = z.preprocess(
  (value) => (value === 'true' ? true : value === 'false' ? false : value),
  z.boolean(),
);

export const createPartnerSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  country: z.string().min(2, 'Country is required.'),
  about: z.string().min(2, 'About is required.'),
  description: z.string().min(1, 'Description is required.'),
  websiteUrl: z.string().url('Website URL must be valid.').optional(),
  isActive: booleanField.optional(),
});

export type CreatePartnerDto = z.infer<typeof createPartnerSchema>;

export const updatePartnerSchema = createPartnerSchema.partial();
export type UpdatePartnerDto = z.infer<typeof updatePartnerSchema>;

export const updatePartnerStatusSchema = z.object({
  isActive: z.boolean(),
});