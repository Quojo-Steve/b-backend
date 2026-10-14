import { randomUUID } from 'crypto';
import { ICohort, ITraining, TrainingStatus } from '../types/training.types';
import { ITrainingRepository, NewCohort, NewTraining, TrainingUpdates } from './ITrainingRepository';

export class InMemoryTrainingRepository implements ITrainingRepository {
  private readonly items: Map<string, ITraining> = new Map();

  private buildCohort(trainingId: string, data: NewCohort): ICohort {
    const now = new Date().toISOString();
    return {
      ...data,
      id: `cohort_${randomUUID().slice(0, 8)}`,
      trainingId,
      createdAt: now,
      updatedAt: now,
    };
  }

  private sorted(cohorts: ICohort[]): ICohort[] {
    return [...cohorts].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
  }

  public async create(data: NewTraining, cohorts: NewCohort[]): Promise<ITraining> {
    const now = new Date().toISOString();
    const id = `training_${randomUUID().slice(0, 8)}`;
    const training: ITraining = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      cohorts: this.sorted(cohorts.map((c) => this.buildCohort(id, c))),
    };
    this.items.set(id, training);
    return training;
  }

  public async findAll(includeDisabled: boolean): Promise<ITraining[]> {
    return Array.from(this.items.values())
      .filter((t) => includeDisabled || t.status === TrainingStatus.PUBLISHED)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  public async findById(id: string): Promise<ITraining | null> {
    return this.items.get(id) ?? null;
  }

  public async update(id: string, updates: TrainingUpdates): Promise<ITraining | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }
    const updated: ITraining = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.items.set(id, updated);
    return updated;
  }

  public async addCohort(trainingId: string, data: NewCohort): Promise<ICohort> {
    const training = this.items.get(trainingId);
    if (!training) {
      throw new Error(`Training ${trainingId} not found`);
    }
    const cohort = this.buildCohort(trainingId, data);
    training.cohorts = this.sorted([...training.cohorts, cohort]);
    return cohort;
  }

  public async findCohortById(id: string): Promise<ICohort | null> {
    for (const training of this.items.values()) {
      const found = training.cohorts.find((c) => c.id === id);
      if (found) {
        return found;
      }
    }
    return null;
  }

  public async updateCohort(id: string, updates: Partial<NewCohort>): Promise<ICohort | null> {
    for (const training of this.items.values()) {
      const index = training.cohorts.findIndex((c) => c.id === id);
      if (index !== -1) {
        const updated: ICohort = {
          ...training.cohorts[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        training.cohorts[index] = updated;
        training.cohorts = this.sorted(training.cohorts);
        return updated;
      }
    }
    return null;
  }
}
