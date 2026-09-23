import type { PrismaClient, UserRole as PrismaUserRole } from '@prisma/client';
import { IUser, UserRole } from '../types/user.types';
import { IUserRepository } from './IUserRepository';

/**
 * MySQL-backed implementation of IUserRepository, via Prisma.
 *
 * Implements the exact same contract as InMemoryUserRepository, so
 * AuthService (and anything else depending on IUserRepository) works
 * unchanged regardless of which one the composition root wires up.
 *
 * Domain <-> persistence mapping: the app's own `UserRole` enum
 * (src/types/user.types.ts) uses lowercase snake_case values
 * ('super_admin', ...) because that is what the rest of the codebase
 * (JWTs, existing seed data, API responses) already expects. Prisma's
 * generated enum uses SCREAMING_CASE identifiers. Rather than changing
 * either, this repository is the single place that translates between
 * them, so the mismatch never leaks into services or controllers.
 */
export class PrismaUserRepository implements IUserRepository {
  private static readonly ROLE_TO_DOMAIN: Record<PrismaUserRole, UserRole> = {
    SUPER_ADMIN: UserRole.SUPER_ADMIN,
    WEB_MANAGER: UserRole.WEB_MANAGER,
    TECHNICAL_REVIEWER: UserRole.TECHNICAL_REVIEWER,
    COUNTRY_COORDINATOR: UserRole.COUNTRY_COORDINATOR,
    CONSORTIUM_PARTNER: UserRole.CONSORTIUM_PARTNER,
    APPLICANT: UserRole.APPLICANT,
  };

  private static readonly ROLE_TO_PRISMA: Record<UserRole, PrismaUserRole> = {
    [UserRole.SUPER_ADMIN]: 'SUPER_ADMIN',
    [UserRole.WEB_MANAGER]: 'WEB_MANAGER',
    [UserRole.TECHNICAL_REVIEWER]: 'TECHNICAL_REVIEWER',
    [UserRole.COUNTRY_COORDINATOR]: 'COUNTRY_COORDINATOR',
    [UserRole.CONSORTIUM_PARTNER]: 'CONSORTIUM_PARTNER',
    [UserRole.APPLICANT]: 'APPLICANT',
  };

  constructor(private readonly prisma: PrismaClient) {}

  public async findByEmail(email: string): Promise<IUser | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return record ? this.toDomain(record) : null;
  }

  public async findById(id: string): Promise<IUser | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  public async findAll(): Promise<IUser[]> {
    const records = await this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    return records.map((record) => this.toDomain(record));
  }

  public async create(userData: Omit<IUser, 'id'>): Promise<IUser> {
    const record = await this.prisma.user.create({
      data: {
        email: userData.email.toLowerCase(),
        passwordHash: userData.passwordHash,
        fullName: userData.fullName,
        role: PrismaUserRepository.ROLE_TO_PRISMA[userData.role],
        countryAffiliation: userData.countryAffiliation,
        isActive: userData.isActive,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: {
    id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    role: PrismaUserRole;
    countryAffiliation: string | null;
    isActive: boolean;
  }): IUser {
    return {
      id: record.id,
      email: record.email,
      passwordHash: record.passwordHash,
      fullName: record.fullName,
      role: PrismaUserRepository.ROLE_TO_DOMAIN[record.role],
      countryAffiliation: record.countryAffiliation ?? undefined,
      isActive: record.isActive,
    };
  }
}
