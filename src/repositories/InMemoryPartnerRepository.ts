import { randomUUID } from 'crypto';
import { IPartner } from '../types/partner.types';
import { IPartnerRepository } from './IPartnerRepository';

/**
 * Seeded from the "About: Partners" section of the BRACE website concept.
 * Replace with a database-backed implementation once partner profiles move
 * into the CMS/content-management layer.
 */
export class InMemoryPartnerRepository implements IPartnerRepository {
  private readonly partners: IPartner[] = [
    {
      id: 'agenda-tanzania',
      name: 'AGENDA Tanzania',
      country: 'Tanzania',
      about: 'Consortium lead',
      description: 'Consortium lead and funding recipient; overall content responsibility',
      isActive: true,
    },
    {
      id: 'oeko-institut',
      name: 'Oeko-Institut e.V.',
      country: 'Germany',
      about: 'Technical and scientific leadership',
      description: 'Technical and scientific leadership; quality control',
      isActive: true,
    },
    {
      id: 'pan-ethiopia',
      name: 'PAN Ethiopia',
      country: 'Ethiopia',
      about: 'Country partner',
      description: 'Country partner - country support and reporting',
      isActive: true,
    },
    {
      id: 'sradev-nigeria',
      name: 'SRADev Nigeria',
      country: 'Nigeria',
      about: 'Country partner',
      description: 'Country partner - country support and reporting',
      isActive: true,
    },
    {
      id: 'mri-ghana',
      name: 'MRI Ghana',
      country: 'Ghana',
      about: 'Country partner',
      description: 'Country partner - country support and reporting',
      isActive: true,
    },
    {
      id: 'crepd-cameroon',
      name: 'CREPD Cameroon',
      country: 'Cameroon',
      about: 'Country partner',
      description: 'Country partner; French-language editorial advisor',
      isActive: true,
    },
    {
      id: 'areco-rwanda',
      name: 'ARECO Rwanda',
      country: 'Rwanda',
      about: 'Country partner',
      description: 'Country partner; French-language editorial advisor',
      isActive: true,
    },
    {
      id: 'cure-malawi',
      name: 'CURE Malawi',
      country: 'Malawi',
      about: 'Country partner',
      description: 'Country partner - country support and reporting',
      isActive: true,
    },
  ];

  public async create(data: Omit<IPartner, 'id'>): Promise<IPartner> {
    const partner = { ...data, id: `partner_${randomUUID().slice(0, 8)}` };
    this.partners.push(partner);
    return partner;
  }

  public async findAll(includeDisabled: boolean): Promise<IPartner[]> {
    return this.partners.filter((partner) => includeDisabled || partner.isActive);
  }

  public async findById(id: string): Promise<IPartner | null> {
    return this.partners.find((p) => p.id === id) ?? null;
  }

  public async findByCountry(country: string): Promise<IPartner[]> {
    return this.partners.filter(
      (partner) => partner.isActive && partner.country.toLowerCase() === country.toLowerCase(),
    );
  }

  public async update(
    id: string,
    updates: Partial<Omit<IPartner, 'id'>>,
  ): Promise<IPartner | null> {
    const index = this.partners.findIndex((partner) => partner.id === id);
    if (index === -1) {
      return null;
    }
    this.partners[index] = { ...this.partners[index], ...updates };
    return this.partners[index];
  }
}
