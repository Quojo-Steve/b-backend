import { randomUUID } from 'crypto';
import { ITrainingApplication } from '../types/training.types';
import { ITrainingApplicationRepository } from './ITrainingApplicationRepository';

export class InMemoryTrainingApplicationRepository implements ITrainingApplicationRepository {
  private readonly applications: Map<string, ITrainingApplication> = new Map();

  public async create(
    applicationData: Omit<ITrainingApplication, 'id'>,
  ): Promise<ITrainingApplication> {
    const application: ITrainingApplication = {
      ...applicationData,
      id: `app_${randomUUID().slice(0, 8)}`,
    };
    this.applications.set(application.id, application);
    return application;
  }

  public async findAll(): Promise<ITrainingApplication[]> {
    return Array.from(this.applications.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  }

  public async findById(id: string): Promise<ITrainingApplication | null> {
    return this.applications.get(id) ?? null;
  }

  public async update(
    id: string,
    updates: Partial<ITrainingApplication>,
  ): Promise<ITrainingApplication | null> {
    const existing = this.applications.get(id);
    if (!existing) {
      return null;
    }
    const updated: ITrainingApplication = { ...existing, ...updates };
    this.applications.set(id, updated);
    return updated;
  }
}
