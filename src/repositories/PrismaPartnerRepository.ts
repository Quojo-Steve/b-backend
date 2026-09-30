import type { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { IPartner } from '../types/partner.types';
import { IPartnerRepository } from './IPartnerRepository';

/** MySQL-backed implementation of IPartnerRepository, via Prisma. */
export class PrismaPartnerRepository implements IPartnerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(data: Omit<IPartner, 'id'>): Promise<IPartner> {
    const record = await this.prisma.partner.create({
      data: { ...data, id: `partner_${randomUUID().slice(0, 8)}` },
    });
    return this.toDomain(record);
  }

  public async findAll(includeDisabled: boolean): Promise<IPartner[]> {
    const records = await this.prisma.partner.findMany({
      where: includeDisabled ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
    });
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
      where: { country: { equals: country }, isActive: true },
    });
    return records.map((record) => this.toDomain(record));
  }

  public async update(
    id: string,
    updates: Partial<Omit<IPartner, 'id'>>,
  ): Promise<IPartner | null> {
    try {
      const record = await this.prisma.partner.update({ where: { id }, data: updates });
      return this.toDomain(record);
    } catch {
      return null;
    }
  }

  private toDomain(record: {
    id: string;
    name: string;
    country: string;
    about: string;
    description: string;
    websiteUrl: string | null;
    logoUrl: string | null;
    isActive: boolean;
  }): IPartner {
    return {
      id: record.id,
      name: record.name,
      country: record.country,
      about: record.about,
      description: record.description,
      websiteUrl: record.websiteUrl ?? undefined,
      logoUrl: record.logoUrl ?? undefined,
      isActive: record.isActive,
    };
  }
}
