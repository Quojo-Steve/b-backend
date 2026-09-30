import { IPartner } from '../types/partner.types';

export interface IPartnerRepository {
  create(data: Omit<IPartner, 'id'>): Promise<IPartner>;
  findAll(includeDisabled: boolean): Promise<IPartner[]>;
  findById(id: string): Promise<IPartner | null>;
  findByCountry(country: string): Promise<IPartner[]>;
  update(id: string, updates: Partial<Omit<IPartner, 'id'>>): Promise<IPartner | null>;
}
