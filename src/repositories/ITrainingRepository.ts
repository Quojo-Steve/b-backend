import { ICohort, ITraining, TrainingStatus } from '../types/training.types';

export interface NewTraining {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: TrainingStatus;
  createdBy: string;
}

export interface NewCohort {
  name: string;
  startDate: string;
  endDate: string;
  capacity: number;
}

export type TrainingUpdates = Partial<
  Pick<ITraining, 'title' | 'description' | 'startDate' | 'endDate' | 'status'>
>;

/**
 * Persistence contract for trainings and their cohorts. No delete method on
 * purpose - a training is "removed" by setting its status to DISABLED, the same
 * pattern used for news and press releases.
 */
export interface ITrainingRepository {
  create(data: NewTraining, cohorts: NewCohort[]): Promise<ITraining>;
  findAll(includeDisabled: boolean): Promise<ITraining[]>;
  findById(id: string): Promise<ITraining | null>;
  update(id: string, updates: TrainingUpdates): Promise<ITraining | null>;
  addCohort(trainingId: string, data: NewCohort): Promise<ICohort>;
  findCohortById(id: string): Promise<ICohort | null>;
  updateCohort(id: string, updates: Partial<NewCohort>): Promise<ICohort | null>;
}
