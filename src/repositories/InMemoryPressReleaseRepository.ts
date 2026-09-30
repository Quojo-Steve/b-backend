import { randomUUID } from 'crypto';
import { IPressRelease, PressReleaseStatus } from '../types/pressRelease.types';
import { IPressReleaseRepository } from './IPressReleaseRepository';

export class InMemoryPressReleaseRepository implements IPressReleaseRepository {
  private readonly items: Map<string, IPressRelease> = new Map();

  public async create(data: Omit<IPressRelease, 'id' | 'createdAt' | 'updatedAt'>): Promise<IPressRelease> {
    const now = new Date().toISOString();
    const pressRelease: IPressRelease = {
      ...data,
      id: `press_release_${randomUUID().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(pressRelease.id, pressRelease);
    return pressRelease;
  }

  public async findAll(includeDisabled: boolean): Promise<IPressRelease[]> {
    return Array.from(this.items.values())
      .filter((item) => includeDisabled || item.status === PressReleaseStatus.PUBLISHED)
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
  }

  public async findById(id: string): Promise<IPressRelease | null> {
    return this.items.get(id) ?? null;
  }

  public async update(
    id: string,
    updates: Partial<Omit<IPressRelease, 'id' | 'createdAt'>>,
  ): Promise<IPressRelease | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }

    const updated: IPressRelease = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.items.set(id, updated);
    return updated;
  }
}
