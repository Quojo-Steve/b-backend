import { Request, Response } from 'express';
import { env } from '../config/env.config';

/**
 * Serves a human/machine-readable directory of the API at GET /.
 * Kept as a plain object built from what is actually mounted in app.ts,
 * rather than generated reflectively, so it is simple to reason about and
 * cannot silently drift into describing endpoints that don't exist -
 * update this alongside routes/index.ts when a module is added.
 */
export class RootController {
  public info = (_req: Request, res: Response): void => {
    res.status(200).json({
      name: 'BRACE Digital Platform REST API Backend',
      status: 'operational',
      version: '1.0.0',
      environment: env.nodeEnv,
      description:
        'Layered, SOLID controller-service-repository architecture for the BRACE Initiative ' +
        'application layer (accounts, workflows, applications). Designed for consumption by ' +
        'external frontend and CMS-side applications over a versioned REST contract.',
      documentation: {
        interactive: '/docs',
        openApiSpec: '/openapi.json',
      },
      cors: {
        enabled: true,
        allowedOrigin: env.corsOrigin,
        allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      },
      endpoints: {
        health: {
          main: 'GET /api/v1/health (or /health)',
          liveness: 'GET /api/v1/health/live (or /health/live, /live)',
          readiness: 'GET /api/v1/health/ready (or /health/ready, /ready)',
        },
        auth: {
          login: 'POST /api/v1/auth/login (or /auth/login, /login)',
          register: 'POST /api/v1/auth/register (or /auth/register, /register)',
          me: 'GET /api/v1/auth/me (or /auth/me, /me) [Bearer token required]',
          logout: 'POST /api/v1/auth/logout (or /auth/logout, /logout)',
          users: 'GET /api/v1/auth/users (or /auth/users, /users) [Protected: super_admin, technical_reviewer]',
        },
        partners: {
          list: 'GET /api/v1/partners (or /partners)',
          getById: 'GET /api/v1/partners/:id (or /partners/:id)',
          byCountry: 'GET /api/v1/partners/country/:country (or /partners/country/:country)',
        },
        trainings: {
          submitApplication: 'POST /api/v1/trainings/applications',
          listApplications: 'GET /api/v1/trainings/applications [Protected: super_admin, country_coordinator, technical_reviewer]',
          getApplication: 'GET /api/v1/trainings/applications/:id [Protected: super_admin, country_coordinator, technical_reviewer]',
          reviewApplication: 'PATCH /api/v1/trainings/applications/:id/review [Protected: country_coordinator, super_admin]',
        },
      },
    });
  };
}
