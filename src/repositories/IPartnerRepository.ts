import { IPartner } from '../types/partner.types';

export interface IPartnerRepository {
  findAll(): Promise<IPartner[]>;
  findById(id: string): Promise<IPartner | null>;
  findByCountry(country: string): Promise<IPartner[]>;
}
