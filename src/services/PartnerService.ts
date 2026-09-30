import fs from 'fs';
import path from 'path';
import { IPartnerRepository } from '../repositories/IPartnerRepository';
import { IPartner } from '../types/partner.types';
import { CreatePartnerDto, UpdatePartnerDto } from '../types/partner.schemas';
import { NotFoundError } from '../errors/AppError';
import { PARTNER_UPLOAD_DIR } from '../config/uploads.config';

export class PartnerService {
  constructor(private readonly partnerRepository: IPartnerRepository) {}

  public async create(dto: CreatePartnerDto, logoUrl?: string): Promise<IPartner> {
    return this.partnerRepository.create({
      ...dto,
      isActive: dto.isActive ?? true,
      logoUrl,
    });
  }

  public async list(): Promise<IPartner[]> {
    return this.partnerRepository.findAll(false);
  }

  public async listAll(): Promise<IPartner[]> {
    return this.partnerRepository.findAll(true);
  }

  public async getById(id: string): Promise<IPartner> {
    const partner = await this.partnerRepository.findById(id);
    if (!partner || !partner.isActive) {
      throw new NotFoundError(`No partner found with id "${id}".`);
    }
    return partner;
  }

  public async listByCountry(country: string): Promise<IPartner[]> {
    return this.partnerRepository.findByCountry(country);
  }

  public async update(id: string, dto: UpdatePartnerDto, logoUrl?: string): Promise<IPartner> {
    const existing = await this.partnerRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`No partner found with id "${id}".`);
    }

    const partner = await this.partnerRepository.update(id, {
      ...dto,
      ...(logoUrl && { logoUrl }),
    });
    if (!partner) {
      throw new NotFoundError(`No partner found with id "${id}".`);
    }
    if (logoUrl && existing.logoUrl) {
      this.deleteLogoFile(existing.logoUrl);
    }
    return partner;
  }

  public async setActive(id: string, isActive: boolean): Promise<IPartner> {
    const partner = await this.partnerRepository.update(id, { isActive });
    if (!partner) {
      throw new NotFoundError(`No partner found with id "${id}".`);
    }
    return partner;
  }

  private deleteLogoFile(logoUrl: string): void {
    const filename = path.basename(logoUrl);
    const filePath = path.join(PARTNER_UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
