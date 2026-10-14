import type { PrismaClient, ApplicationStatus as PrismaApplicationStatus } from '@prisma/client';
import { ApplicationStatus, ITrainingApplication } from '../types/training.types';
import {
  ApplicationFilter,
  ITrainingApplicationRepository,
  NewRegistration,
  RegistrationLimits,
  RegistrationOutcome,
} from './ITrainingApplicationRepository';

/**
 * MySQL-backed implementation of ITrainingApplicationRepository.
 *
 * As with PrismaUserRepository, this class is the single place that
 * translates between the app's lowercase `ApplicationStatus` domain enum
 * and Prisma's SCREAMING_CASE generated enum, and between Prisma's
 * `Date` fields and the ISO-string timestamps the rest of the app uses.
 */
export class PrismaTrainingApplicationRepository implements ITrainingApplicationRepository {
  private static readonly STATUS_TO_DOMAIN: Record<PrismaApplicationStatus, ApplicationStatus> = {
    SUBMITTED: ApplicationStatus.SUBMITTED,
    UNDER_REVIEW: ApplicationStatus.UNDER_REVIEW,
    APPROVED: ApplicationStatus.APPROVED,
    REJECTED: ApplicationStatus.REJECTED,
  };

  private static readonly STATUS_TO_PRISMA: Record<ApplicationStatus, PrismaApplicationStatus> = {
    [ApplicationStatus.SUBMITTED]: 'SUBMITTED',
    [ApplicationStatus.UNDER_REVIEW]: 'UNDER_REVIEW',
    [ApplicationStatus.APPROVED]: 'APPROVED',
    [ApplicationStatus.REJECTED]: 'REJECTED',
  };

  constructor(private readonly prisma: PrismaClient) {}

  public async create(
    applicationData: Omit<ITrainingApplication, 'id'>,
  ): Promise<ITrainingApplication> {
    const record = await this.prisma.trainingApplication.create({
      data: {
        cohortId: applicationData.cohortId,
        applicantFullName: applicationData.applicantFullName,
        applicantEmail: applicationData.applicantEmail,
        country: applicationData.country,
        organisation: applicationData.organisation,
        motivation: applicationData.motivation,
        status: PrismaTrainingApplicationRepository.STATUS_TO_PRISMA[applicationData.status],
        reviewedBy: applicationData.reviewedBy,
        reviewNotes: applicationData.reviewNotes,
      },
    });
    return this.toDomain(record);
  }

  public async createInCohort(
    data: NewRegistration,
    limits: RegistrationLimits,
  ): Promise<RegistrationOutcome> {
    return this.prisma.$transaction(async (tx): Promise<RegistrationOutcome> => {
      // Row lock on the cohort: concurrent registrations for the same cohort queue
      // up here, so the count below is always current and the limit can't be exceeded.
      await tx.$queryRaw`SELECT id FROM cohorts WHERE id = ${data.cohortId} FOR UPDATE`;

      const duplicate = await tx.trainingApplication.findFirst({
        where: {
          applicantEmail: data.applicantEmail,
          cohortId: { in: limits.siblingCohortIds },
        },
        select: { id: true },
      });
      if (duplicate) {
        return { outcome: 'duplicate' };
      }

      const taken = await tx.trainingApplication.count({
        where: { cohortId: data.cohortId, status: { not: 'REJECTED' } },
      });
      if (taken >= limits.capacity) {
        return { outcome: 'cohort_full' };
      }

      const record = await tx.trainingApplication.create({
        data: {
          cohortId: data.cohortId,
          applicantFullName: data.applicantFullName,
          applicantEmail: data.applicantEmail,
          country: data.country,
          organisation: data.organisation,
          motivation: data.motivation,
          status: PrismaTrainingApplicationRepository.STATUS_TO_PRISMA[data.status],
        },
      });
      return { outcome: 'created', application: this.toDomain(record) };
    });
  }

  public async countActiveByCohorts(cohortIds: string[]): Promise<Record<string, number>> {
    if (cohortIds.length === 0) {
      return {};
    }
    const groups = await this.prisma.trainingApplication.groupBy({
      by: ['cohortId'],
      where: { cohortId: { in: cohortIds }, status: { not: 'REJECTED' } },
      _count: { _all: true },
    });
    const counts: Record<string, number> = {};
    for (const group of groups) {
      if (group.cohortId) {
        counts[group.cohortId] = group._count._all;
      }
    }
    return counts;
  }

  public async findAll(filter: ApplicationFilter = {}): Promise<ITrainingApplication[]> {
    const records = await this.prisma.trainingApplication.findMany({
      where: filter.cohortIds ? { cohortId: { in: filter.cohortIds } } : undefined,
      orderBy: { submittedAt: 'desc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  public async findById(id: string): Promise<ITrainingApplication | null> {
    const record = await this.prisma.trainingApplication.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  public async update(
    id: string,
    updates: Partial<ITrainingApplication>,
  ): Promise<ITrainingApplication | null> {
    try {
      const record = await this.prisma.trainingApplication.update({
        where: { id },
        data: {
          ...(updates.status && {
            status: PrismaTrainingApplicationRepository.STATUS_TO_PRISMA[updates.status],
          }),
          ...(updates.reviewedBy !== undefined && { reviewedBy: updates.reviewedBy }),
          ...(updates.reviewNotes !== undefined && { reviewNotes: updates.reviewNotes }),
        },
      });
      return this.toDomain(record);
    } catch {
      // Prisma throws (P2025) when the record does not exist; the
      // interface contract is to return null in that case instead.
      return null;
    }
  }

  private toDomain(record: {
    id: string;
    cohortId: string | null;
    applicantFullName: string;
    applicantEmail: string;
    country: string;
    organisation: string | null;
    motivation: string;
    status: PrismaApplicationStatus;
    reviewedBy: string | null;
    reviewNotes: string | null;
    submittedAt: Date;
    updatedAt: Date;
  }): ITrainingApplication {
    return {
      id: record.id,
      cohortId: record.cohortId ?? undefined,
      applicantFullName: record.applicantFullName,
      applicantEmail: record.applicantEmail,
      country: record.country,
      organisation: record.organisation ?? undefined,
      motivation: record.motivation,
      status: PrismaTrainingApplicationRepository.STATUS_TO_DOMAIN[record.status],
      reviewedBy: record.reviewedBy ?? undefined,
      reviewNotes: record.reviewNotes ?? undefined,
      submittedAt: record.submittedAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
