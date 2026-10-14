import { Request, Response, NextFunction } from 'express';
import { TrainingApplicationService } from '../services/TrainingApplicationService';
import { TrainingService } from '../services/TrainingService';
import {
  submitApplicationSchema,
  reviewApplicationSchema,
  listApplicationsQuerySchema,
  createTrainingSchema,
  updateTrainingSchema,
  updateTrainingStatusSchema,
  cohortInputSchema,
  updateCohortSchema,
} from '../types/training.schemas';
import { parseOrThrow } from '../utils/validateRequest';
import { UnauthorizedError } from '../errors/AppError';

export class TrainingsController {
  constructor(
    private readonly applicationService: TrainingApplicationService,
    private readonly trainingService: TrainingService,
  ) {}

  // ---- Registrations --------------------------------------------------------

  public submitApplication = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = parseOrThrow(submitApplicationSchema, req.body);
      const application = await this.applicationService.submit(dto);
      res.status(201).json({ status: 'success', data: { application } });
    } catch (error) {
      next(error);
    }
  };

  public listApplications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = parseOrThrow(listApplicationsQuerySchema, req.query);
      const applications = await this.applicationService.list(query);
      res.status(200).json({ status: 'success', data: { applications } });
    } catch (error) {
      next(error);
    }
  };

  public getApplication = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const application = await this.applicationService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: { application } });
    } catch (error) {
      next(error);
    }
  };

  public reviewApplication = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('An authentication token is required.');
      }
      const dto = parseOrThrow(reviewApplicationSchema, req.body);
      const application = await this.applicationService.review(req.params.id, req.user.sub, dto);
      res.status(200).json({ status: 'success', data: { application } });
    } catch (error) {
      next(error);
    }
  };

  // ---- Trainings & cohorts --------------------------------------------------

  public createTraining = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('An authentication token is required.');
      }
      const dto = parseOrThrow(createTrainingSchema, req.body);
      const training = await this.trainingService.create(dto, req.user.sub);
      res.status(201).json({ status: 'success', data: { training } });
    } catch (error) {
      next(error);
    }
  };

  public listPublishedTrainings = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const trainings = await this.trainingService.listPublished();
      res.status(200).json({ status: 'success', data: { trainings } });
    } catch (error) {
      next(error);
    }
  };

  public listAllTrainings = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const trainings = await this.trainingService.listAll();
      res.status(200).json({ status: 'success', data: { trainings } });
    } catch (error) {
      next(error);
    }
  };

  public getPublishedTraining = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const training = await this.trainingService.getPublishedById(req.params.id);
      res.status(200).json({ status: 'success', data: { training } });
    } catch (error) {
      next(error);
    }
  };

  public updateTraining = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = parseOrThrow(updateTrainingSchema, req.body);
      const training = await this.trainingService.update(req.params.id, dto);
      res.status(200).json({ status: 'success', data: { training } });
    } catch (error) {
      next(error);
    }
  };

  public updateTrainingStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { status } = parseOrThrow(updateTrainingStatusSchema, req.body);
      const training = await this.trainingService.setStatus(req.params.id, status);
      res.status(200).json({ status: 'success', data: { training } });
    } catch (error) {
      next(error);
    }
  };

  public addCohort = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = parseOrThrow(cohortInputSchema, req.body);
      const cohort = await this.trainingService.addCohort(req.params.id, dto);
      res.status(201).json({ status: 'success', data: { cohort } });
    } catch (error) {
      next(error);
    }
  };

  public updateCohort = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = parseOrThrow(updateCohortSchema, req.body);
      const cohort = await this.trainingService.updateCohort(req.params.cohortId, dto);
      res.status(200).json({ status: 'success', data: { cohort } });
    } catch (error) {
      next(error);
    }
  };
}
