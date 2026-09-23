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
      role: 'Consortium lead and funding recipient; overall content responsibility',
      isTechnicalLead: false,
    },
    {
      id: 'oeko-institut',
      name: 'Oeko-Institut e.V.',
      country: 'Germany',
      role: 'Technical and scientific leadership; quality control',
      isTechnicalLead: true,
    },
    {
      id: 'pan-ethiopia',
      name: 'PAN Ethiopia',
      country: 'Ethiopia',
      role: 'Country partner - country support and reporting',
      isTechnicalLead: false,
    },
    {
      id: 'sradev-nigeria',
      name: 'SRADev Nigeria',
      country: 'Nigeria',
      role: 'Country partner - country support and reporting',
      isTechnicalLead: false,
    },
    {
      id: 'mri-ghana',
      name: 'MRI Ghana',
      country: 'Ghana',
      role: 'Country partner - country support and reporting',
      isTechnicalLead: false,
    },
    {
      id: 'crepd-cameroon',
      name: 'CREPD Cameroon',
      country: 'Cameroon',
      role: 'Country partner; French-language editorial advisor',
      isTechnicalLead: false,
    },
    {
      id: 'areco-rwanda',
      name: 'ARECO Rwanda',
      country: 'Rwanda',
      role: 'Country partner; French-language editorial advisor',
      isTechnicalLead: false,
    },
    {
      id: 'cure-malawi',
      name: 'CURE Malawi',
      country: 'Malawi',
      role: 'Country partner - country support and reporting',
      isTechnicalLead: false,
    },
  ];

  public async findAll(): Promise<IPartner[]> {
    return this.partners;
  }

  public async findById(id: string): Promise<IPartner | null> {
    return this.partners.find((p) => p.id === id) ?? null;
  }

  public async findByCountry(country: string): Promise<IPartner[]> {
    return this.partners.filter((p) => p.country.toLowerCase() === country.toLowerCase());
  }
}
