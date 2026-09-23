import { Request, Response, NextFunction } from 'express';
import { NewsletterService } from '../services/NewsletterService';
import { createNewsletterSchema, subscribeSchema, unsubscribeSchema } from '../types/newsletter.schemas';
import { parseOrThrow } from '../utils/validateRequest';
import { UnauthorizedError } from '../errors/AppError';

export class NewslettersController {
  constructor(private readonly newsletterService: NewsletterService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('An authentication token is required.');
      }
      const dto = parseOrThrow(createNewsletterSchema, req.body);
      const newsletter = await this.newsletterService.create(dto, req.user.sub);
      res.status(201).json({ status: 'success', data: { newsletter } });
    } catch (error) {
      next(error);
    }
  };

  public list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newsletters = await this.newsletterService.list();
      res.status(200).json({ status: 'success', data: { newsletters } });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newsletter = await this.newsletterService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: { newsletter } });
    } catch (error) {
      next(error);
    }
  };

  public send = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.newsletterService.send(req.params.id);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  public subscribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = parseOrThrow(subscribeSchema, req.body);
      const subscriber = await this.newsletterService.subscribe(dto);
      res.status(201).json({ status: 'success', data: { subscriber } });
    } catch (error) {
      next(error);
    }
  };

  public unsubscribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = parseOrThrow(unsubscribeSchema, req.body);
      await this.newsletterService.unsubscribe(dto);
      res.status(200).json({ status: 'success', data: null });
    } catch (error) {
      next(error);
    }
  };

  public listSubscribers = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const subscribers = await this.newsletterService.listSubscribers();
      res.status(200).json({ status: 'success', data: { subscribers } });
    } catch (error) {
      next(error);
    }
  };
}
