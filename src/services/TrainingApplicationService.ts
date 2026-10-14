import { ITrainingApplicationRepository } from '../repositories/ITrainingApplicationRepository';
import { ITrainingRepository } from '../repositories/ITrainingRepository';
import {
  ApplicationStatus,
  ITrainingApplication,
  ITrainingApplicationView,
  TrainingStatus,
} from '../types/training.types';
import {
  SubmitApplicationDto,
  ReviewApplicationDto,
  ListApplicationsQuery,
} from '../types/training.schemas';
import { NotFoundError, ConflictError } from '../errors/AppError';
import { Logger } from '../utils/Logger';
import { IRegistrationNotifier } from './notifications/IRegistrationNotifier';

export class TrainingApplicationService {
  private readonly logger = new Logger(TrainingApplicationService.name);

  constructor(
    private readonly applicationRepository: ITrainingApplicationRepository,
    private readonly trainingRepository: ITrainingRepository,
    private readonly notifier: IRegistrationNotifier,
  ) {}

  /**
   * Registers a person for a cohort. Trainings are not hosted on this platform,
   * so this only records the registration for staff to view.
   */
  public async submit(dto: SubmitApplicationDto): Promise<ITrainingApplication> {
    const cohort = await this.trainingRepository.findCohortById(dto.cohortId);
    if (!cohort) {
      throw new NotFoundError(`No cohort found with id "${dto.cohortId}".`);
    }
    const training = await this.trainingRepository.findById(cohort.trainingId);
    if (!training || training.status !== TrainingStatus.PUBLISHED) {
      // Disabled trainings are hidden as if they don't exist.
      throw new NotFoundError(`No cohort found with id "${dto.cohortId}".`);
    }

    // Once a cohort's start time has passed, registration for it is closed.
    if (Date.now() >= new Date(cohort.startDate).getTime()) {
      throw new ConflictError('Registration is closed: this cohort has already started.');
    }

    const now = new Date().toISOString();
    const result = await this.applicationRepository.createInCohort(
      { ...dto, status: ApplicationStatus.SUBMITTED, submittedAt: now, updatedAt: now },
      { capacity: cohort.capacity, siblingCohortIds: training.cohorts.map((c) => c.id) },
    );

    if (result.outcome === 'duplicate') {
      throw new ConflictError('This email address is already registered for this training.');
    }
    if (result.outcome === 'cohort_full') {
      throw new ConflictError('This cohort is full.');
    }

    const { application } = result;
    this.logger.info('Training registration submitted', {
      applicationId: application.id,
      cohortId: cohort.id,
      country: application.country,
    });

    // Fire-and-forget: a mail problem must never fail a registration that was saved.
    this.notifier.notifyRegistered({ application, training, cohort }).catch((error) => {
      this.logger.warn('Registration confirmation email failed', {
        applicationId: application.id,
        message: error instanceof Error ? error.message : String(error),
      });
    });

    return application;
  }

  public async list(query: ListApplicationsQuery = {}): Promise<ITrainingApplicationView[]> {
    let cohortIds: string[] | undefined;

    if (query.trainingId) {
      const training = await this.trainingRepository.findById(query.trainingId);
      if (!training) {
        throw new NotFoundError(`No training found with id "${query.trainingId}".`);
      }
      cohortIds = training.cohorts.map((c) => c.id);
    }
    if (query.cohortId) {
      cohortIds = cohortIds ? cohortIds.filter((id) => id === query.cohortId) : [query.cohortId];
    }

    const applications = await this.applicationRepository.findAll(cohortIds ? { cohortIds } : {});
    return this.withLabels(applications);
  }

  public async getById(id: string): Promise<ITrainingApplicationView> {
    const application = await this.applicationRepository.findById(id);
    if (!application) {
      throw new NotFoundError(`No training application found with id "${id}".`);
    }
    return (await this.withLabels([application]))[0];
  }

  /**
   * Moves an application to a terminal state (approved/rejected).
   * Applications already in a terminal state cannot be re-reviewed here -
   * that would require a separate, audited "reopen" action.
   */
  public async review(
    id: string,
    reviewerId: string,
    dto: ReviewApplicationDto,
  ): Promise<ITrainingApplication> {
    const existing = await this.applicationRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`No training application found with id "${id}".`);
    }

    if (
      existing.status === ApplicationStatus.APPROVED ||
      existing.status === ApplicationStatus.REJECTED
    ) {
      throw new ConflictError(
        `Application "${id}" has already been ${existing.status} and cannot be reviewed again.`,
      );
    }

    const updated = await this.applicationRepository.update(id, {
      status: dto.status,
      reviewNotes: dto.reviewNotes,
      reviewedBy: reviewerId,
      updatedAt: new Date().toISOString(),
    });

    // update() only returns null if the record vanished between the lookup
    // and here; treat that as a not-found rather than silently succeeding.
    if (!updated) {
      throw new NotFoundError(`No training application found with id "${id}".`);
    }

    this.logger.info('Training application reviewed', {
      applicationId: id,
      status: dto.status,
      reviewerId,
    });

    return updated;
  }

  /** Adds cohort name + training title so the web manager can read the data without joins. */
  private async withLabels(
    applications: ITrainingApplication[],
  ): Promise<ITrainingApplicationView[]> {
    const trainings = await this.trainingRepository.findAll(true);
    const lookup = new Map<string, { cohortName: string; trainingId: string; trainingTitle: string }>();
    for (const training of trainings) {
      for (const cohort of training.cohorts) {
        lookup.set(cohort.id, {
          cohortName: cohort.name,
          trainingId: training.id,
          trainingTitle: training.title,
        });
      }
    }
    return applications.map((a) => ({
      ...a,
      ...(a.cohortId ? lookup.get(a.cohortId) : undefined),
    }));
  }
}
