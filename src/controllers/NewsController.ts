import { Request, Response, NextFunction } from 'express';
import { NewsService } from '../services/NewsService';
import { createNewsSchema, updateNewsSchema, updateNewsStatusSchema } from '../types/news.schemas';
import { parseOrThrow } from '../utils/validateRequest';
import { UnauthorizedError } from '../errors/AppError';
import { NEWS_UPLOAD_URL_PREFIX } from '../config/uploads.config';

export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  /** Turns a multer file (if any) into the relative URL stored in the DB. */
  private static resolveImageUrl(req: Request): string | undefined {
    return req.file ? `${NEWS_UPLOAD_URL_PREFIX}/${req.file.filename}` : undefined;
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('An authentication token is required.');
      }
      const dto = parseOrThrow(createNewsSchema, req.body);
      const imageUrl = NewsController.resolveImageUrl(req);
      const news = await this.newsService.create(dto, imageUrl, req.user.sub);
      res.status(201).json({ status: 'success', data: { news } });
    } catch (error) {
      next(error);
    }
  };

  /** Public feed - published items only. */
  public listPublished = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const news = await this.newsService.listPublished();
      res.status(200).json({ status: 'success', data: { news } });
    } catch (error) {
      next(error);
    }
  };

  /** Admin dashboard - every item, including disabled ones. */
  public listAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const news = await this.newsService.listAll();
      res.status(200).json({ status: 'success', data: { news } });
    } catch (error) {
      next(error);
    }
  };

  public getPublishedById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const news = await this.newsService.getPublishedById(req.params.id);
      res.status(200).json({ status: 'success', data: { news } });
    } catch (error) {
      next(error);
    }
  };

  public getByIdForAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const news = await this.newsService.getByIdForAdmin(req.params.id);
      res.status(200).json({ status: 'success', data: { news } });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = parseOrThrow(updateNewsSchema, req.body);
      const imageUrl = NewsController.resolveImageUrl(req);
      const news = await this.newsService.update(req.params.id, dto, imageUrl);
      res.status(200).json({ status: 'success', data: { news } });
    } catch (error) {
      next(error);
    }
  };

  /** Replaces delete: PATCH /:id/status { status: "published" | "disabled" }. */
  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = parseOrThrow(updateNewsStatusSchema, req.body);
      const news = await this.newsService.setStatus(req.params.id, status);
      res.status(200).json({ status: 'success', data: { news } });
    } catch (error) {
      next(error);
    }
  };
}