import type { PrismaClient } from '@prisma/client';
import { IPartner } from '../types/partner.types';
import { IPartnerRepository } from './IPartnerRepository';

/** MySQL-backed implementation of IPartnerRepository, via Prisma. */
export class PrismaPartnerRepository implements IPartnerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findAll(): Promise<IPartner[]> {
    const records = await this.prisma.partner.findMany({ orderBy: { name: 'asc' } });
    return records.map((record) => this.toDomain(record));
  }

  public async findById(id: string): Promise<IPartner | null> {
    const record = await this.prisma.partner.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  public async findByCountry(country: string): Promise<IPartner[]> {
    // Note: unlike PostgreSQL, MySQL's Prisma connector does not support a
    // `mode: 'insensitive'` filter argument. This isn't a gap in practice:
    // MySQL's default string collation (utf8mb4_general_ci /
    // utf8mb4_0900_ai_ci) already compares case-insensitively, so a plain
    // `equals` filter behaves the same way here as the Postgres version did.
    const records = await this.prisma.partner.findMany({
      where: { country: { equals: country } },
    });
    return records.map((record) => this.toDomain(record));
  }

  private toDomain(record: {
    id: string;
    name: string;
    country: string;
    role: string;
    isTechnicalLead: boolean;
    websiteUrl: string | null;
  }): IPartner {
    return {
      id: record.id,
      name: record.name,
      country: record.country,
      role: record.role,
      isTechnicalLead: record.isTechnicalLead,
      websiteUrl: record.websiteUrl ?? undefined,
    };
  }
}
