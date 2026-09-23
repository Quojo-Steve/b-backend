import { IUser } from '../types/user.types';

/**
 * Defines the contract any user persistence layer must satisfy.
 * AuthService depends only on this interface, so the in-memory
 * implementation below can later be replaced with, e.g., a
 * PostgreSQL/Prisma or MySQL/Prisma repository with no changes to AuthService.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  create(user: Omit<IUser, 'id'>): Promise<IUser>;
}
