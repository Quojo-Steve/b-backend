import { Request, Response, NextFunction } from 'express';
import { PartnerService } from '../services/PartnerService';

export class PartnersController {
  constructor(private readonly partnerService: PartnerService) {}

  public list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const partners = await this.partnerService.list();
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
}
