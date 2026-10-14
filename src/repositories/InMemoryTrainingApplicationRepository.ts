import { randomUUID } from 'crypto';
import { ApplicationStatus, ITrainingApplication } from '../types/training.types';
import {
  ApplicationFilter,
  ITrainingApplicationRepository,
  NewRegistration,
  RegistrationLimits,
  RegistrationOutcome,
} from './ITrainingApplicationRepository';

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

  public async createInCohort(
    data: NewRegistration,
    limits: RegistrationLimits,
  ): Promise<RegistrationOutcome> {
    const all = Array.from(this.applications.values());

    const duplicate = all.some(
      (a) =>
        a.applicantEmail === data.applicantEmail &&
        a.cohortId !== undefined &&
        limits.siblingCohortIds.includes(a.cohortId),
    );
    if (duplicate) {
      return { outcome: 'duplicate' };
    }

    const taken = all.filter(
      (a) => a.cohortId === data.cohortId && a.status !== ApplicationStatus.REJECTED,
    ).length;
    if (taken >= limits.capacity) {
      return { outcome: 'cohort_full' };
    }

    const application = await this.create(data);
    return { outcome: 'created', application };
  }

  public async countActiveByCohorts(cohortIds: string[]): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const a of this.applications.values()) {
      if (
        a.cohortId !== undefined &&
        cohortIds.includes(a.cohortId) &&
        a.status !== ApplicationStatus.REJECTED
      ) {
        counts[a.cohortId] = (counts[a.cohortId] ?? 0) + 1;
      }
    }
    return counts;
  }

  public async findAll(filter: ApplicationFilter = {}): Promise<ITrainingApplication[]> {
    return Array.from(this.applications.values())
      .filter(
        (a) =>
          !filter.cohortIds ||
          (a.cohortId !== undefined && filter.cohortIds.includes(a.cohortId)),
      )
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
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
