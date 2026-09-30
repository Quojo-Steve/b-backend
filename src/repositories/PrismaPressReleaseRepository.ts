import type { PrismaClient, PressReleaseStatus as PrismaPressReleaseStatus } from '@prisma/client';
import { IPressRelease, PressReleaseStatus } from '../types/pressRelease.types';
import { IPressReleaseRepository } from './IPressReleaseRepository';

export class PrismaPressReleaseRepository implements IPressReleaseRepository {
  private static readonly STATUS_TO_DOMAIN: Record<PrismaPressReleaseStatus, PressReleaseStatus> = {
    PUBLISHED: PressReleaseStatus.PUBLISHED,
    DISABLED: PressReleaseStatus.DISABLED,
  };

  private static readonly STATUS_TO_PRISMA: Record<PressReleaseStatus, PrismaPressReleaseStatus> = {
    [PressReleaseStatus.PUBLISHED]: 'PUBLISHED',
    [PressReleaseStatus.DISABLED]: 'DISABLED',
  };

  constructor(private readonly prisma: PrismaClient) {}

  public async create(data: Omit<IPressRelease, 'id' | 'createdAt' | 'updatedAt'>): Promise<IPressRelease> {
    const record = await this.prisma.pressRelease.create({
      data: {
        title: data.title,
        summary: data.summary ?? null,
        documentUrl: data.documentUrl ?? null,
        documentName: data.documentName ?? null,
        status: PrismaPressReleaseRepository.STATUS_TO_PRISMA[data.status],
        releaseDate: new Date(data.releaseDate),
        createdBy: data.createdBy,
      },
    });

    return this.toDomain(record);
  }

  public async findAll(includeDisabled: boolean): Promise<IPressRelease[]> {
    const records = await this.prisma.pressRelease.findMany({
      where: includeDisabled ? undefined : { status: 'PUBLISHED' },
      orderBy: { releaseDate: 'desc' },
    });

    return records.map((record) => this.toDomain(record));
  }

  public async findById(id: string): Promise<IPressRelease | null> {
    const record = await this.prisma.pressRelease.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  public async update(
    id: string,
    updates: Partial<Omit<IPressRelease, 'id' | 'createdAt'>>,
  ): Promise<IPressRelease | null> {
    try {
      const record = await this.prisma.pressRelease.update({
        where: { id },
        data: {
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.summary !== undefined && { summary: updates.summary ?? null }),
          ...(updates.documentUrl !== undefined && { documentUrl: updates.documentUrl ?? null }),
          ...(updates.documentName !== undefined && { documentName: updates.documentName ?? null }),
          ...(updates.status !== undefined && {
            status: PrismaPressReleaseRepository.STATUS_TO_PRISMA[updates.status],
          }),
          ...(updates.releaseDate !== undefined && {
            releaseDate: new Date(updates.releaseDate),
          }),
        },
      });

      return this.toDomain(record);
    } catch {
      return null;
    }
  }

  private toDomain(record: {
    id: string;
    title: string;
    summary: string | null;
    documentUrl: string | null;
    documentName: string | null;
    status: PrismaPressReleaseStatus;
    releaseDate: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }): IPressRelease {
    return {
      id: record.id,
      title: record.title,
      summary: record.summary ?? undefined,
      documentUrl: record.documentUrl ?? undefined,
      documentName: record.documentName ?? undefined,
      status: PrismaPressReleaseRepository.STATUS_TO_DOMAIN[record.status],
      releaseDate: record.releaseDate.toISOString(),
      createdBy: record.createdBy,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
