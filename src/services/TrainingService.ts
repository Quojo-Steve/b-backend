import {
  ITrainingRepository,
  NewCohort,
  TrainingUpdates,
} from '../repositories/ITrainingRepository';
import { ITrainingApplicationRepository } from '../repositories/ITrainingApplicationRepository';
import {
  ICohort,
  ICohortView,
  ITraining,
  ITrainingView,
  TrainingStatus,
} from '../types/training.types';
import {
  CohortInputDto,
  CreateTrainingDto,
  UpdateCohortDto,
  UpdateTrainingDto,
} from '../types/training.schemas';
import { ConflictError, NotFoundError, ValidationError } from '../errors/AppError';
import { Logger } from '../utils/Logger';

const ts = (value: string): number => new Date(value).getTime();

export class TrainingService {
  private readonly logger = new Logger(TrainingService.name);

  constructor(
    private readonly trainingRepository: ITrainingRepository,
    private readonly applicationRepository: ITrainingApplicationRepository,
  ) {}

  public async create(dto: CreateTrainingDto, createdBy: string): Promise<ITrainingView> {
    const startDate = dto.startDate.toISOString();
    const endDate = dto.endDate.toISOString();

    const cohorts: NewCohort[] = dto.cohorts.map((c) => ({
      name: c.name,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      capacity: c.capacity,
    }));

    this.assertUniqueNames(cohorts.map((c) => c.name));
    cohorts.forEach((c) =>
      this.assertWithinTraining(c.name, c.startDate, c.endDate, startDate, endDate),
    );

    const training = await this.trainingRepository.create(
      {
        title: dto.title,
        description: dto.description,
        startDate,
        endDate,
        status: TrainingStatus.PUBLISHED,
        createdBy,
      },
      cohorts,
    );

    this.logger.info('Training created', {
      trainingId: training.id,
      cohorts: cohorts.length,
      createdBy,
    });
    return this.toView(training);
  }

  /** Public list - published trainings only, with cohort availability. */
  public async listPublished(): Promise<ITrainingView[]> {
    return this.toViews(await this.trainingRepository.findAll(false));
  }

  /** Admin list - every training regardless of status. */
  public async listAll(): Promise<ITrainingView[]> {
    return this.toViews(await this.trainingRepository.findAll(true));
  }

  public async getPublishedById(id: string): Promise<ITrainingView> {
    const training = await this.trainingRepository.findById(id);
    if (!training || training.status !== TrainingStatus.PUBLISHED) {
      throw new NotFoundError(`No training found with id "${id}".`);
    }
    return this.toView(training);
  }

  public async update(id: string, dto: UpdateTrainingDto): Promise<ITrainingView> {
    const existing = await this.getRecord(id);
    const startDate = dto.startDate?.toISOString() ?? existing.startDate;
    const endDate = dto.endDate?.toISOString() ?? existing.endDate;

    if (ts(startDate) >= ts(endDate)) {
      throw new ValidationError('Training end date must be after its start date.');
    }
    // Moving the training window must not leave any cohort sticking out of it.
    existing.cohorts.forEach((c) =>
      this.assertWithinTraining(c.name, c.startDate, c.endDate, startDate, endDate),
    );

    const updates: TrainingUpdates = { startDate, endDate };
    if (dto.title !== undefined) {
      updates.title = dto.title;
    }
    if (dto.description !== undefined) {
      updates.description = dto.description;
    }

    const updated = await this.trainingRepository.update(id, updates);
    if (!updated) {
      throw new NotFoundError(`No training found with id "${id}".`);
    }
    this.logger.info('Training updated', { trainingId: id });
    return this.toView(updated);
  }

  /** Replaces delete: disabled trainings are hidden and cannot be registered for. */
  public async setStatus(id: string, status: TrainingStatus): Promise<ITrainingView> {
    const updated = await this.trainingRepository.update(id, { status });
    if (!updated) {
      throw new NotFoundError(`No training found with id "${id}".`);
    }
    this.logger.info('Training status changed', { trainingId: id, status });
    return this.toView(updated);
  }

  public async addCohort(trainingId: string, dto: CohortInputDto): Promise<ICohortView> {
    const training = await this.getRecord(trainingId);
    const cohort: NewCohort = {
      name: dto.name,
      startDate: dto.startDate.toISOString(),
      endDate: dto.endDate.toISOString(),
      capacity: dto.capacity,
    };

    this.assertWithinTraining(
      cohort.name,
      cohort.startDate,
      cohort.endDate,
      training.startDate,
      training.endDate,
    );
    this.assertUniqueNames([...training.cohorts.map((c) => c.name), cohort.name]);

    const created = await this.trainingRepository.addCohort(trainingId, cohort);
    this.logger.info('Cohort added', { trainingId, cohortId: created.id });
    return this.toCohortView(created, training.status, 0);
  }

  public async updateCohort(cohortId: string, dto: UpdateCohortDto): Promise<ICohortView> {
    const cohort = await this.trainingRepository.findCohortById(cohortId);
    if (!cohort) {
      throw new NotFoundError(`No cohort found with id "${cohortId}".`);
    }
    const training = await this.getRecord(cohort.trainingId);

    const name = dto.name ?? cohort.name;
    const startDate = dto.startDate?.toISOString() ?? cohort.startDate;
    const endDate = dto.endDate?.toISOString() ?? cohort.endDate;
    const capacity = dto.capacity ?? cohort.capacity;

    if (ts(startDate) >= ts(endDate)) {
      throw new ValidationError('Cohort end date must be after its start date.');
    }
    this.assertWithinTraining(name, startDate, endDate, training.startDate, training.endDate);
    this.assertUniqueNames([
      ...training.cohorts.filter((c) => c.id !== cohortId).map((c) => c.name),
      name,
    ]);

    const counts = await this.applicationRepository.countActiveByCohorts([cohortId]);
    const registered = counts[cohortId] ?? 0;
    if (capacity < registered) {
      throw new ConflictError(
        `The application limit cannot be ${capacity}: ${registered} people have already registered for this cohort.`,
      );
    }

    const updated = await this.trainingRepository.updateCohort(cohortId, {
      name,
      startDate,
      endDate,
      capacity,
    });
    if (!updated) {
      throw new NotFoundError(`No cohort found with id "${cohortId}".`);
    }
    this.logger.info('Cohort updated', { cohortId });
    return this.toCohortView(updated, training.status, registered);
  }

  // ---------------------------------------------------------------------------

  private async getRecord(id: string): Promise<ITraining> {
    const training = await this.trainingRepository.findById(id);
    if (!training) {
      throw new NotFoundError(`No training found with id "${id}".`);
    }
    return training;
  }

  /** A cohort may never start before, or end after, its training. */
  private assertWithinTraining(
    cohortName: string,
    cohortStart: string,
    cohortEnd: string,
    trainingStart: string,
    trainingEnd: string,
  ): void {
    if (ts(cohortStart) < ts(trainingStart) || ts(cohortEnd) > ts(trainingEnd)) {
      throw new ValidationError(
        `Cohort "${cohortName}" must fall within the training dates (${trainingStart} to ${trainingEnd}).`,
      );
    }
  }

  private assertUniqueNames(names: string[]): void {
    const unique = new Set(names.map((n) => n.trim().toLowerCase()));
    if (unique.size !== names.length) {
      throw new ConflictError('Cohort names must be unique within a training.');
    }
  }

  private toCohortView(
    cohort: ICohort,
    trainingStatus: TrainingStatus,
    registeredCount: number,
  ): ICohortView {
    const spotsLeft = Math.max(cohort.capacity - registeredCount, 0);
    return {
      ...cohort,
      registeredCount,
      spotsLeft,
      registrationOpen:
        trainingStatus === TrainingStatus.PUBLISHED &&
        spotsLeft > 0 &&
        Date.now() < ts(cohort.startDate),
    };
  }

  private async toViews(trainings: ITraining[]): Promise<ITrainingView[]> {
    const cohortIds = trainings.flatMap((t) => t.cohorts.map((c) => c.id));
    const counts = await this.applicationRepository.countActiveByCohorts(cohortIds);
    return trainings.map((t) => ({
      ...t,
      cohortCount: t.cohorts.length,
      cohorts: t.cohorts.map((c) => this.toCohortView(c, t.status, counts[c.id] ?? 0)),
    }));
  }

  private async toView(training: ITraining): Promise<ITrainingView> {
    return (await this.toViews([training]))[0];
  }
}
