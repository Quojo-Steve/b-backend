import type {
  Cohort as CohortRecord,
  Training as TrainingRecord,
  PrismaClient,
  TrainingStatus as PrismaTrainingStatus,
} from '@prisma/client';
import { ICohort, ITraining, TrainingStatus } from '../types/training.types';
import { ITrainingRepository, NewCohort, NewTraining, TrainingUpdates } from './ITrainingRepository';

type TrainingWithCohorts = TrainingRecord & { cohorts: CohortRecord[] };

const INCLUDE_COHORTS = { cohorts: { orderBy: { startDate: 'asc' as const } } };

/** MySQL-backed implementation of ITrainingRepository, via Prisma. */
export class PrismaTrainingRepository implements ITrainingRepository {
  private static readonly STATUS_TO_DOMAIN: Record<PrismaTrainingStatus, TrainingStatus> = {
    PUBLISHED: TrainingStatus.PUBLISHED,
    DISABLED: TrainingStatus.DISABLED,
  };

  private static readonly STATUS_TO_PRISMA: Record<TrainingStatus, PrismaTrainingStatus> = {
    [TrainingStatus.PUBLISHED]: 'PUBLISHED',
    [TrainingStatus.DISABLED]: 'DISABLED',
  };

  constructor(private readonly prisma: PrismaClient) {}

  public async create(data: NewTraining, cohorts: NewCohort[]): Promise<ITraining> {
    // Nested create: the training and all its cohorts are written atomically.
    const record = await this.prisma.training.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: PrismaTrainingRepository.STATUS_TO_PRISMA[data.status],
        createdBy: data.createdBy,
        cohorts: {
          create: cohorts.map((c) => ({
            name: c.name,
            startDate: new Date(c.startDate),
            endDate: new Date(c.endDate),
            capacity: c.capacity,
          })),
        },
      },
      include: INCLUDE_COHORTS,
    });
    return this.toDomain(record);
  }

  public async findAll(includeDisabled: boolean): Promise<ITraining[]> {
    const records = await this.prisma.training.findMany({
      where: includeDisabled ? undefined : { status: 'PUBLISHED' },
      orderBy: { startDate: 'desc' },
      include: INCLUDE_COHORTS,
    });
    return records.map((record) => this.toDomain(record));
  }

  public async findById(id: string): Promise<ITraining | null> {
    const record = await this.prisma.training.findUnique({ where: { id }, include: INCLUDE_COHORTS });
    return record ? this.toDomain(record) : null;
  }

  public async update(id: string, updates: TrainingUpdates): Promise<ITraining | null> {
    try {
      const record = await this.prisma.training.update({
        where: { id },
        data: {
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.startDate !== undefined && { startDate: new Date(updates.startDate) }),
          ...(updates.endDate !== undefined && { endDate: new Date(updates.endDate) }),
          ...(updates.status !== undefined && {
            status: PrismaTrainingRepository.STATUS_TO_PRISMA[updates.status],
          }),
        },
        include: INCLUDE_COHORTS,
      });
      return this.toDomain(record);
    } catch {
      // Prisma throws (P2025) when the record does not exist.
      return null;
    }
  }

  public async addCohort(trainingId: string, data: NewCohort): Promise<ICohort> {
    const record = await this.prisma.cohort.create({
      data: {
        trainingId,
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        capacity: data.capacity,
      },
    });
    return this.cohortToDomain(record);
  }

  public async findCohortById(id: string): Promise<ICohort | null> {
    const record = await this.prisma.cohort.findUnique({ where: { id } });
    return record ? this.cohortToDomain(record) : null;
  }

  public async updateCohort(id: string, updates: Partial<NewCohort>): Promise<ICohort | null> {
    try {
      const record = await this.prisma.cohort.update({
        where: { id },
        data: {
          ...(updates.name !== undefined && { name: updates.name }),
          ...(updates.startDate !== undefined && { startDate: new Date(updates.startDate) }),
          ...(updates.endDate !== undefined && { endDate: new Date(updates.endDate) }),
          ...(updates.capacity !== undefined && { capacity: updates.capacity }),
        },
      });
      return this.cohortToDomain(record);
    } catch {
      return null;
    }
  }

  private cohortToDomain(record: CohortRecord): ICohort {
    return {
      id: record.id,
      trainingId: record.trainingId,
      name: record.name,
      startDate: record.startDate.toISOString(),
      endDate: record.endDate.toISOString(),
      capacity: record.capacity,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  private toDomain(record: TrainingWithCohorts): ITraining {
    return {
      id: record.id,
      title: record.title,
      description: record.description ?? undefined,
      startDate: record.startDate.toISOString(),
      endDate: record.endDate.toISOString(),
      status: PrismaTrainingRepository.STATUS_TO_DOMAIN[record.status],
      createdBy: record.createdBy,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      cohorts: record.cohorts.map((cohort) => this.cohortToDomain(cohort)),
    };
  }
}
