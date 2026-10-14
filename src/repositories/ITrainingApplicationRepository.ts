import { ITrainingApplication } from '../types/training.types';

export type NewRegistration = Omit<ITrainingApplication, 'id'> & { cohortId: string };

export interface RegistrationLimits {
  capacity: number;
  /** Every cohort of the same training; used to stop one email registering twice. */
  siblingCohortIds: string[];
}

export type RegistrationOutcome =
  | { outcome: 'created'; application: ITrainingApplication }
  | { outcome: 'cohort_full' }
  | { outcome: 'duplicate' };

export interface ApplicationFilter {
  cohortIds?: string[]; // an empty array matches nothing
}

export interface ITrainingApplicationRepository {
  create(application: Omit<ITrainingApplication, 'id'>): Promise<ITrainingApplication>;
  /** Capacity check + duplicate check + insert, as one atomic step. */
  createInCohort(data: NewRegistration, limits: RegistrationLimits): Promise<RegistrationOutcome>;
  /** Registrations that occupy a place (everything except rejected), keyed by cohort id. */
  countActiveByCohorts(cohortIds: string[]): Promise<Record<string, number>>;
  findAll(filter?: ApplicationFilter): Promise<ITrainingApplication[]>;
  findById(id: string): Promise<ITrainingApplication | null>;
  update(id: string, updates: Partial<ITrainingApplication>): Promise<ITrainingApplication | null>;
}
