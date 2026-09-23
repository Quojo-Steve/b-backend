import { App } from './app';
import { env } from './config/env.config';
import { Logger } from './utils/Logger';
import { container } from './composition/container';

const logger = new Logger('Server');

async function bootstrap(): Promise<void> {
  if (container.prismaService) {
    await container.prismaService.connect();
  }

  const app = new App();

  const server = app.instance.listen(env.port, () => {
    logger.info(`BRACE backend listening on port ${env.port}`, {
      environment: env.nodeEnv,
      persistence: env.useDatabase ? 'mysql' : 'in-memory',
    });
  });

  const shutdown = (signal: string): void => {
    logger.info(`Received ${signal}, shutting down gracefully.`);
    server.close(() => {
      void (async () => {
        if (container.prismaService) {
          await container.prismaService.disconnect();
        }
        logger.info('Server closed. Exiting process.');
        process.exit(0);
      })();
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason: String(reason) });
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start server', {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
