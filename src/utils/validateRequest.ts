import { ZodSchema } from 'zod';
import { ValidationError } from '../errors/AppError';

/**
 * Parses `input` against a zod schema, throwing a ValidationError (handled
 * uniformly by errorHandlerMiddleware) on failure instead of returning a
 * result object every call site has to check.
 */
export function parseOrThrow<T>(schema: ZodSchema<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid request payload.';
    throw new ValidationError(message);
  }
  return result.data;
}
