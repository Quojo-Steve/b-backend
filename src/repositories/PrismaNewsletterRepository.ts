import type { PrismaClient } from '@prisma/client';
import { INewsletter, INewsletterSubscriber } from '../types/newsletter.types';
import { INewsletterRepository } from './INewsletterRepository';

/**
 * MySQL-backed implementation of INewsletterRepository, via Prisma.
 * Same shape as PrismaTrainingApplicationRepository: translate Prisma's
 * `Date` fields into the ISO-string timestamps the rest of the app uses,
 * and never leak Prisma types outside this class.
 */
export class PrismaNewsletterRepository implements INewsletterRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(data: Omit<INewsletter, 'id'>): Promise<INewsletter> {
    const record = await this.prisma.newsletter.create({
      data: {
        title: data.title,
        bodyHtml: data.bodyHtml,
        createdBy: data.createdBy,
        sentAt: data.sentAt ? new Date(data.sentAt) : undefined,
      },
    });
    return this.toDomain(record);
  }

  public async findAll(): Promise<INewsletter[]> {
    const records = await this.prisma.newsletter.findMany({ orderBy: { createdAt: 'desc' } });
    return records.map((record) => this.toDomain(record));
  }

  public async findById(id: string): Promise<INewsletter | null> {
    const record = await this.prisma.newsletter.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  public async markSent(id: string, sentAt: string): Promise<INewsletter | null> {
    try {
      const record = await this.prisma.newsletter.update({
        where: { id },
        data: { sentAt: new Date(sentAt) },
      });
      return this.toDomain(record);
    } catch {
      // Prisma throws (P2025) when the record does not exist; the
      // interface contract is to return null in that case instead.
      return null;
    }
  }

  public async subscribe(email: string): Promise<INewsletterSubscriber> {
    const key = email.toLowerCase();
    // upsert reactivates a previously-unsubscribed address instead of
    // erroring on the unique email constraint, matching the in-memory
    // repository's "re-subscribe reactivates the same record" behaviour.
    const record = await this.prisma.newsletterSubscriber.upsert({
      where: { email: key },
      update: { isActive: true },
      create: { email: key, isActive: true },
    });
    return this.toSubscriberDomain(record);
  }

  public async findSubscriberByEmail(email: string): Promise<INewsletterSubscriber | null> {
    const record = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });
    return record ? this.toSubscriberDomain(record) : null;
  }

  public async listActiveSubscribers(): Promise<INewsletterSubscriber[]> {
    const records = await this.prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
    });
    return records.map((record) => this.toSubscriberDomain(record));
  }

  public async unsubscribe(email: string): Promise<void> {
    await this.prisma.newsletterSubscriber
      .update({
        where: { email: email.toLowerCase() },
        data: { isActive: false },
      })
      .catch(() => {
        // Unsubscribing an address that was never subscribed is a no-op,
        // matching the in-memory repository's behaviour.
      });
  }

  private toDomain(record: {
    id: string;
    title: string;
    bodyHtml: string;
    createdBy: string;
    sentAt: Date | null;
    createdAt: Date;
  }): INewsletter {
    return {
      id: record.id,
      title: record.title,
      bodyHtml: record.bodyHtml,
      createdBy: record.createdBy,
      sentAt: record.sentAt ? record.sentAt.toISOString() : undefined,
      createdAt: record.createdAt.toISOString(),
    };
  }

  private toSubscriberDomain(record: {
    id: string;
    email: string;
    subscribedAt: Date;
    isActive: boolean;
  }): INewsletterSubscriber {
    return {
      id: record.id,
      email: record.email,
      subscribedAt: record.subscribedAt.toISOString(),
      isActive: record.isActive,
    };
  }
}
