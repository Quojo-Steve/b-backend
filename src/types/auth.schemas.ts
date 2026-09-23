import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('A valid email address is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

export type LoginDto = z.infer<typeof loginSchema>;

/**
 * Public self-registration is intentionally limited to creating an
 * "applicant" account. Staff roles (coordinators, reviewers, admins) are
 * provisioned separately by a super admin, never through this open endpoint
 * - accepting a role field here would let anyone register as an admin.
 */
export const registerSchema = z.object({
  email: z.string().email('A valid email address is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  fullName: z.string().min(2, 'Full name is required.'),
  countryAffiliation: z.string().min(2).optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;
