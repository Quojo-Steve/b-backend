import { IPressRelease } from '../types/pressRelease.types';

export interface IPressReleaseRepository {
  create(data: Omit<IPressRelease, 'id' | 'createdAt' | 'updatedAt'>): Promise<IPressRelease>;
  findAll(includeDisabled: boolean): Promise<IPressRelease[]>;
  findById(id: string): Promise<IPressRelease | null>;
  update(id: string, updates: Partial<Omit<IPressRelease, 'id' | 'createdAt'>>): Promise<IPressRelease | null>;
}
