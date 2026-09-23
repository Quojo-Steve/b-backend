import { NextFunction, Request, Response } from 'express';
import { Logger } from '../utils/Logger';

const logger = new Logger('HTTP');

/**
 * Logs one structured line to the console for every request the API
 * receives, once the response has finished sending. This is deliberately
 * separate from morgan (which stays for a human-friendly dev tail):
 * this logger captures the identity of the caller.
 *
 * It is mounted before routes/auth run, but reads `req.user` inside the
 * `res.on('finish', ...)` callback rather than immediately - by the time
 * a response has finished, any `authenticate` middleware further down the
 * chain has already had the chance to populate `req.user`, so authenticated
 * requests are correctly attributed even though this middleware runs first.
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logger.info(`${req.method} ${req.originalUrl} -> ${res.statusCode}`, {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      user: req.user
        ? { id: req.user.sub, email: req.user.email, role: req.user.role }
        : 'anonymous',
    });
  });

  next();
}
