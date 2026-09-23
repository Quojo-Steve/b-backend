import { Request, Response, NextFunction } from 'express';
import { TrainingApplicationService } from '../services/TrainingApplicationService';
import { submitApplicationSchema, reviewApplicationSchema } from '../types/training.schemas';
import { parseOrThrow } from '../utils/validateRequest';
import { UnauthorizedError } from '../errors/AppError';

export class TrainingsController {
  constructor(private readonly applicationService: TrainingApplicationService) {}

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
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const applications = await this.applicationService.list();
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
}
