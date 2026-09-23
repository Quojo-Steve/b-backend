import { ITrainingApplicationRepository } from '../repositories/ITrainingApplicationRepository';
import { ApplicationStatus, ITrainingApplication } from '../types/training.types';
import { SubmitApplicationDto, ReviewApplicationDto } from '../types/training.schemas';
import { NotFoundError, ConflictError } from '../errors/AppError';
import { Logger } from '../utils/Logger';

export class TrainingApplicationService {
  private readonly logger = new Logger(TrainingApplicationService.name);

  constructor(private readonly applicationRepository: ITrainingApplicationRepository) {}

  public async submit(dto: SubmitApplicationDto): Promise<ITrainingApplication> {
    const now = new Date().toISOString();

    const application = await this.applicationRepository.create({
      ...dto,
      status: ApplicationStatus.SUBMITTED,
      submittedAt: now,
      updatedAt: now,
    });

    this.logger.info('Training application submitted', {
      applicationId: application.id,
      country: application.country,
    });

    return application;
  }

  public async list(): Promise<ITrainingApplication[]> {
    return this.applicationRepository.findAll();
  }

  public async getById(id: string): Promise<ITrainingApplication> {
    const application = await this.applicationRepository.findById(id);
    if (!application) {
      throw new NotFoundError(`No training application found with id "${id}".`);
    }
    return application;
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
    const existing = await this.getById(id);

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

    // update() only returns null if the record vanished between getById()
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
}
