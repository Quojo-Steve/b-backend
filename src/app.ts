import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { apiRouter } from './routes';
import { healthRouter } from './routes/health.routes';
import { authRouter } from './routes/auth.routes';
import { partnersRouter } from './routes/partners.routes';
import { errorHandlerMiddleware } from './middlewares/errorHandler.middleware';
import { notFoundMiddleware } from './middlewares/notFound.middleware';
import { requestLoggerMiddleware } from './middlewares/requestLogger.middleware';
import { env } from './config/env.config';
import { openApiDocument } from './docs/openapi';
import { RootController } from './controllers/RootController';
import { authenticate } from './middlewares/auth.middleware';
import { container } from './composition/container';

/**
 * Wraps Express app construction in a class so middleware/route wiring is
 * explicit, ordered, and easy to extend or test in isolation from the
 * HTTP server (see server.ts).
 */
export class App {
  public readonly instance: Application;
  private readonly rootController = new RootController();

  constructor() {
    this.instance = express();
    this.registerGlobalMiddleware();
    this.registerDocumentation();
    this.registerRoutes();
    this.registerErrorHandling();
  }

  private registerGlobalMiddleware(): void {
    // Swagger UI serves its own inline styles/scripts; relax the default
    // CSP only for the /docs path rather than disabling it globally.
    this.instance.use((req, res, next) => {
      if (req.path.startsWith('/docs')) {
        helmet({ contentSecurityPolicy: false })(req, res, next);
      } else {
        helmet()(req, res, next);
      }
    });
    this.instance.use(cors({ origin: env.corsOrigin }));
    this.instance.use(express.json());
    this.instance.use(express.urlencoded({ extended: true }));
    this.instance.use(morgan(env.isProduction ? 'combined' : 'dev'));

    // Structured, per-request audit log (method, path, status, duration,
    // caller identity). See requestLogger.middleware.ts for why this runs
    // before auth yet still captures req.user correctly.
    this.instance.use(requestLoggerMiddleware);
  }

  /**
   * Serves the OpenAPI contract as raw JSON and as an interactive Swagger
   * UI, so the API can be explored and tried out in a browser without a
   * separate client.
   */
  private registerDocumentation(): void {
    this.instance.get('/openapi.json', (_req, res) => res.status(200).json(openApiDocument));
    this.instance.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
      customSiteTitle: 'BRACE Digital Platform API Docs',
    }));
  }

  private registerRoutes(): void {
    this.instance.get('/', this.rootController.info);

    // Versioned API (source of truth) plus an unversioned alias.
    this.instance.use('/api/v1', apiRouter);
    this.instance.use('/api', apiRouter);

    // Root-level convenience aliases. These resolve to the exact same
    // controller/service/repository singletons as the /api/v1 routes
    // (see composition/container.ts), so there is a single source of
    // truth for data - only the URL differs.
    this.instance.use('/health', healthRouter);
    this.instance.get('/live', container.healthController.live);
    this.instance.get('/ready', container.healthController.ready);

    this.instance.use('/auth', authRouter);
    this.instance.post('/login', container.authController.login);
    this.instance.post('/register', container.authController.register);
    this.instance.get('/me', authenticate, container.authController.me);
    this.instance.post('/logout', container.authController.logout);

    this.instance.use('/partners', partnersRouter);
  }

  private registerErrorHandling(): void {
    // Order matters: 404 handler first, then the error handler last.
    this.instance.use(notFoundMiddleware);
    this.instance.use(errorHandlerMiddleware);
  }
}
