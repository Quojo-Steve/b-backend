import { Request, Response, NextFunction } from 'express';
import { PressReleaseService } from '../services/PressReleaseService';
import { createPressReleaseSchema, updatePressReleaseSchema, updatePressReleaseStatusSchema } from '../types/pressRelease.schemas';
import { parseOrThrow } from '../utils/validateRequest';
import { UnauthorizedError } from '../errors/AppError';
import { PRESS_RELEASE_UPLOAD_URL_PREFIX } from '../config/uploads.config';

export class PressReleaseController {
  constructor(private readonly pressReleaseService: PressReleaseService) {}

  private static resolveDocumentUrl(req: Request): { url?: string; name?: string } {
    if (!req.file) {
      return {};
    }

    return {
      url: `${PRESS_RELEASE_UPLOAD_URL_PREFIX}/${req.file.filename}`,
      name: req.file.originalname,
    };
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('An authentication token is required.');
      }

      const dto = parseOrThrow(createPressReleaseSchema, req.body);
      const { url: documentUrl, name: documentName } = PressReleaseController.resolveDocumentUrl(req);
      const pressRelease = await this.pressReleaseService.create(
        dto,
        documentUrl,
        documentName,
        req.user.sub,
      );

      res.status(201).json({ status: 'success', data: { pressRelease } });
    } catch (error) {
      next(error);
    }
  };

  public listPublished = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pressReleases = await this.pressReleaseService.listPublished();
      res.status(200).json({ status: 'success', data: { pressReleases } });
    } catch (error) {
      next(error);
    }
  };

  public listAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pressReleases = await this.pressReleaseService.listAll();
      res.status(200).json({ status: 'success', data: { pressReleases } });
    } catch (error) {
      next(error);
    }
  };

  public getPublishedById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pressRelease = await this.pressReleaseService.getPublishedById(req.params.id);
      res.status(200).json({ status: 'success', data: { pressRelease } });
    } catch (error) {
      next(error);
    }
  };

  public getByIdForAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pressRelease = await this.pressReleaseService.getByIdForAdmin(req.params.id);
      res.status(200).json({ status: 'success', data: { pressRelease } });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = parseOrThrow(updatePressReleaseSchema, req.body);
      const { url: documentUrl, name: documentName } = PressReleaseController.resolveDocumentUrl(req);
      const pressRelease = await this.pressReleaseService.update(
        req.params.id,
        dto,
        documentUrl,
        documentName,
      );

      res.status(200).json({ status: 'success', data: { pressRelease } });
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = parseOrThrow(updatePressReleaseStatusSchema, req.body);
      const pressRelease = await this.pressReleaseService.setStatus(req.params.id, status);
      res.status(200).json({ status: 'success', data: { pressRelease } });
    } catch (error) {
      next(error);
    }
  };
}
