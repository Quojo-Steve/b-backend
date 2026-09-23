import bcrypt from 'bcryptjs';
import { IUserRepository } from '../repositories/IUserRepository';
import { TokenService } from '../utils/TokenService';
import { ConflictError, NotFoundError, UnauthorizedError } from '../errors/AppError';
import { IUser, PublicUser, UserRole } from '../types/user.types';
import { RegisterDto } from '../types/auth.schemas';
import { Logger } from '../utils/Logger';

export interface LoginResult {
  user: PublicUser;
  accessToken: string;
  expiresIn: string;
}

/**
 * Encapsulates authentication business logic. Depends only on the
 * IUserRepository interface and TokenService, both supplied by the
 * constructor - this keeps AuthService unit-testable in isolation
 * (mock the repository, no real DB or JWT secret required).
 */
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private static readonly SALT_ROUNDS = 10;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
  ) {}

  public async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.isActive) {
      this.logger.warn('Login attempt for unknown or inactive account', { email });
      throw new UnauthorizedError('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      this.logger.warn('Login attempt with incorrect password', { email });
      throw new UnauthorizedError('Invalid email or password.');
    }

    return this.buildLoginResult(user);
  }

  /**
   * Public self-registration always creates an APPLICANT account.
   * Any other role must be provisioned by a super admin via a future
   * admin-only user-management endpoint.
   */
  public async register(dto: RegisterDto): Promise<LoginResult> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, AuthService.SALT_ROUNDS);

    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      role: UserRole.APPLICANT,
      countryAffiliation: dto.countryAffiliation,
      isActive: true,
    });

    this.logger.info('New applicant account registered', { userId: user.id });

    return this.buildLoginResult(user);
  }

  public async getPublicUserById(id: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    return this.toPublicUser(user);
  }

  /**
   * Intended for staff-only listing (see authorize() on the route).
   */
  public async listUsers(): Promise<PublicUser[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => this.toPublicUser(user));
  }

  private buildLoginResult(user: IUser): LoginResult {
    const accessToken = this.tokenService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    this.logger.info('User authenticated successfully', { userId: user.id, role: user.role });

    return {
      user: this.toPublicUser(user),
      accessToken,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    };
  }

  private toPublicUser(user: IUser): PublicUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
