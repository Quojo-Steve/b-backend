import type { PrismaClient, NewsStatus as PrismaNewsStatus } from '@prisma/client';
import { INews, NewsStatus } from '../types/news.types';
import { INewsRepository } from './INewsRepository';

/**
 * MySQL-backed implementation of INewsRepository, via Prisma. Same shape
 * as the other Prisma*Repository classes: translate Prisma's SCREAMING_CASE
 * generated enum and `Date` fields into this app's own lowercase domain
 * enum and ISO-string timestamps, so that translation never leaks into
 * NewsService or the controller.
 */
export class PrismaNewsRepository implements INewsRepository {
  private static readonly STATUS_TO_DOMAIN: Record<PrismaNewsStatus, NewsStatus> = {
    PUBLISHED: NewsStatus.PUBLISHED,
    DISABLED: NewsStatus.DISABLED,
  };

  private static readonly STATUS_TO_PRISMA: Record<NewsStatus, PrismaNewsStatus> = {
    [NewsStatus.PUBLISHED]: 'PUBLISHED',
    [NewsStatus.DISABLED]: 'DISABLED',
  };

  constructor(private readonly prisma: PrismaClient) {}

  public async create(data: Omit<INews, 'id' | 'createdAt' | 'updatedAt'>): Promise<INews> {
    const record = await this.prisma.news.create({
      data: {
        title: data.title,
        tag: data.tag,
        pillar: data.pillar,
        note: data.note,
        body: data.body,
        imageUrl: data.imageUrl,
        status: PrismaNewsRepository.STATUS_TO_PRISMA[data.status],
        publishedDate: new Date(data.publishedDate),
        createdBy: data.createdBy,
      },
    });
    return this.toDomain(record);
  }

  public async findAll(includeDisabled: boolean): Promise<INews[]> {
    const records = await this.prisma.news.findMany({
      where: includeDisabled ? undefined : { status: 'PUBLISHED' },
      orderBy: { publishedDate: 'desc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  public async findById(id: string): Promise<INews | null> {
    const record = await this.prisma.news.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  public async update(
    id: string,
    updates: Partial<Omit<INews, 'id' | 'createdAt'>>,
  ): Promise<INews | null> {
    try {
      const record = await this.prisma.news.update({
        where: { id },
        data: {
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.tag !== undefined && { tag: updates.tag }),
          ...(updates.pillar !== undefined && { pillar: updates.pillar }),
          ...(updates.note !== undefined && { note: updates.note }),
          ...(updates.body !== undefined && { body: updates.body }),
          ...(updates.imageUrl !== undefined && { imageUrl: updates.imageUrl }),
          ...(updates.status !== undefined && {
            status: PrismaNewsRepository.STATUS_TO_PRISMA[updates.status],
          }),
          ...(updates.publishedDate !== undefined && {
            publishedDate: new Date(updates.publishedDate),
          }),
        },
      });
      return this.toDomain(record);
    } catch {
      // Prisma throws (P2025) when the record does not exist; the
      // interface contract is to return null in that case instead.
      return null;
    }
  }

  private toDomain(record: {
    id: string;
    title: string;
    tag: string;
    pillar: string;
    note: string;
    body: string | null;
    imageUrl: string | null;
    status: PrismaNewsStatus;
    publishedDate: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }): INews {
    return {
      id: record.id,
      title: record.title,
      tag: record.tag,
      pillar: record.pillar,
      note: record.note,
      body: record.body ?? undefined,
      imageUrl: record.imageUrl ?? undefined,
      status: PrismaNewsRepository.STATUS_TO_DOMAIN[record.status],
      publishedDate: record.publishedDate.toISOString(),
      createdBy: record.createdBy,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}