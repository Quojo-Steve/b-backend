import { randomUUID } from 'crypto';
import { INewsletter, INewsletterSubscriber } from '../types/newsletter.types';
import { INewsletterRepository } from './INewsletterRepository';

export class InMemoryNewsletterRepository implements INewsletterRepository {
  private readonly newsletters: Map<string, INewsletter> = new Map();
  private readonly subscribers: Map<string, INewsletterSubscriber> = new Map(); // keyed by lowercase email

  public async create(data: Omit<INewsletter, 'id'>): Promise<INewsletter> {
    const newsletter: INewsletter = {
      ...data,
      id: `nl_${randomUUID().slice(0, 8)}`,
    };
    this.newsletters.set(newsletter.id, newsletter);
    return newsletter;
  }

  public async findAll(): Promise<INewsletter[]> {
    return Array.from(this.newsletters.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  public async findById(id: string): Promise<INewsletter | null> {
    return this.newsletters.get(id) ?? null;
  }

  public async markSent(id: string, sentAt: string): Promise<INewsletter | null> {
    const existing = this.newsletters.get(id);
    if (!existing) {
      return null;
    }
    const updated: INewsletter = { ...existing, sentAt };
    this.newsletters.set(id, updated);
    return updated;
  }

  public async subscribe(email: string): Promise<INewsletterSubscriber> {
    const key = email.toLowerCase();
    const existing = this.subscribers.get(key);

    if (existing) {
      // Re-subscribing after a previous unsubscribe reactivates the same record
      // instead of creating a duplicate.
      const reactivated: INewsletterSubscriber = { ...existing, isActive: true };
      this.subscribers.set(key, reactivated);
      return reactivated;
    }

    const subscriber: INewsletterSubscriber = {
      id: `sub_${randomUUID().slice(0, 8)}`,
      email: key,
      subscribedAt: new Date().toISOString(),
      isActive: true,
    };
    this.subscribers.set(key, subscriber);
    return subscriber;
  }

  public async findSubscriberByEmail(email: string): Promise<INewsletterSubscriber | null> {
    return this.subscribers.get(email.toLowerCase()) ?? null;
  }

  public async listActiveSubscribers(): Promise<INewsletterSubscriber[]> {
    return Array.from(this.subscribers.values()).filter((subscriber) => subscriber.isActive);
  }

  public async unsubscribe(email: string): Promise<void> {
    const key = email.toLowerCase();
    const existing = this.subscribers.get(key);
    if (existing) {
      this.subscribers.set(key, { ...existing, isActive: false });
    }
  }
}
