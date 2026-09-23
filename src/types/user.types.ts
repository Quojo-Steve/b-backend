/**
 * Roles reflect the BRACE governance/content-workflow model described in the
 * platform concept: distinct submit/review/approve responsibilities per
 * stakeholder group, rather than a flat admin/user split.
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin', // AGENDA Tanzania - overall platform ownership
  WEB_MANAGER = 'web_manager', // Day-to-day CMS/content administration
  TECHNICAL_REVIEWER = 'technical_reviewer', // Oeko-Institut - technical/scientific QC
  COUNTRY_COORDINATOR = 'country_coordinator', // Per-country content & applications
  CONSORTIUM_PARTNER = 'consortium_partner', // Partner-restricted area access
  APPLICANT = 'applicant', // Training programme applicants
}

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  countryAffiliation?: string;
  isActive: boolean;
}

/**
 * Shape of a user once safe for transmission to the client
 * (never includes the password hash).
 */
export type PublicUser = Omit<IUser, 'passwordHash'>;

export interface IJwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
