import { ITrainingApplication } from '../types/training.types';

export interface ITrainingApplicationRepository {
  create(application: Omit<ITrainingApplication, 'id'>): Promise<ITrainingApplication>;
  findAll(): Promise<ITrainingApplication[]>;
  findById(id: string): Promise<ITrainingApplication | null>;
  update(id: string, updates: Partial<ITrainingApplication>): Promise<ITrainingApplication | null>;
}
