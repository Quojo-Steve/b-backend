import { randomUUID } from 'crypto';
import { INews } from '../types/news.types';
import { INewsRepository } from './INewsRepository';

export class InMemoryNewsRepository implements INewsRepository {
  private readonly items: Map<string, INews> = new Map();

  public async create(data: Omit<INews, 'id' | 'createdAt' | 'updatedAt'>): Promise<INews> {
    const now = new Date().toISOString();
    const news: INews = {
      ...data,
      id: `news_${randomUUID().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(news.id, news);
    return news;
  }

  public async findAll(includeDisabled: boolean): Promise<INews[]> {
    return Array.from(this.items.values())
      .filter((item) => includeDisabled || item.status === 'published')
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  }

  public async findById(id: string): Promise<INews | null> {
    return this.items.get(id) ?? null;
  }

  public async update(
    id: string,
    updates: Partial<Omit<INews, 'id' | 'createdAt'>>,
  ): Promise<INews | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }
    const updated: INews = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.items.set(id, updated);
    return updated;
  }
}