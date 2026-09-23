import { IUserRepository } from '../repositories/IUserRepository';
import { IPartnerRepository } from '../repositories/IPartnerRepository';
import { ITrainingApplicationRepository } from '../repositories/ITrainingApplicationRepository';
import { InMemoryUserRepository } from '../repositories/InMemoryUserRepository';
import { InMemoryPartnerRepository } from '../repositories/InMemoryPartnerRepository';
import { InMemoryTrainingApplicationRepository } from '../repositories/InMemoryTrainingApplicationRepository';
import { InMemoryNewsletterRepository } from '../repositories/InMemoryNewsletterRepository';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { PrismaPartnerRepository } from '../repositories/PrismaPartnerRepository';
import { PrismaTrainingApplicationRepository } from '../repositories/PrismaTrainingApplicationRepository';
import { PrismaNewsletterRepository } from '../repositories/PrismaNewsletterRepository';
import { INewsletterRepository } from '../repositories/INewsletterRepository';
import { IEmailService } from '../services/email/IEmailService';
import { ConsoleEmailService } from '../services/email/ConsoleEmailService';
import { SmtpEmailService } from '../services/email/SmtpEmailService';
import { TokenService } from '../utils/TokenService';
import { AuthService } from '../services/AuthService';
import { PartnerService } from '../services/PartnerService';
import { TrainingApplicationService } from '../services/TrainingApplicationService';
import { NewsletterService } from '../services/NewsletterService';
import { HealthController } from '../controllers/HealthController';
import { AuthController } from '../controllers/AuthController';
import { PartnersController } from '../controllers/PartnersController';
import { TrainingsController } from '../controllers/TrainingsController';
import { NewslettersController } from '../controllers/NewslettersController';
import { env } from '../config/env.config';
import { PrismaService } from '../config/prisma';
import { Logger } from '../utils/Logger';

const logger = new Logger('CompositionRoot');

/**
 * Wires every repository -> service -> controller exactly once for the
 * lifetime of the process. Route files (and any alias/shortcut routes)
 * import controllers from here rather than constructing their own copies,
 * so the same data is visible regardless of which path a request came in
 * through (e.g. bare `/register` vs `/api/v1/auth/register`).
 *
 * Persistence is selected once, here, based on whether DATABASE_URL is
 * configured (see env.useDatabase): MySQL-backed (Prisma) repositories
 * when it is, in-memory placeholders otherwise. Every repository is
 * constructed behind its interface (IUserRepository, etc.), so services
 * and controllers never know - or need to know - which one is active.
 */
class CompositionRoot {
  // Prisma is only instantiated when actually needed, so the app can
  // still start (against the in-memory repositories) without a
  // DATABASE_URL configured, e.g. for a first local run.
  public readonly prismaService: PrismaService | null = env.useDatabase
    ? PrismaService.getInstance()
    : null;

  // Repositories
  public readonly userRepository: IUserRepository = this.prismaService
    ? new PrismaUserRepository(this.prismaService.client)
    : new InMemoryUserRepository();

  public readonly partnerRepository: IPartnerRepository = this.prismaService
    ? new PrismaPartnerRepository(this.prismaService.client)
    : new InMemoryPartnerRepository();

  public readonly trainingApplicationRepository: ITrainingApplicationRepository = this
    .prismaService
    ? new PrismaTrainingApplicationRepository(this.prismaService.client)
    : new InMemoryTrainingApplicationRepository();

  public readonly newsletterRepository: INewsletterRepository = this.prismaService
    ? new PrismaNewsletterRepository(this.prismaService.client)
    : new InMemoryNewsletterRepository();

  // Cross-cutting utilities
  public readonly tokenService = new TokenService();

  // Email is selected the same way persistence is: a real SMTP transport
  // when SMTP_HOST is configured, otherwise a console transport that logs
  // instead of sending - so newsletter sending is fully testable with zero
  // external setup, and NewsletterService never needs to know which one
  // is active.
  public readonly emailService: IEmailService = env.useSmtp
    ? new SmtpEmailService()
    : new ConsoleEmailService();

  // Services
  public readonly authService = new AuthService(this.userRepository, this.tokenService);
  public readonly partnerService = new PartnerService(this.partnerRepository);
  public readonly trainingApplicationService = new TrainingApplicationService(
    this.trainingApplicationRepository,
  );
  public readonly newsletterService = new NewsletterService(
    this.newsletterRepository,
    this.emailService,
  );

  // Controllers
  public readonly healthController = new HealthController();
  public readonly authController = new AuthController(this.authService);
  public readonly partnersController = new PartnersController(this.partnerService);
  public readonly trainingsController = new TrainingsController(this.trainingApplicationService);
  public readonly newslettersController = new NewslettersController(this.newsletterService);
}

logger.info(`Persistence layer: ${env.useDatabase ? 'MySQL (Prisma)' : 'in-memory'}`);
logger.info(`Email transport: ${env.useSmtp ? 'SMTP' : 'console (logged, not delivered)'}`);

export const container = new CompositionRoot();
