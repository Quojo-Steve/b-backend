import { Request, Response, NextFunction } from 'express';
import { PartnerService } from '../services/PartnerService';
import {
  createPartnerSchema,
  updatePartnerSchema,
  updatePartnerStatusSchema,
} from '../types/partner.schemas';
import { parseOrThrow } from '../utils/validateRequest';
import { PARTNER_UPLOAD_URL_PREFIX } from '../config/uploads.config';

export class PartnersController {
  constructor(private readonly partnerService: PartnerService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = parseOrThrow(createPartnerSchema, req.body);
      const logoUrl = req.file ? `${PARTNER_UPLOAD_URL_PREFIX}/${req.file.filename}` : undefined;
      const partner = await this.partnerService.create(dto, logoUrl);
      res.status(201).json({ status: 'success', data: { partner } });
    } catch (error) {
      next(error);
    }
  };

  public list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const partners = await this.partnerService.list();
      res.status(200).json({ status: 'success', data: { partners } });
    } catch (error) {
      next(error);
    }
  };

  public listAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const partners = await this.partnerService.listAll();
      res.status(200).json({ status: 'success', data: { partners } });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const partner = await this.partnerService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: { partner } });
    } catch (error) {
      next(error);
    }
  };

  public byCountry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const partners = await this.partnerService.listByCountry(req.params.country);
      res.status(200).json({ status: 'success', data: { partners } });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = parseOrThrow(updatePartnerSchema, req.body);
      const logoUrl = req.file ? `${PARTNER_UPLOAD_URL_PREFIX}/${req.file.filename}` : undefined;
      const partner = await this.partnerService.update(req.params.id, dto, logoUrl);
      res.status(200).json({ status: 'success', data: { partner } });
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isActive } = parseOrThrow(updatePartnerStatusSchema, req.body);
      const partner = await this.partnerService.setActive(req.params.id, isActive);
      res.status(200).json({ status: 'success', data: { partner } });
    } catch (error) {
      next(error);
    }
  };
}
