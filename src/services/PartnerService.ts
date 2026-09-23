import { IPartnerRepository } from '../repositories/IPartnerRepository';
import { IPartner } from '../types/partner.types';
import { NotFoundError } from '../errors/AppError';

export class PartnerService {
  constructor(private readonly partnerRepository: IPartnerRepository) {}

  public async list(): Promise<IPartner[]> {
    return this.partnerRepository.findAll();
  }

  public async getById(id: string): Promise<IPartner> {
    const partner = await this.partnerRepository.findById(id);
    if (!partner) {
      throw new NotFoundError(`No partner found with id "${id}".`);
    }
    return partner;
  }

  public async listByCountry(country: string): Promise<IPartner[]> {
    return this.partnerRepository.findByCountry(country);
  }
}
