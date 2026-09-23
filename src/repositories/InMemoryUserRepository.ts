import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { IUser, UserRole } from '../types/user.types';
import { IUserRepository } from './IUserRepository';

/**
 * Placeholder persistence layer so the API is runnable end-to-end before a
 * real database is provisioned. Passwords are hashed exactly as they would
 * be in production; only the storage medium is temporary.
 *
 * Demo credentials (development only):
 *   admin@brace-initiative.org / ChangeMe123!
 */
export class InMemoryUserRepository implements IUserRepository {
  private readonly users: Map<string, IUser> = new Map();

  constructor() {
    const seedHash = bcrypt.hashSync('ChangeMe123!', 10);

    const seedUsers: IUser[] = [
      {
        id: 'usr_001',
        email: 'admin@brace-initiative.org',
        passwordHash: seedHash,
        fullName: 'AGENDA Tanzania Administrator',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
      {
        id: 'usr_002',
        email: 'reviewer@oeko-institut.de',
        passwordHash: seedHash,
        fullName: 'Oeko-Institut Technical Reviewer',
        role: UserRole.TECHNICAL_REVIEWER,
        isActive: true,
      },
      {
        id: 'usr_003',
        email: 'coordinator.gh@brace-initiative.org',
        passwordHash: seedHash,
        fullName: 'Ghana Country Coordinator',
        role: UserRole.COUNTRY_COORDINATOR,
        countryAffiliation: 'Ghana',
        isActive: true,
      },
    ];

    seedUsers.forEach((user) => this.users.set(user.id, user));
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    const match = Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    return match ?? null;
  }

  public async findById(id: string): Promise<IUser | null> {
    return this.users.get(id) ?? null;
  }

  public async findAll(): Promise<IUser[]> {
    return Array.from(this.users.values());
  }

  public async create(userData: Omit<IUser, 'id'>): Promise<IUser> {
    const user: IUser = {
      ...userData,
      id: `usr_${randomUUID().slice(0, 8)}`,
    };
    this.users.set(user.id, user);
    return user;
  }
}
