export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Mirrors the training-application row of the governance workflow table in
 * the platform report: External applicant -> Country coordinator (review)
 * -> Consortium review panel (approval).
 */
export interface ITrainingApplication {
  id: string;
  applicantFullName: string;
  applicantEmail: string;
  country: string;
  organisation?: string;
  motivation: string;
  status: ApplicationStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  submittedAt: string;
  updatedAt: string;
}
