import type { PrismaClient as PrismaClientType } from '@prisma/client';
import { env } from './env.config';
import { Logger } from '../utils/Logger';

/**
 * Owns the single PrismaClient instance for the process.
 *
 * Wrapping PrismaClient (rather than constructing it inline wherever it's
 * needed) gives us one place to configure query/error logging, and one
 * place to manage connect/disconnect lifecycle from server.ts - the same
 * reasoning as the existing `Logger` and `TokenService` utilities.
 *
 * The import above is `import type` (erased at compile time), and the
 * real `PrismaClient` constructor is loaded with `require(...)` only
 * inside the constructor below - which itself only runs when
 * `env.useDatabase` is true (see composition/container.ts). That means
 * this file never touches the generated `@prisma/client` output at all
 * when the app is running against the in-memory repositories, so a
 * missing/stale `prisma generate` output can't crash app startup in that
 * mode - only an actual attempt to use MySQL requires it to exist.
 */
export class PrismaService {
  private static instance: PrismaService;
  private readonly logger = new Logger(PrismaService.name);
  public readonly client: PrismaClientType;

  private constructor() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('@prisma/client');
    this.client = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    // Prisma's own event types for 'query'/'warn'/'error' aren't part of
    // the public generic overloads, hence the narrow casts below.
    this.client.$on('query' as never, (event: { query: string; params: string; duration: number }) => {
      if (!env.isProduction) {
        this.logger.debug('Prisma query', {
          query: event.query,
          params: event.params,
          durationMs: event.duration,
        });
      }
    });

    this.client.$on('warn' as never, (event: { message: string }) => {
      this.logger.warn('Prisma warning', { message: event.message });
    });

    this.client.$on('error' as never, (event: { message: string }) => {
      this.logger.error('Prisma error', { message: event.message });
    });
  }

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  public async connect(): Promise<void> {
    await this.client.$connect();
    this.logger.info('Connected to MySQL via Prisma');
  }

  public async disconnect(): Promise<void> {
    await this.client.$disconnect();
    this.logger.info('Disconnected from MySQL');
  }
}
