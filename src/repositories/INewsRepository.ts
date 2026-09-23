import { INews } from '../types/news.types';

/**
 * Persistence contract for News. No delete method exists on purpose -
 * "removing" a news item is done via update() setting status to DISABLED,
 * so history is never lost. Defined as an interface, exactly like the
 * other modules, so NewsService works unchanged against either the
 * in-memory implementation or the Prisma/MySQL-backed one.
 */
export interface INewsRepository {
  create(data: Omit<INews, 'id' | 'createdAt' | 'updatedAt'>): Promise<INews>;
  findAll(includeDisabled: boolean): Promise<INews[]>;
  findById(id: string): Promise<INews | null>;
  update(id: string, updates: Partial<Omit<INews, 'id' | 'createdAt'>>): Promise<INews | null>;
}