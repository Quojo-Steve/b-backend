import { INewsletter, INewsletterSubscriber } from '../types/newsletter.types';

/**
 * Persistence contract for newsletters and their subscribers. Defined as
 * an interface, exactly like IPartnerRepository / ITrainingApplicationRepository,
 * so NewsletterService works unchanged against either the in-memory
 * implementation or the Prisma/MySQL-backed one.
 */
export interface INewsletterRepository {
  create(data: Omit<INewsletter, 'id'>): Promise<INewsletter>;
  findAll(): Promise<INewsletter[]>;
  findById(id: string): Promise<INewsletter | null>;
  markSent(id: string, sentAt: string): Promise<INewsletter | null>;

  subscribe(email: string): Promise<INewsletterSubscriber>;
  findSubscriberByEmail(email: string): Promise<INewsletterSubscriber | null>;
  listActiveSubscribers(): Promise<INewsletterSubscriber[]>;
  unsubscribe(email: string): Promise<void>;
}
