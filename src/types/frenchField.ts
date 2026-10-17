import { z } from 'zod';

/**
 * French translations are optional everywhere. A missing field - or a blank one,
 * which is what a multipart form sends for an empty input - means "no translation
 * provided" rather than a validation error.
 */
export const frenchField = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    schema.optional(),
  );
