import { Request, Response } from 'express';

/**
 * Reports basic service liveness/readiness. Kept dependency-free so it can
 * answer even if downstream dependencies (DB, etc.) are degraded - useful
 * for load balancer / uptime / orchestrator checks.
 */
export class HealthController {
  private readonly startedAt: Date = new Date();

  /** General-purpose status, including uptime - for humans and dashboards. */
  public check = (_req: Request, res: Response): void => {
    res.status(200).json({
      status: 'ok',
      service: 'brace-digital-platform-backend',
      uptimeSeconds: this.uptimeSeconds(),
      timestamp: new Date().toISOString(),
    });
  };

  /** Liveness: "is the process running at all?" - never checks dependencies. */
  public live = (_req: Request, res: Response): void => {
    res.status(200).json({ status: 'alive' });
  };

  /**
   * Readiness: "is the process ready to accept traffic?" - today this is
   * equivalent to liveness since there are no external dependencies yet
   * (no database, no downstream services). Once one is added, check it
   * here and return 503 when it's unreachable.
   */
  public ready = (_req: Request, res: Response): void => {
    res.status(200).json({ status: 'ready', uptimeSeconds: this.uptimeSeconds() });
  };

  private uptimeSeconds(): number {
    return Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
  }
}
