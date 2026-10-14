export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * A registration for one cohort of a training. Mirrors the training-application
 * row of the governance workflow table in the platform report: External
 * applicant -> Country coordinator (review) -> Consortium review panel (approval).
 */
export interface ITrainingApplication {
  id: string;
  cohortId?: string; // undefined only for applications created before cohorts existed
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

/** What staff see: the registration plus readable cohort/training labels. */
export interface ITrainingApplicationView extends ITrainingApplication {
  cohortName?: string;
  trainingId?: string;
  trainingTitle?: string;
}

export enum TrainingStatus {
  PUBLISHED = 'published',
  DISABLED = 'disabled', // replaces delete, same pattern as news/press releases
}

export interface ICohort {
  id: string;
  trainingId: string;
  name: string;
  startDate: string;
  endDate: string;
  capacity: number; // application limit
  createdAt: string;
  updatedAt: string;
}

export interface ITraining {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: TrainingStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  cohorts: ICohort[];
}

export interface ICohortView extends ICohort {
  registeredCount: number;
  spotsLeft: number;
  registrationOpen: boolean;
}

export interface ITrainingView extends Omit<ITraining, 'cohorts'> {
  cohortCount: number;
  cohorts: ICohortView[];
}
