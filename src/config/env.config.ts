import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralised, typed access to environment configuration.
 * Fails fast at startup if a required variable is missing, rather than
 * surfacing an undefined value deep inside a service at request time.
 */
class EnvironmentConfig {
  public readonly nodeEnv: string;
  public readonly port: number;
  public readonly jwtSecret: string;
  public readonly jwtExpiresIn: string;
  public readonly corsOrigin: string;
  public readonly databaseUrl?: string;
  public readonly smtpHost?: string;
  public readonly smtpPort: number;
  public readonly smtpSecure: boolean;
  public readonly smtpUser?: string;
  public readonly smtpPassword?: string;
  public readonly mailFrom: string;

  constructor() {
    this.nodeEnv = this.getOptional('NODE_ENV', 'development');
    this.port = Number(this.getOptional('PORT', '4000'));
    this.jwtSecret = this.getRequired('JWT_SECRET');
    this.jwtExpiresIn = this.getOptional('JWT_EXPIRES_IN', '1h');
    this.corsOrigin = this.getOptional('CORS_ORIGIN', '*');
    this.databaseUrl = process.env.DATABASE_URL || undefined;
    this.smtpHost = process.env.SMTP_HOST || undefined;
    this.smtpPort = Number(this.getOptional('SMTP_PORT', '587'));
    this.smtpSecure = this.getOptional('SMTP_SECURE', 'false') === 'true';
    this.smtpUser = process.env.SMTP_USER || undefined;
    this.smtpPassword = process.env.SMTP_PASSWORD || undefined;
    this.mailFrom = this.getOptional('MAIL_FROM', 'BRACE Digital Platform <no-reply@brace-initiative.org>');
  }

  /**
   * Whether SMTP credentials are configured. Used by the composition root
   * to choose the real SmtpEmailService over ConsoleEmailService, so
   * newsletter sending is testable end-to-end (logged, not delivered)
   * before any mail provider is set up.
   */
  public get useSmtp(): boolean {
    return Boolean(this.smtpHost);
  }

  /**
   * Whether a database connection string is configured. Used by the
   * composition root to choose Prisma-backed (MySQL) repositories over
   * the in-memory placeholders, so the app still runs without a database
   * during early local development.
   */
  public get useDatabase(): boolean {
    return Boolean(this.databaseUrl);
  }

  public get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  private getRequired(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  private getOptional(key: string, fallback: string): string {
    return process.env[key] ?? fallback;
  }
}

export const env = new EnvironmentConfig();
